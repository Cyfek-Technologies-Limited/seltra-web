// app/api/v1/campaigns/reserve/route.ts - ADD DEBUG LOGS
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { createCampaignSchema } from "../../../../../lib/zod-schema";
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db.cjs";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [RESERVE CAMPAIGN] Starting campaign reservation...");

    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const userId = user.userId;
    const isAdvertiser = user.roles.includes("ADVERTISER");

    console.log("🔍 [RESERVE CAMPAIGN] Authenticated user:", {
      userId,
      email: user.email,
      isAdvertiser,
      roles: user.roles,
    });

    if (!isAdvertiser) {
      return handleResponse(403, "Only advertisers can create campaigns");
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    // Create reservation in DATABASE
    const reservationId = `reserve_${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    console.log(
      "🔍 [RESERVE CAMPAIGN] Creating reservation with user ID:",
      userId
    );

    const reservation = await prisma.campaignReservation.create({
      data: {
        reservationId: reservationId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        targetViews: validatedData.targetViews,
        platform: validatedData.platform,
        adCreative: validatedData.adCreative,
        amountPaid: validatedData.amountPaid,
        userId: userId, // This should be the current user's ID
        expiresAt: expiresAt,
        status: "PENDING",
      },
    });

    console.log("✅ [RESERVE CAMPAIGN] Campaign reserved for user:", userId);

    return handleResponse(201, "Campaign reserved. Proceed to payment.", {
      reservationId,
      expiresAt: expiresAt.toISOString(),
      paymentRequired: true,
    });
  } catch (error: unknown) {
    console.error("❌ [RESERVE CAMPAIGN] Error:", error);
    return handleCatch(error);
  }
}
