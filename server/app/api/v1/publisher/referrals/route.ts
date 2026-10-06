import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isPublisher = user.roles.includes("PUBLISHER");
    if (!isPublisher) {
      return handleResponse(403, "Only publishers can access referral data");
    }

    // Get publisher record
    const publisher = await prisma.publisher.findUnique({
      where: { userId: user.userId },
    });

    if (!publisher) {
      return handleResponse(404, "Publisher profile not found");
    }

    // Get referral data using findFirst since publisherId is not unique
    const referral = await prisma.referral.findFirst({
      where: {
        publisherId: publisher.id,
        isActive: true, // Optional: only get active referrals
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

    // If no referral exists, return empty data
    if (!referral) {
      return handleResponse(200, "No referral code found", {
        referral: null,
        stats: {
          totalUses: 0,
          totalEarnings: 0,
          referralCount: 0,
        },
      });
    }

    const stats = {
      totalUses: referral.totalUses,
      totalEarnings: referral.totalEarnings,
      referralCount: referral.referrals.length,
    };

    return handleResponse(200, "Referral data retrieved successfully", {
      referral,
      stats,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
