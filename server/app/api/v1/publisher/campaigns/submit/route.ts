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
import { refreshSocialAccessToken } from "../../../../../../lib/social-verification";

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
    const { campaignId, proofImages, proofUrls, views, notes, platformEvidence } = body;

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

    let verifiedPlatformEvidence: { provider: string; mediaId: string; views: number; checkedAt: string; url?: string } | null = null;
    if (platformEvidence !== undefined && platformEvidence !== null) {
      if (!platformEvidence || !["tiktok", "instagram"].includes(platformEvidence.provider) || typeof platformEvidence.mediaId !== "string") {
        return handleResponse(400, "Invalid connected-platform evidence selection");
      }
      const normalizedPlatform = campaign.platform.toLowerCase();
      if (normalizedPlatform !== "all" && !normalizedPlatform.includes(platformEvidence.provider)) {
        return handleResponse(400, "Selected evidence platform does not match this campaign");
      }
      try {
        const connected = await (prisma as any).publisherSocialConnection.findUnique({
          where: { publisherId_provider: { publisherId: publisher.id, provider: platformEvidence.provider } },
        });
        if (!connected) return handleResponse(400, `Connect your ${platformEvidence.provider} account before using its metrics`);
        const accessToken = await refreshSocialAccessToken(connected);
        let metricViews: number | null = null;
        let evidenceUrl: string | undefined;
        if (platformEvidence.provider === "tiktok") {
          const response = await fetch("https://open.tiktokapis.com/v2/video/query/?fields=id,share_url,view_count", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ filters: { video_ids: [platformEvidence.mediaId] } }),
          });
          const result = await response.json();
          const video = result.data?.videos?.find((item: any) => item.id === platformEvidence.mediaId);
          if (!response.ok || result.error?.code !== "ok" || !video) throw new Error("TikTok could not verify that video belongs to the connected account");
          metricViews = Number(video.view_count);
          evidenceUrl = video.share_url;
        } else {
          const storyUrl = new URL(`https://graph.facebook.com/v26.0/${connected.accountId}/stories`);
          storyUrl.search = new URLSearchParams({ fields: "id", access_token: accessToken }).toString();
          const storiesResponse = await fetch(storyUrl);
          const stories = await storiesResponse.json();
          if (!storiesResponse.ok || !(stories.data || []).some((item: any) => item.id === platformEvidence.mediaId)) {
            throw new Error("Instagram Story is no longer available to verify. Submit while it is active.");
          }
          const insightUrl = new URL(`https://graph.facebook.com/v26.0/${platformEvidence.mediaId}/insights`);
          insightUrl.search = new URLSearchParams({ metric: "views", access_token: accessToken }).toString();
          const insightResponse = await fetch(insightUrl);
          const insight = await insightResponse.json();
          if (!insightResponse.ok) throw new Error(insight.error?.message || "Instagram Story insights are unavailable");
          const metric = (insight.data || []).find((entry: any) => entry.name === "views");
          const value = metric?.values?.[0]?.value ?? metric?.total_value?.value;
          metricViews = Number.isFinite(Number(value)) ? Number(value) : null;
        }
        if (metricViews === null || !Number.isSafeInteger(metricViews) || metricViews < 0) throw new Error("The platform did not return a valid view count");
        verifiedPlatformEvidence = { provider: platformEvidence.provider, mediaId: platformEvidence.mediaId, views: metricViews, checkedAt: new Date().toISOString(), ...(evidenceUrl ? { url: evidenceUrl } : {}) };
      } catch (error) {
        return handleResponse(502, error instanceof Error ? error.message : "Could not verify connected-platform metrics");
      }
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
      } else if (verifiedPlatformEvidence && verifiedPlatformEvidence.views !== viewsCount) {
        finalStatus = "REJECTED";
        rejectionReason = `The connected ${verifiedPlatformEvidence.provider} metric (${verifiedPlatformEvidence.views}) does not match the submitted view count (${viewsCount}).`;
        autoActionMessage = "Claim rejected automatically: connected-platform view count mismatch";
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
        platformEvidence: verifiedPlatformEvidence ?? undefined,
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
