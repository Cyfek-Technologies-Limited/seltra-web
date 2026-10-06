// app/api/v1/campaigns/[id]/pay/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { PaystackService } from "../../../../../../lib/paystack";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const user = await getCurrentUserWithRoles(request);

    if (!user) return handleResponse(401, "Authentication required");

    // Get user details for payment
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, username: true },
    });

    if (!userDetails?.email) {
      return handleResponse(400, "User email is required for payment");
    }

    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { adCreative: true, user: true },
    });

    if (!campaign) {
      return handleResponse(404, "Campaign not found");
    }

    if (campaign.userId !== user.userId) {
      return handleResponse(403, "You can only pay for your own campaigns");
    }

    if (campaign.paymentStatus === "PAID") {
      return handleResponse(400, "Campaign already paid for");
    }

    // Generate unique reference
    const reference = `ADHIVE-${campaignId}-${Date.now()}`;

    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(campaign.budget * 100);

    // Initialize Paystack payment with callback URL
    const paymentData = await PaystackService.initializeTransaction(
      userDetails.email,
      amountInKobo,
      reference,
      {
        campaign_id: campaignId,
        user_id: user.userId,
        target_views: campaign.targetViews,
        platform: campaign.platform,
      }
    );

    if (!paymentData.status) {
      return handleResponse(
        400,
        paymentData.message || "Failed to initialize payment"
      );
    }

    // Update campaign with payment reference (but not marked as paid yet)
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        paymentReference: reference,
        paymentStatus: "PENDING", // Still pending until verified
      },
    });

    // Create pending transaction record
    await prisma.transaction.create({
      data: {
        userId: user.userId,
        campaignId: campaignId,
        amount: campaign.budget,
        type: "payment",
        status: "pending",
        reference: reference,
      },
    });

    return handleResponse(200, "Payment initialized successfully", {
      authorization_url: paymentData.data.authorization_url,
      reference: paymentData.data.reference,
      access_code: paymentData.data.access_code,
      amount: campaign.budget,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        targetViews: campaign.targetViews,
        platform: campaign.platform,
      },
      instructions: "Redirect user to authorization_url to complete payment",
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
