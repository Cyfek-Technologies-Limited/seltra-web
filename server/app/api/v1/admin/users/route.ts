import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("ADMIN");
    if (!isAdmin) {
      return handleResponse(403, "Admin access required");
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // 'publisher', 'advertiser', or null for all
    const search = searchParams.get("search");
    const minBalance = parseInt(searchParams.get("minBalance") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};

    if (role) {
      where.roles = { has: role.toUpperCase() };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minBalance > 0) {
      where.roles = { has: "PUBLISHER" }; // Force publisher role
      where.publisher = {
        account: {
          availableBalance: { gte: minBalance },
        },
      };
    }

    // Compute overall stats (independent of filters)
    const [
      totalUsers,
      totalPublishers,
      totalAdvertisers,
      totalStriked,
      highBalanceCount,
      payoutReadyAggregate,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { roles: { has: "PUBLISHER" } } }),
      prisma.user.count({ where: { roles: { has: "ADVERTISER" } } }),
      prisma.publisher.count({
        where: {
          strikes: {
            some: {
              resolvedAt: null,
            },
          },
        },
      }),
      prisma.publisher.count({
        where: {
          account: {
            availableBalance: { gte: 3000 },
          },
        },
      }),
      prisma.publisherAccount.aggregate({
        where: {
          availableBalance: { gte: 3000 },
        },
        _sum: {
          availableBalance: true,
        },
      }),
    ]);

    const totalPayoutReady = payoutReadyAggregate._sum.availableBalance || 0;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          publisher: {
            select: {
              verified: true,
              age: true,
              gender: true,
              location: true,
              occupation: true,
              account: {
                select: {
                  totalEarnings: true,
                  availableBalance: true,
                  pendingBalance: true,
                },
              },
              strikes: {
                where: { resolvedAt: null },
                select: { id: true }, // Minimal for .length
              },
              earningsHistory: {
                select: { status: true }, // Minimal for status filters
              },
              withdrawals: {
                select: { status: true }, // Minimal for status filters
              },
            },
          },
          campaigns: {
            select: {
              status: true,
              amountPaid: true,
              _count: {
                select: { earnings: true }, // Count instead of full list
              },
            },
          },
          transactions: {
            where: {
              type: "CAMPAIGN_PAYMENT",
            },
            select: {
              amount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    console.log("total users", users.length);

    // Format response
    const formattedUsers = users.map((user) => {
      const roles = user.roles;
      const isPublisher = roles.includes("PUBLISHER");
      const isAdvertiser = roles.includes("ADVERTISER");

      // Publisher stats (using counts and minimal data)
      const publisherStats = user.publisher
        ? {
            age: user.publisher.age || 0,
            gender: user.publisher.gender,
            location: user.publisher.location,
            occupation: user.publisher.occupation,
            verified: user.publisher.verified,
            totalEarnings: user.publisher.account?.totalEarnings || 0,
            availableBalance: user.publisher.account?.availableBalance || 0,
            pendingBalance: user.publisher.account?.pendingBalance || 0,
            activeStrikes: user.publisher.strikes.length,
            totalClaims: user.publisher.earningsHistory.length,
            approvedClaims: user.publisher.earningsHistory.filter(
              (e) => e.status === "APPROVED" || e.status === "PAID"
            ).length,
            pendingClaims: user.publisher.earningsHistory.filter(
              (e) => e.status === "PENDING"
            ).length,
            totalWithdrawals: user.publisher.withdrawals.length,
            pendingWithdrawals: user.publisher.withdrawals.filter(
              (w) => w.status === "PENDING"
            ).length,
          }
        : null;

      // Advertiser stats
      const totalCampaignSpent = user.campaigns.reduce(
        (sum, campaign) => sum + campaign.amountPaid,
        0
      );
      const totalTransactions = user.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      const advertiserStats =
        user.campaigns.length > 0
          ? {
              totalCampaigns: user.campaigns.length,
              activeCampaigns: user.campaigns.filter(
                (c) => c.status === "ACTIVE"
              ).length,
              completedCampaigns: user.campaigns.filter(
                (c) => c.status === "COMPLETED"
              ).length,
              totalSpent: totalCampaignSpent,
              totalTransactions: totalTransactions,
              totalPublisherInteractions: user.campaigns.reduce(
                (sum, campaign) => sum + campaign._count.earnings,
                0
              ),
              averageCampaignBudget:
                user.campaigns.length > 0
                  ? totalCampaignSpent / user.campaigns.length
                  : 0,
            }
          : null;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        createdAt: user.createdAt,
        roles: roles.map((role) => role.toLowerCase()),
        isPublisher,
        isAdvertiser,
        publisherStats,
        advertiserStats,
        campaignStats: {
          total: user.campaigns.length,
          active: user.campaigns.filter((c) => c.status === "ACTIVE").length,
        },
      };
    });

    return handleResponse(200, "Users retrieved successfully", {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalUsers,
        totalPublishers,
        totalAdvertisers,
        totalStriked,
        highBalanceCount,
        totalPayoutReady,
      },
    });
  } catch (error: unknown) {
    console.error("Admin users route error:", error);
    return handleCatch(error);
  }
}
