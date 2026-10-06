// app/api/v1/campaigns/test-create/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db.cjs";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [TEST CREATE] Testing campaign creation...");

    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    console.log("🔍 [TEST CREATE] Current user:", {
      id: user.userId,
      email: user.email,
    });

    // Create a simple test campaign
    const testCampaign = await prisma.campaign.create({
      data: {
        title: "Test Campaign - Direct Creation",
        description: "Testing direct campaign creation",
        budget: 1000,
        targetViews: 100,
        platform: "whatsapp",
        status: "ACTIVE",
        userId: user.userId, // Use the current user's ID
        amountPaid: 1000,
        paymentStatus: "PAID",
        paymentReference: `test-${Date.now()}`,
        paidAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ [TEST CREATE] Test campaign created:", {
      campaignId: testCampaign.id,
      userId: testCampaign.userId,
      userEmail: testCampaign.user?.email,
    });

    return handleResponse(
      201,
      "Test campaign created successfully",
      testCampaign
    );
  } catch (error: unknown) {
    console.error("❌ [TEST CREATE] Error:", error);
    return handleCatch(error);
  }
}
