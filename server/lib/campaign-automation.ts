// lib/campaign-automation.ts
import { prisma } from "./db.cjs";

export class CampaignAutomation {
  // Check and update campaign status based on views (no time limit)
  static async updateCampaignStatus() {
    const activeCampaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
    });

    for (const campaign of activeCampaigns) {
      if (campaign.impressions >= campaign.targetViews) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(), // Record when it completed
          },
        });

        console.log(
          `Campaign ${campaign.id} completed - reached ${campaign.targetViews} views`
        );
      }
    }
  }

  // Clean up completed campaigns after 1 week if not rerun
  static async cleanupCompletedCampaigns() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completedCampaigns = await prisma.campaign.findMany({
      where: {
        status: "COMPLETED",
        completedAt: {
          lt: oneWeekAgo, // Completed more than 1 week ago
        },
      },
      include: {
        adCreative: true,
      },
    });

    let deletedCount = 0;
    for (const campaign of completedCampaigns) {
      // Delete ad creative first (due to foreign key constraint)
      if (campaign.adCreative) {
        await prisma.adCreative.delete({
          where: { id: campaign.adCreative.id },
        });
      }

      // Then delete campaign
      await prisma.campaign.delete({
        where: { id: campaign.id },
      });

      deletedCount++;
      console.log(
        `Auto-deleted completed campaign: ${campaign.id} (completed on ${campaign.completedAt})`
      );
    }

    return deletedCount;
  }

  // Rerun a completed campaign - resets views and extends life
  static async rerunCampaign(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== userId) {
      throw new Error("You can only rerun your own campaigns");
    }

    if (campaign.status !== "COMPLETED") {
      throw new Error("Only completed campaigns can be rerun");
    }

    // Reset campaign - clear completion date and reset counters
    const rerunCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "ACTIVE",
        impressions: 0,
        clicks: 0,
        completedAt: null, // Clear completion date
      },
      include: {
        adCreative: true,
      },
    });

    console.log(`Campaign ${campaignId} rerun by user ${userId}`);
    return rerunCampaign;
  }

  // Simulate view increment (for testing)
  static async incrementViews(campaignId: string, views: number = 1) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        impressions: {
          increment: views,
        },
      },
    });

    // Check if campaign should be completed after this increment
    if (
      updatedCampaign.impressions >= updatedCampaign.targetViews &&
      updatedCampaign.status === "ACTIVE"
    ) {
      await this.updateCampaignStatus(); // This will mark it as completed
    }

    return updatedCampaign;
  }
}
