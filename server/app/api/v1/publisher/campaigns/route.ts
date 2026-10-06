// app/api/v1/publisher/campaigns/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const userId = user.userId;
    const isPublisher = user.roles.includes("publisher");

    if (!isPublisher) {
      return handleResponse(403, "Only publishers can access campaigns");
    }

    // Get ALL active campaigns that haven't been claimed by this publisher
    const availableCampaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
        // Exclude campaigns already claimed by this publisher
        earnings: {
          none: {
            publisherId: userId,
          },
        },
      },
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
          },
        },
        earnings: {
          select: {
            views: true,
          },
        },
        _count: {
          select: {
            earnings: true,
          },
        },
      },
      orderBy: {
        budget: "desc", // Show highest paying campaigns first
      },
    });

    // Calculate current views and remaining views
    const campaignsWithProgress = availableCampaigns.map((campaign) => {
      // Calculate total views from all publisher claims
      const currentViews = campaign.earnings.reduce(
        (sum, earning) => sum + earning.views,
        0
      );
      const remainingViews = Math.max(0, campaign.targetViews - currentViews);

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        platform: campaign.platform,
        budget: campaign.budget,
        targetViews: campaign.targetViews,
        currentViews, // Total views from all publisher claims
        status: campaign.status,
        createdAt: campaign.createdAt,
        adCreative: campaign.adCreative,
        advertiser: campaign.user,
        totalClaims: campaign._count.earnings,
        remainingViews,
        progress: (currentViews / campaign.targetViews) * 100,
        urgency:
          remainingViews < 100
            ? "high"
            : remainingViews < 500
            ? "medium"
            : "low",
        isAlmostComplete: remainingViews < 50,
      };
    });

    // Filter out campaigns that are completed (no remaining views)
    const activeCampaigns = campaignsWithProgress.filter(
      (campaign) => campaign.remainingViews > 0
    );

    return handleResponse(200, "Available campaigns retrieved", {
      campaigns: activeCampaigns,
      total: activeCampaigns.length,
      message:
        activeCampaigns.length === 0
          ? "No campaigns available at the moment. Check back later!"
          : `${activeCampaigns.length} active campaigns available`,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
