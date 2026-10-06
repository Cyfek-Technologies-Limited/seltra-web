// app/api/v1/leaderboard/route.ts - UPDATED
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../lib";
import { prisma } from "../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    // Get top referrers directly from Referral table
    const topReferrers = await prisma.referral.findMany({
      where: {
        totalUses: { gt: 0 },
        isActive: true,
      },
      include: {
        publisher: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { totalUses: "desc" },
      take: 10,
    });

    // Format the data and add ranks
    const leaderboard = topReferrers.map((referral, index) => ({
      id: referral.id,
      userId: referral.publisher.user.id,
      username:
        referral.publisher.user.username ||
        `User_${referral.publisher.user.id.slice(-6)}`,
      email: referral.publisher.user.email,
      totalReferrals: referral.totalUses,
      rank: index + 1,
      prizeAmount: index === 0 ? 100000 : undefined,
      joinDate: referral.publisher.user.createdAt,
    }));

    // Calculate days until December 31st
    const deadline = new Date("2024-12-31T23:59:59Z");
    const daysLeft = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return handleResponse(200, "Leaderboard fetched successfully", {
      leaderboard: leaderboard.slice(0, 20), // Return top 10
      prizeInfo: {
        amount: 100000,
        daysLeft: Math.max(0, daysLeft),
      },
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
