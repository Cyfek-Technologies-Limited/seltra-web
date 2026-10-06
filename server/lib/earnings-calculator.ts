import { prisma } from "./db.cjs";

export class EarningsCalculator {
  static async calculateEarnings(
    campaignId: string,
    views: number
  ): Promise<{
    amount: number;
    ratePerView: number;
    platformFee: number;
    publisherShare: number;
  }> {
    // Get campaign details to determine platform and ad type
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { adCreative: true },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Determine if it's a video ad (check file extension or type)
    const isVideoAd = this.isVideoAd(campaign.adCreative?.fileUrl);
    const platform = campaign.platform.toLowerCase();

    // Calculate rate based on your pricing logic
    let ratePerView = 5; // Default for image ads on other platforms

    if (isVideoAd) {
      // Video ad pricing
      if (platform === "whatsapp" || platform === "telegram") {
        ratePerView = 4;
      } else if (platform === "all") {
        ratePerView = 8;
      } else {
        ratePerView = 6; // Other platforms
      }
    } else {
      // Image ad pricing (flyers)
      if (platform === "whatsapp" || platform === "telegram") {
        ratePerView = 3;
      } else if (platform === "all") {
        ratePerView = 6;
      } else {
        ratePerView = 4.5; // Other platforms
      }
    }

    const amount = views * ratePerView;

    return {
      amount: Math.round(amount * 100) / 100,
      ratePerView: ratePerView,
      platformFee: 0,
      publisherShare: 100,
    };
  }

  private static isVideoAd(fileUrl: string | undefined): boolean {
    if (!fileUrl) return false;

    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    const urlLower = fileUrl.toLowerCase();

    return videoExtensions.some((ext) => urlLower.includes(ext));
  }

  static async updatePublisherBalance(publisherId: string, amount: number) {
    const account = await prisma.publisherAccount.upsert({
      where: { publisherId },
      update: {
        pendingBalance: {
          increment: amount,
        },
      },
      create: {
        publisherId,
        pendingBalance: amount,
        totalEarnings: amount,
        availableBalance: 0,
      },
    });

    return account;
  }
}
