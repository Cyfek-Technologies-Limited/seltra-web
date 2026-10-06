// app/api/campaigns/[id]/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import {
  getCurrentUser,
  getFullUser,
  handleRoleAccess,
} from "../../../../../lib/user";
import { updateCampaignSchema } from "../../../../../lib/zod-schema";

interface UpdateCampaignData {
  name?: string;
  description?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getFullUser(request);
    console.log("user in campaigns:", user);
    const campaignId = params.id;
    const currentUserId = await getCurrentUser(request);
    const isAdmin = await handleRoleAccess(request, "admin");

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        adCreative: {
          select: {
            id: true,
            fileUrl: true,
            text: true,
            approved: true,
          },
        },
        earnings: {
          select: {
            publisherId: true,
            stampedCreativeUrl: true,
          },
        },
      },
    });

    if (!campaign) {
      return handleResponse(404, "Campaign not found");
    }

    const currentPublisherEarning = campaign.earnings?.find(
      (earning: any) => earning.publisherId === user?.publisher.id
    );
    // Check if user has permission to view this campaign
    // if (campaign.userId !== currentUserId) {
    //   return handleResponse(403, "Access denied");
    // }

    console.log("currentPublisherEarning", currentPublisherEarning);

    const campaignData = { ...campaign, currentPublisherEarning };

    return handleResponse(200, "Campaign retrieved successfully", campaignData);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const currentUserId = await getCurrentUser(request);

    if (!currentUserId) return handleResponse(401, "Authentication required");

    // Check if campaign exists and user owns it
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!existingCampaign) {
      return handleResponse(404, "Campaign not found");
    }

    if (existingCampaign.userId !== currentUserId) {
      return handleResponse(403, "You can only update your own campaigns");
    }

    // Can only update pending or active campaigns
    if (!["PENDING", "ACTIVE"].includes(existingCampaign.status)) {
      return handleResponse(400, "Can only update pending or active campaigns");
    }

    const body = await request.json();
    const validatedData: UpdateCampaignData = updateCampaignSchema.parse(body);

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: validatedData,
      include: {
        adCreative: true,
      },
    });

    return handleResponse(
      200,
      "Campaign updated successfully",
      updatedCampaign
    );
  } catch (error: unknown) {
    return handleCatch(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return handleResponse(401, "Authentication required");

    const campaignId = params.id;

    // Check if campaign exists and user owns it
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!existingCampaign) {
      return handleResponse(404, "Campaign not found");
    }

    // Only campaign owner can delete
    if (existingCampaign.userId !== user.userId) {
      return handleResponse(403, "You can only delete your own campaigns");
    }

    // Delete campaign (Prisma will handle related records via cascading if configured)
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return handleResponse(200, "Campaign deleted successfully");
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
