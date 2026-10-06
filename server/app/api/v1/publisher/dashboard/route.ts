// app/api/v1/publisher/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUserWithRoles, getFullUser } from "../../../../../lib/user";

// TypeScript interfaces
interface PublisherEarning {
  id: string;
  amount: number;
  views: number;
  status: string;
  claimedAt: Date;
  campaign: {
    title: string;
    platform: string;
  };
}

interface PublisherStrike {
  reason: string;
  severity: string;
  issuedAt: Date;
}

interface DashboardData {
  profile: {
    verified: boolean;
    platforms: any;
    userId: string;
    memberSince: Date;
    age: number;
    gender: string;
    occupation: string;
    location: string;
    phone: string;
  };
  account: {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    isVerified: boolean;
  };
  stats: {
    totalCampaigns: number;
    availableCampaigns: number;
    totalEarnings: number;
    approvedEarnings: number;
    // pendingEarnings: number;
    strikes: number;
    completionRate: number;
  };
  recentEarnings: Array<{
    id: string;
    amount: number;
    views: number;
    status: string;
    claimedAt: Date;
    campaignTitle: string;
    platform: string;
  }>;
  strikes: PublisherStrike[];
  warnings: string | null;
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [PUBLISHER DASHBOARD] Fetching dashboard data...");

    const user = await getCurrentUserWithRoles(request);
    if (!user) {
      console.log("❌ [PUBLISHER DASHBOARD] No user found");
      return handleResponse(401, "Authentication required");
    }

    const userId = user.userId;
    const isPublisher = user.roles.includes("PUBLISHER");

    if (!isPublisher) {
      console.log("❌ [PUBLISHER DASHBOARD] User is not a publisher");
      return handleResponse(403, "Only publishers can access dashboard");
    }

    console.log("🔍 [PUBLISHER DASHBOARD] User ID:", userId);

    // Get publisher data - using correct fields from your schema
    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      // select: {
      //   id: true,
      //   userId: true,
      //   verified: true,
      //   age: true,
      //   gender: true,
      //   location: true,
      //   occupation: true,
      //   // earnings: true,
      // },
      include: { user: true },
    });

    if (!publisher) {
      console.log("❌ [PUBLISHER DASHBOARD] Publisher profile not found");
      return handleResponse(
        404,
        "Publisher profile not found. Please complete your profile."
      );
    }

    console.log(
      "🔍 [PUBLISHER DASHBOARD] Publisher found:",
      publisher.verified
    );

    // Get publisher account
    const account = await prisma.publisherAccount.findUnique({
      where: { publisherId: publisher.id },
    });

    // Get user creation date for memberSince
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    // Get earnings with campaign details
    const earnings: PublisherEarning[] = await prisma.publisherEarning.findMany(
      {
        where: { publisherId: publisher.id },
        orderBy: { claimedAt: "desc" },
        take: 10,
        include: {
          campaign: {
            select: {
              title: true,
              platform: true,
            },
          },
        },
      }
    );

    // Get strikes with proper typing
    const strikes = await prisma.publisherStrike.findMany({
      where: {
        publisherId: publisher.id,
        resolvedAt: null,
      },
      orderBy: { issuedAt: "desc" },
    });

    // Count available campaigns
    const publisherPlatforms = publisher.platforms as Record<string, boolean>;

    const availableCampaignsCount = await prisma.campaign.count({
      where: {
        status: "ACTIVE",

        earnings: {
          none: {
            publisherId: publisher.id,
          },
        },
      },
    });

    // Calculate stats
    const totalEarnings = earnings.reduce(
      (sum: number, earning: PublisherEarning) => sum + earning.amount,
      0
    );
    const approvedEarnings = earnings
      .filter((e: PublisherEarning) => e.status === "APPROVED")
      .reduce((sum: number, e: PublisherEarning) => sum + e.amount, 0);

    // Calculate completion rate (approved vs total claims)
    const totalClaims = earnings.length;
    const approvedClaims = earnings.filter(
      (e: PublisherEarning) => e.status === "APPROVED"
    ).length;
    const completionRate =
      totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;

    // Format recent earnings
    const recentEarnings = earnings.map((earning: PublisherEarning) => ({
      id: earning.id,
      amount: earning.amount,
      views: earning.views,
      status: earning.status,
      claimedAt: earning.claimedAt,
      campaignTitle: earning.campaign.title,
      platform: earning.campaign.platform,
    }));

    // Format strikes with proper typing
    const formattedStrikes: PublisherStrike[] = strikes.map((strike: any) => ({
      reason: strike.reason,
      severity: strike.severity,
      issuedAt: strike.issuedAt,
    }));

    // Generate warnings
    let warnings: string | null = null;
    if (strikes.length >= 2) {
      warnings = `⚠️ You have ${strikes.length} strikes. One more will result in account deactivation.`;
    } else if (strikes.length === 1) {
      warnings = `⚠️ You have 1 strike. Be careful with your claims to avoid account restrictions.`;
    }

    console.log(
      "❌ [PUBLISHER DASHBOARD] Publisher profile  found:",
      publisher
    );
    // Create dashboard data
    const dashboardData: DashboardData = {
      profile: {
        verified: user.verified,
        platforms: publisher.platforms,
        userId: publisher.userId,
        memberSince: userData?.createdAt || new Date(),
        age: publisher.age,
        gender: publisher.gender,
        occupation: publisher.occupation,
        location: publisher.location,
        phone: publisher.user.phone,
      },
      account: account
        ? {
            availableBalance: account.availableBalance,
            pendingBalance: account.pendingBalance,
            totalEarnings: account.totalEarnings,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountName: account.accountName,
            isVerified: account.isVerified,
          }
        : {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarnings: 0,
            isVerified: false,
          },
      stats: {
        totalCampaigns: earnings.length,
        availableCampaigns: availableCampaignsCount,
        totalEarnings,
        approvedEarnings,
        strikes: strikes.length,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      recentEarnings,
      strikes: formattedStrikes,
      warnings,
    };

    console.log(
      "✅ [PUBLISHER DASHBOARD] Dashboard data retrieved successfully"
    );
    return handleResponse(
      200,
      "Dashboard data retrieved successfully",
      dashboardData
    );
  } catch (error: unknown) {
    console.error("❌ [PUBLISHER DASHBOARD] Error:", error);
    return handleCatch(error);
  }
}

export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set(
    "Access-Control-Allow-Origin",
    req.headers.get("origin") || "*"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
