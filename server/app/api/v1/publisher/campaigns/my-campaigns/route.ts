// app/api/v1/publisher/my-campaigns/route.ts
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const userId = user.userId;
    const isPublisher = user.roles.includes("PUBLISHER");

    if (!isPublisher) {
      return handleResponse(403, "Only publishers can access campaigns");
    }

    // Get publisher record
    const publisher = await prisma.publisher.findUnique({
      where: { userId },
    });

    if (!publisher) {
      return handleResponse(404, "Publisher profile not found");
    }

    // Get the search params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause for filtering
    const where: any = {
      publisherId: publisher.id,
    };

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    // Get publisher's accepted campaigns (earnings)
    const publisherEarnings = await prisma.publisherEarning.findMany({
      where,
      include: {
        campaign: {
          include: {
            adCreative: {
              select: {
                id: true,
                fileUrl: true,
                text: true,
              },
            },
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        claimedAt: "desc", // Show most recent first
      },
    });

    // Format the response
    const acceptedCampaigns = publisherEarnings.map((earning) => {
      const progress =
        earning.campaign.targetViews > 0
          ? (earning.views / earning.campaign.targetViews) * 100
          : 0;

      return {
        id: earning.id, // PublisherEarning ID
        campaignId: earning.campaignId,
        title: earning.campaign.title,
        description: earning.campaign.description,
        platform: earning.campaign.platform,
        category: earning.campaign.category,
        targetViews: earning.campaign.targetViews,
        status: earning.status, // PENDING, APPROVED, REJECTED, PAID
        amount: earning.amount,
        views: earning.views,
        proofImage: earning.proofImage,
        extractedViews: earning.extractedViews,
        claimedAt: earning.claimedAt,
        approvedAt: earning.approvedAt,
        paidAt: earning.paidAt,
        adCreative: earning.campaign.adCreative,
        advertiser: earning.campaign.user,
        progress: Math.min(100, Math.round(progress * 100) / 100), // Cap at 100%
        canClaimReward:
          earning.status === "PENDING" && earning.proofImage === "",
        canSubmitProof:
          earning.status === "PENDING" && earning.proofImage === "",
        isCompleted: earning.status === "APPROVED" || earning.status === "PAID",
        isRejected: earning.status === "REJECTED",
        daysSinceClaim: Math.floor(
          (new Date().getTime() - new Date(earning.claimedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
    });

    // Calculate stats
    const stats = {
      total: acceptedCampaigns.length,
      pending: acceptedCampaigns.filter((c) => c.status === "PENDING").length,
      approved: acceptedCampaigns.filter((c) => c.status === "APPROVED").length,
      paid: acceptedCampaigns.filter((c) => c.status === "PAID").length,
      rejected: acceptedCampaigns.filter((c) => c.status === "REJECTED").length,
      totalEarnings: acceptedCampaigns
        .filter((c) => c.status === "APPROVED" || c.status === "PAID")
        .reduce((sum, c) => sum + c.amount, 0),
      pendingEarnings: acceptedCampaigns
        .filter((c) => c.status === "PENDING")
        .reduce((sum, c) => sum + c.amount, 0),
    };

    // In your backend API for publisher campaigns
    // The status should be set based on the PublisherEarning status
    const publisherCampaigns = await prisma.publisherEarning.findMany({
      where: { publisherId: publisher.id },
      include: {
        campaign: {
          include: {
            adCreative: true,
          },
        },
      },
    });

    // Transform the data to include the correct status
    const transformedCampaigns = publisherCampaigns.map((earning) => ({
      id: earning.id,
      campaignId: earning.campaignId,
      title: earning.campaign.title,
      description: earning.campaign.description,
      platform: earning.campaign.platform,
      targetViews: earning.campaign.targetViews,
      views: earning.campaign.views,
      imageUrl: earning.stampedCreativeUrl,
      pubViews: earning.views, // The views claimed by publisher
      amount: earning.amount,
      status: earning.campaign.status, // This should be "PENDING", "APPROVED", etc.
      progress: Math.min(
        (earning.campaign.views / earning.campaign.targetViews) * 100,
        100
      ),
      claimedAt: earning.claimedAt,
      canSubmitProof: earning.status === "ACTIVE", // Only active campaigns can submit proof
      adCreative: earning.campaign.adCreative,
    }));

    console.log("publisherCampaigns", transformedCampaigns);

    return handleResponse(200, "Accepted campaigns retrieved", {
      campaigns: transformedCampaigns,
      stats,
      total: transformedCampaigns.length,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
