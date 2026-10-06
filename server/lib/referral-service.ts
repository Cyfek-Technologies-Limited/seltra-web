// lib/referral-service.ts
import { prisma } from "./db.cjs";

export class ReferralService {
  static async generateReferralCode(userId: string): Promise<string> {
    // Get publisher record
    const publisher = await prisma.publisher.findUnique({
      where: { userId },
    });

    if (!publisher) {
      throw new Error("Publisher profile not found");
    }

    // Check if publisher already has a referral code using findFirst
    const existingReferral = await prisma.referral.findFirst({
      where: {
        publisherId: publisher.id,
        isActive: true,
      },
    });

    if (existingReferral) {
      throw new Error("Publisher already has an active referral code");
    }

    // Generate unique referral code
    const referralCode = await this.generateUniqueReferralCode();

    // Create new referral
    const referral = await prisma.referral.create({
      data: {
        code: referralCode,
        publisherId: publisher.id,
        totalUses: 0,
        totalEarnings: 0,
        isActive: true,
      },
    });

    return referral.code;
  }

  private static async generateUniqueReferralCode(): Promise<string> {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code: string;
    let isUnique = false;

    // Generate until we get a unique code
    while (!isUnique) {
      code = "";
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      // Check if code already exists
      const existing = await prisma.referral.findUnique({
        where: { code },
      });

      if (!existing) {
        isUnique = true;
        return code;
      }
    }

    // Fallback - this should rarely happen
    return `REF${Date.now()}`;
  }

  // Additional method to get referral by publisher
  static async getReferralByPublisherId(publisherId: string) {
    return await prisma.referral.findFirst({
      where: {
        publisherId,
        isActive: true,
      },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                email: true,
                createdAt: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  // Method to use referral code
  static async useReferralCode(code: string, referredUserId: string) {
    const referral = await prisma.referral.findUnique({
      where: { code },
    });

    if (!referral) {
      throw new Error("Invalid referral code");
    }

    if (!referral.isActive) {
      throw new Error("Referral code is no longer active");
    }

    // Check if this user was already referred by this code
    const existingUse = await prisma.referralUse.findUnique({
      where: {
        referralId_referredUserId: {
          referralId: referral.id,
          referredUserId,
        },
      },
    });

    if (existingUse) {
      throw new Error("User has already been referred with this code");
    }

    // Create referral use record
    const referralUse = await prisma.referralUse.create({
      data: {
        referralId: referral.id,
        referredUserId,
        publisherEarned: 500, // ₦500 per referral
        userBonus: 0, // Or whatever bonus you give to referred users
        status: "COMPLETED",
      },
    });

    // Update referral stats
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        totalUses: { increment: 1 },
        totalEarnings: { increment: 500 },
      },
    });

    // update publisher account
    await prisma.publisherAccount.update({
      where: { publisherId: referral.publisherId },
      data: {
        totalEarnings: { increment: 500 },
        availableBalance: { increment: 500 },
      },
    });

    return referralUse;
  }
}
