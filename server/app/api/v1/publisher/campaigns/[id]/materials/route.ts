// app/api/v1/publisher/campaigns/[id]/materials/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../../lib";
import { prisma } from "../../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../../lib/user";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const userId = user.userId;
    const isPublisher = user.roles.includes("publisher");

    if (!isPublisher) {
      return handleResponse(
        403,
        "Only publishers can access campaign materials"
      );
    }

    const campaignId = params.id;

    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        adCreative: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!campaign) {
      return handleResponse(404, "Campaign not found");
    }

    if (campaign.status !== "ACTIVE") {
      return handleResponse(400, "Campaign is not active");
    }

    // Check if publisher has already claimed this campaign
    const existingClaim = await prisma.publisherEarning.findUnique({
      where: {
        publisherId_campaignId: {
          publisherId: userId,
          campaignId,
        },
      },
    });

    if (existingClaim) {
      return handleResponse(400, "You have already claimed this campaign");
    }

    // Calculate earnings info

    const remainingViews = campaign.targetViews - campaign.impressions;

    return handleResponse(200, "Campaign materials retrieved", {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        platform: campaign.platform,
        remainingViews,
        totalViews: campaign.targetViews,
        currentViews: campaign.impressions,
      },
      adCreative: campaign.adCreative,
      earnings: {
        platform: campaign.platform,
      },
      instructions: {
        whatsapp:
          "Post this as your WhatsApp status and take a screenshot after 24 hours showing the view count",
        instagram:
          "Post this as your Instagram story and take a screenshot showing the view count",
        twitter:
          "Post this as a tweet and take a screenshot showing the impressions",
        linkedin:
          "Post this on your LinkedIn feed and take a screenshot showing the views",
      }[campaign.platform],
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
