// app/api/v1/campaigns/[id]/route.ts - FIXED
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    // Await the params first
    const { id: campaignId } = await params;

    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdvertiser = user.roles.includes("ADVERTISER");
    if (!isAdvertiser) {
      return handleResponse(403, "Advertiser access required");
    }

    // Get campaign with details
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        userId: user.userId, // Ensure user owns the campaign
      },
      include: {
        adCreative: true,
      },
    });

    if (!campaign) {
      return handleResponse(404, "Campaign not found");
    }

    // Get all publisher earnings for this campaign
    const publishers = await prisma.publisherEarning.findMany({
      where: { campaignId },
      include: {
        publisher: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { claimedAt: "desc" },
    });

    // Calculate analytics
    const totalPublishers = publishers.length;
    const totalViews = publishers.reduce((sum, p) => sum + p.views, 0);
    const totalSpent = publishers
      .filter((p) => p.status === "APPROVED" || p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    const completionRate =
      campaign.targetViews > 0
        ? Math.min((totalViews / campaign.targetViews) * 100, 100)
        : 0;

    const averageViewsPerPublisher =
      totalPublishers > 0 ? Math.round(totalViews / totalPublishers) : 0;

    const publishersByStatus = {
      pending: publishers.filter((p) => p.status === "PENDING").length,
      approved: publishers.filter((p) => p.status === "APPROVED").length,
      paid: publishers.filter((p) => p.status === "PAID").length,
      rejected: publishers.filter((p) => p.status === "REJECTED").length,
    };

    const analytics = {
      totalPublishers,
      totalViews,
      totalSpent,
      completionRate: Math.round(completionRate * 100) / 100,
      averageViewsPerPublisher,
      publishersByStatus,
    };

    return handleResponse(200, "Campaign details retrieved", {
      campaign,
      publishers,
      analytics,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
