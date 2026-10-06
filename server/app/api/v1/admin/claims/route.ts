// app/api/v1/admin/claims/pending/route.ts
import { NextRequest } from "next/server";
import { getFullUser } from "../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const user = await getFullUser(request);
    if (!user) return handleResponse(401, "Authentication required");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = (searchParams.get("status") || "PENDING").toUpperCase();

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];
    const safeStatus = allowedStatuses.includes(status) ? status : "PENDING";

    const skip = (page - 1) * limit;

    const where = {
      status: safeStatus,
    };

    const claims = await prisma.publisherEarning.findMany({
      where,
      select: {
        id: true,
        amount: true,
        views: true,
        proofImages: true,
        claimedAt: true,
        extractedViews: true,
        approvedAt: true,
        paidAt: true,
        rejectionReason: true,
        status: true,
        proofUrls: true,
        publisher: {
          select: {
            user: {
              select: {
                email: true,
                username: true,
                createdAt: true,
              },
            },
            account: {
              select: {
                bankName: true,
                accountNumber: true,
                accountName: true,
                isVerified: true,
              },
            },
            strikes: {
              select: { id: true },
              where: { resolvedAt: null },
            },
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            platform: true,
            views: true,
            targetViews: true,
            user: {
              select: { email: true, username: true },
            },
          },
        },
      },
      orderBy: { claimedAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.publisherEarning.count({ where });

    return handleResponse(200, "Claims retrieved", {
      claims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
