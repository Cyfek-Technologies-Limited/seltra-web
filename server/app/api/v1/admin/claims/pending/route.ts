// app/api/v1/admin/claims/pending/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import {
  getCurrentUser,
  getCurrentUserWithRoles,
  getFullUser,
} from "../../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getFullUser(request);
    if (!user) return handleResponse(401, "Authentication required");

    // const isAdmin = user.roles.includes("ADMIN");
    // if (!isAdmin) {
    //   return handleResponse(403, "Admin access required");
    // }

    // console.log("user", isAdmin);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const pendingClaims = await prisma.publisherEarning.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        amount: true,
        views: true,
        proofImages: true,
        claimedAt: true,
        extractedViews: true,
        // acceptedAt: true,
        proofUrls: true,
        publisher: {
          select: {
            user: {
              select: { email: true, username: true, createdAt: true },
            },
            account: true,
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
      orderBy: { claimedAt: "asc" },
      skip,
      take: limit,
    });

    const total = await prisma.publisherEarning.count({
      where: { status: "PENDING" },
    });

    return handleResponse(200, "Pending claims retrieved", {
      claims: pendingClaims,
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
