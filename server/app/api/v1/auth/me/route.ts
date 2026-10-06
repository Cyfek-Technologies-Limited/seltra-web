// app/api/v1/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUser } from "../../../../../lib/user";

interface PublisherWithAccount {
  id: string;
  verified: boolean;
  platforms: any;
  earnings: number;
  account?: {
    id: string;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    isVerified: boolean;
    totalEarnings: number;
    availableBalance: number;
    pendingBalance: number;
  } | null;
  earningsHistory?: {
    id: string;
    views: number;
    status: string;
    accountName: string | null;
    proofImage: string;
    extractedViews: number;
    campaigns?: Array<{
      id: string;
      title: string;
      status: string;
      platform: string;
      views: number;
      amountPaid: number;
      category: string;
    }>;
  } | null;
}

interface UserWithRelations {
  id: string;
  email: string;
  username: string | null;
  createdAt: Date;
  roles: string[];
  publisher?: PublisherWithAccount | null;
  campaigns?: Array<{
    id: string;
    title: string;
    status: string;
    platform: string;
    views: number;
    amountPaid: number;
    category: string;
    earnings?: Array<{
      id: string;
      publisherId: string;
      status: string;
    }>;
  }>;
  transactions?: Array<{
    id: string;
    type: string;
    status: string;
    userId: string;
    amount: number;
    campaignId: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    console.log("user", user);
    if (!user) {
      const response = NextResponse.json(
        { status: 401, message: "Authentication required", data: null },
        { status: 401 }
      );

      return response;
    }

    const userData: UserWithRelations | null = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { publisher: true, campaigns: true, transactions: true },
      // select: {
      //   id: true,
      //   email: true,
      //   username: true,
      //   createdAt: true,
      //   roles: true,
      //   publisher: {
      //     select: {
      //       id: true,
      //       verified: true,
      //       platforms: true,
      //       earnings: true,
      //       account: {
      //         select: {
      //           id: true,
      //           bankName: true,
      //           accountNumber: true,
      //           accountName: true,
      //           isVerified: true,
      //           totalEarnings: true,
      //           availableBalance: true,
      //           pendingBalance: true,
      //         },
      //       },
      //       earningsHistory: {
      //         select: {
      //           id: true,
      //           views: true,
      //           status: true,
      //           accountName: true,
      //           proofImage: true,
      //           extractedViews: true,
      //           campaign: {
      //             select: {
      //               id: true,
      //               title: true,
      //               status: true,
      //               platform: true,
      //               views: true,
      //               amountPaid: true,
      //               category: true,
      //             },
      //           },
      //         },
      //       },
      //       strikes: {
      //         select: {
      //           id: true,
      //         },
      //       },
      //       withdrawals: {
      //         select: {
      //           id: true,
      //         },
      //       },
      //     },
      //   },
      //   campaigns: {
      //     select: {
      //       id: true,
      //       title: true,
      //       status: true,
      //       platform: true,
      //       views: true,
      //       amountPaid: true,
      //       category: true,
      //       earnings: {
      //         select: {
      //           id: true,
      //           publisherId: true,
      //           status: true,
      //           publisher: {
      //             select: {
      //               id: true,
      //               user: {
      //                 select: {
      //                   email: true,
      //                   username: true,
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       },
      //       adCreative: {
      //         select: {
      //           id: true,
      //         },
      //       },
      //     },
      //     orderBy: {
      //       createdAt: "desc",
      //     },
      //     take: 5,
      //   },
      //   transactions: {
      //     select: {
      //       id: true,
      //       amount: true,
      //       type: true,
      //       reference: true,
      //       status: true,
      //       campaignId: true,
      //     },
      //     orderBy: {
      //       createdAt: "desc",
      //     },
      //     take: 5,
      //   },
      // },
    });

    if (!userData) {
      const response = NextResponse.json(
        { status: 404, message: "User not found", data: null },
        { status: 404 }
      );

      return response;
    }

    const roles: string[] = userData.roles;

    const totalCampaigns = userData.campaigns?.length || 0;
    const activeCampaigns =
      userData.campaigns?.filter((c) => c.status === "ACTIVE").length || 0;
    const totalCampaignBudget =
      userData.campaigns?.reduce(
        (sum, campaign) => sum + campaign.amountPaid,
        0
      ) || 0;
    const totalViews =
      userData.campaigns?.reduce(
        (sum, campaign) => sum + (campaign.views || 0),
        0
      ) || 0;

    const uniquePublishers = new Set();
    let totalPublisherInteractions = 0;
    let activePublishers = 0;

    userData.campaigns?.forEach((campaign) => {
      campaign.earnings?.forEach((earning) => {
        uniquePublishers.add(earning.publisherId);
        totalPublisherInteractions++;
        if (earning.status === "PENDING" || earning.status === "APPROVED") {
          activePublishers++;
        }
      });
    });

    const totalUniquePublishers = uniquePublishers.size;

    const publisherStats = {
      totalUniquePublishers,
      totalPublisherInteractions,
      activePublishers,
      averagePublishersPerCampaign:
        totalCampaigns > 0
          ? (totalPublisherInteractions / totalCampaigns).toFixed(1)
          : 0,
    };

    const responseData = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      createdAt: userData.createdAt,
      roles: roles.map((role) => role.toLowerCase()),
      publisher: userData.publisher,
      isPublisher: roles.includes("PUBLISHER"),
      isAdvertiser: roles.includes("ADVERTISER"),
      isAdmin: roles.includes("ADMIN"),
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalCampaignBudget,
        totalViews,
        ...publisherStats,
        campaignCompletionRate:
          totalCampaigns > 0
            ? Math.round(
                (userData.campaigns?.filter((c) => c.status === "COMPLETED")
                  .length /
                  totalCampaigns) *
                  100
              )
            : 0,
        averageViewsPerCampaign:
          totalCampaigns > 0 ? Math.round(totalViews / totalCampaigns) : 0,
        totalCampaignSpend: totalCampaignBudget,
      },
      campaigns: userData.campaigns?.map((campaign) => ({
        ...campaign,
        publisherCount: campaign.earnings?.length || 0,
        activePublishers:
          campaign.earnings?.filter(
            (e) => e.status === "PENDING" || e.status === "APPROVED"
          ).length || 0,
      })),
      transactions: userData.transactions,
    };

    const response = NextResponse.json(
      {
        status: 200,
        message: "User data retrieved successfully",
        data: responseData,
      },
      { status: 200 }
    );

    return response;
  } catch (error: unknown) {
    console.error("🔴 [auth/me] Error:", error);
    const response = NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );

    return response;
  }
}
