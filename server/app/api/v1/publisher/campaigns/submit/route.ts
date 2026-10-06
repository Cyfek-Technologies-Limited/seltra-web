// app/api/v1/publisher/campaigns/submit/route.ts - UPDATED with auto-approve/reject logic
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import { EarningsCalculator } from "../../../../../../lib/earnings-calculator";
import {
  doesProofCodeMatch,
  extractTextFromImageUrl,
  extractWhatsappViewsFromImageUrl,
  normalizeText,
} from "../../../../../../lib/ocr";
import {
  sendClaimApprovedEmail,
  sendClaimRejectedEmail,
} from "../../../../../../lib/email-service";
import {
  extractDataFromMultipleScreenshots,
  extractDataFromSocialScreenshot,
} from "../../../../../../lib/ocr-claude";

export async function POST(request: NextRequest) {
  try {
    console.log("starting claim submission...");
    // 1. check if user is looged in
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const userId = user.userId;
    const isPublisher = user.roles.includes("PUBLISHER");
    if (!isPublisher)
      return handleResponse(403, "Only publishers can claim campaigns");

    // 2. find publishe raccount
    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, username: true } },
        strikes: { where: { resolvedAt: null, severity: "STRIKE" } },
      },
    });

    if (!publisher) return handleResponse(403, "Publisher account not found");

    const body = await request.json();
    const { campaignId, proofImages, proofUrls, views, notes } = body;

    if (
      !campaignId ||
      !Array.isArray(proofImages) ||
      proofImages.length === 0 ||
      !views
    ) {
      return handleResponse(
        400,
        "Campaign ID, at least one proof image, and views count are required"
      );
    }

    const viewsCount = parseInt(views, 10);
    if (isNaN(viewsCount) || viewsCount <= 0) {
      return handleResponse(400, "Valid positive views count is required");
    }

    console.log("view count entered by publisher:", viewsCount);

    // 3. find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { adCreative: true, earnings: true },
    });

    if (!campaign) return handleResponse(404, "Campaign not found");
    if (campaign.status !== "ACTIVE")
      return handleResponse(400, "Campaign is not active");

    // 4. check if views count is accurate
    if (viewsCount > campaign.targetViews) {
      return handleResponse(400, "Claimed views cannot exceed campaign target");
    }

    const totalClaimedViews = campaign.earnings.reduce(
      (sum, e) => (e.status !== "REJECTED" ? sum + e.views : sum),
      0
    );

    const remainingViews = campaign.targetViews - totalClaimedViews;
    if (viewsCount > remainingViews) {
      return handleResponse(400, {
        error: "Claimed views exceed available campaign capacity",
        message: `Only ${remainingViews.toLocaleString()} views left`,
      });
    }

    const existingClaim = await prisma.publisherEarning.findFirst({
      where: { publisherId: publisher.id, campaignId },
    });

    if (!existingClaim) {
      return handleResponse(
        400,
        "Please accept the campaign first before submitting proof"
      );
    }

    if (existingClaim.status !== "ACTIVE") {
      return handleResponse(
        400,
        "Proof has already been submitted for this campaign"
      );
    }

    const remainingViewsExcludingThisClaim =
      remainingViews + existingClaim.views;
    if (viewsCount > remainingViewsExcludingThisClaim) {
      return handleResponse(400, {
        error: "Claimed views exceed your available capacity",
        message: `Only ${remainingViewsExcludingThisClaim.toLocaleString()} views available for you`,
      });
    }

    console.log("🔄 Updating existing claim with proof...");

    let ocrText = "";
    let ocrConfidence = 0;
    let codeMatched = false;
    let extractedViews: number | null = null;
    let isOcrSuccessfull = false;

    // Replace the entire OCR block in route.ts

    const isAllPlatforms = campaign.platform.toLowerCase() === "all";

    // ── Hard block: "all" campaigns require minimum 3 screenshots ──
    if (isAllPlatforms && proofImages.length < 3) {
      return handleResponse(400, {
        error: "Insufficient screenshots",
        message:
          "Campaigns targeting all platforms require at least 3 screenshots, one from each different social media platform.",
      });
    }

    try {
      const firstProofImageUrl = proofImages[0];
      if (!firstProofImageUrl)
        return handleResponse(400, "Proof image URL required");
      if (!existingClaim.proofCode)
        return handleResponse(400, "Proof code missing");

      if (isAllPlatforms) {
        // ── Multi-platform: analyze ALL screenshots ──
        const multiResult = await extractDataFromMultipleScreenshots(
          proofImages,
          existingClaim.proofCode
        );

        console.log(
          "Multi-screenshot OCR result:",
          JSON.stringify(multiResult, null, 2)
        );

        // Hard block: must have 3+ unique platforms
        if (multiResult.uniquePlatformCount < 3) {
          const found = multiResult.platforms.join(", ") || "none detected";
          return handleResponse(400, {
            error: "Platform diversity requirement not met",
            message: `This campaign requires screenshots from at least 3 different social media platforms. We detected: ${found}. Please add screenshots from more platforms.`,
          });
        }

        codeMatched =
          multiResult.proofCodeFound &&
          normalizeText(multiResult.proofCodeText ?? "") ===
            normalizeText(existingClaim.proofCode);

        extractedViews =
          multiResult.totalViews > 0 ? multiResult.totalViews : null;
        ocrText = multiResult.proofCodeText ?? "";
        ocrConfidence =
          multiResult.overallConfidence === "high"
            ? 90
            : multiResult.overallConfidence === "medium"
            ? 60
            : 30;
      } else {
        // ── Single platform: analyze first screenshot only ──
        const claudeResult = await extractDataFromSocialScreenshot(
          firstProofImageUrl,
          existingClaim.proofCode
        );

        console.log("Claude Vision OCR result:", claudeResult);

        codeMatched =
          claudeResult.proofCodeFound &&
          normalizeText(claudeResult.proofCodeText ?? "") ===
            normalizeText(existingClaim.proofCode);

        extractedViews = claudeResult.viewCount;
        ocrText = claudeResult.proofCodeText ?? "";
        ocrConfidence =
          claudeResult.confidence === "high"
            ? 90
            : claudeResult.confidence === "medium"
            ? 60
            : 30;
      }

      isOcrSuccessfull = true;
    } catch (ocrError) {
      console.error("❌ Claude Vision OCR failed:", ocrError);
      isOcrSuccessfull = false;
    }

    const earnings = await EarningsCalculator.calculateEarnings(
      campaignId,
      viewsCount
    );

    // ────────────────────────────────────────────────
    // NEW AUTO-APPROVE / AUTO-REJECT LOGIC
    // ────────────────────────────────────────────────

    let finalStatus: "PENDING" | "APPROVED" | "REJECTED" = "PENDING";
    let rejectionReason: string | null = null;
    let autoActionMessage = "Proof submitted – awaiting manual review";

    if (isOcrSuccessfull) {
      if (!codeMatched) {
        finalStatus = "REJECTED";
        rejectionReason = "You submitted the wrong advert.";
        autoActionMessage = "Claim rejected automatically: wrong advertisement";
      } else if (extractedViews === null) {
        finalStatus = "REJECTED";
        rejectionReason = isAllPlatforms
          ? "We could not extract view counts from your screenshots. Make sure each screenshot clearly shows the view count on the respective platform."
          : "Your screenshot does not show a visible view count. Please submit a clear screenshot showing the view count (eye icon or views number).";
        autoActionMessage =
          "Claim rejected: no view count found in screenshot(s)";
      } else if (extractedViews !== viewsCount) {
        finalStatus = "REJECTED";
        rejectionReason =
          "The view count you entered and the view count extracted from your screenshot do not match. " +
          "You can appeal by sending an email to admin@seltra.app for manual review.";
        autoActionMessage = "Claim rejected automatically: view count mismatch";
      } else {
        // codeMatched = true AND extractedViews === viewsCount — both verified
        finalStatus = "APPROVED";
        autoActionMessage =
          "Claim automatically approved: code matched and view count verified";
      }
    } else {
      // OCR completely failed → reject safely
      finalStatus = "REJECTED";
      rejectionReason =
        "Failed to process screenshot (OCR error). Please submit a clearer image.";
      autoActionMessage = "Claim rejected: could not process screenshot";
    }

    const updatedClaim = await prisma.publisherEarning.update({
      where: { id: existingClaim.id },
      data: {
        amount: earnings.amount,
        views: viewsCount,
        proofImages,
        proofUrls,
        extractedViews,
        ocrText,
        ocrConfidence,
        codeMatched,
        status: finalStatus,
        rejectionReason: rejectionReason, // null if approved
      },
      include: { campaign: { include: { adCreative: true } } },
    });

    console.log(
      "Claim updated with status:",
      finalStatus,
      rejectionReason ? `(${rejectionReason})` : ""
    );

    // ── If rejected, send email ────────────────────────────────────────
    if (finalStatus === "REJECTED" && publisher.user?.email) {
      await sendClaimRejectedEmail(
        publisher.user.email,
        publisher.user.username || "Publisher",
        campaign.title,
        rejectionReason || "Proof requirements not met."
      ).catch(console.error);
    }

    // ── If approved, increment campaign views, add to balance ──────────
    if (finalStatus === "APPROVED") {
      const newTotal = totalClaimedViews - existingClaim.views + viewsCount;

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          views: newTotal,
          ...(newTotal >= campaign.targetViews && {
            status: "COMPLETED",
            completedAt: new Date(),
          }),
        },
      });

      await prisma.publisherAccount.update({
        where: { publisherId: publisher.id },
        data: { availableBalance: { increment: earnings.amount } },
      });

      await sendClaimApprovedEmail(
        publisher.user.email,
        publisher.user.username || "Publisher",
        campaign.title
      ).catch(console.error);
    }

    // REJECTED: do nothing — views are not counted

    return handleResponse(200, autoActionMessage, {
      claim: updatedClaim,
      earnings,
      autoAction: finalStatus,
      message: autoActionMessage,
      verification: {
        codeMatched,
        extractedViews,
        claimedViews: viewsCount,
        ocrConfidence,
      },
      remainingViews: Math.max(
        0,
        remainingViewsExcludingThisClaim - viewsCount
      ),
    });
  } catch (error) {
    console.error("❌ Error in claim submission:", error);
    return handleCatch(error);
  }
}
