// app/api/v1/publisher/earnings/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const userId = user.userId;
    const isPublisher = user.roles.includes("publisher");

    if (!isPublisher) {
      return handleResponse(403, "Only publishers can access earnings");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = { publisherId: userId };
    if (status) where.status = status;

    const [earnings, total] = await Promise.all([
      prisma.publisherEarning.findMany({
        where,
        include: {
          campaign: {
            select: {
              title: true,
              platform: true,
              adCreative: {
                select: {
                  text: true,
                },
              },
            },
          },
        },
        orderBy: { claimedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.publisherEarning.count({ where }),
    ]);

    const summary = await prisma.publisherEarning.groupBy({
      by: ["status"],
      where: { publisherId: userId },
      _sum: {
        amount: true,
        views: true,
      },
      _count: {
        id: true,
      },
    });

    return handleResponse(200, "Earnings history retrieved", {
      earnings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: summary.reduce((acc, item) => {
        acc[item.status] = {
          totalAmount: item._sum.amount || 0,
          totalViews: item._sum.views || 0,
          count: item._count.id,
        };
        return acc;
      }, {} as any),
      totals: {
        totalEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
        totalViews: earnings.reduce((sum, e) => sum + e.views, 0),
        totalCampaigns: earnings.length,
      },
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
