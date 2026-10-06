// app/api/v1/payment/initialize/route.ts - UPDATED
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { PaystackService } from "../../../../../lib/paystack";
import { prisma } from "../../../../../lib/db.cjs";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [INITIALIZE PAYMENT] Starting payment initialization...");

    const user = await getCurrentUserWithRoles(request);
    if (!user) {
      console.log("❌ [INITIALIZE PAYMENT] No user found");
      return handleResponse(401, "Authentication required");
    }

    const body = await request.json();
    const { reservationId } = body;

    console.log("🔍 [INITIALIZE PAYMENT] Reservation ID:", reservationId);

    if (!reservationId) {
      console.log("❌ [INITIALIZE PAYMENT] No reservation ID provided");
      return handleResponse(400, "Reservation ID is required");
    }

    // Get reserved campaign from DATABASE
    const reservation = await prisma.campaignReservation.findUnique({
      where: { reservationId },
    });

    if (!reservation) {
      console.log(
        "❌ [INITIALIZE PAYMENT] Reservation not found in database:",
        reservationId
      );
      return handleResponse(404, "Campaign reservation not found or expired");
    }

    // Check if reservation is expired
    if (new Date() > reservation.expiresAt) {
      console.log(
        "❌ [INITIALIZE PAYMENT] Reservation expired:",
        reservationId
      );
      return handleResponse(400, "Campaign reservation has expired");
    }

    // Verify user owns this reservation
    if (reservation.userId !== user.userId) {
      console.log("❌ [INITIALIZE PAYMENT] User doesn't own this reservation");
      return handleResponse(403, "Access denied");
    }

    // Parse the stored JSON data
    const pricing = reservation.amountPaid as any;

    console.log("🔍 [INITIALIZE PAYMENT] Reservation found:", {
      title: reservation.title,
      targetViews: reservation.targetViews,
      platform: reservation.platform,
      amountPaid: reservation.amountPaid,
    });

    // Get user email
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true },
    });

    if (!userDetails?.email) {
      console.log("❌ [INITIALIZE PAYMENT] User email not found");
      return handleResponse(400, "User email is required for payment");
    }

    // Generate unique reference
    const reference = `ADHIVE-${reservationId}-${Date.now()}`;

    // Convert amount to kobo
    const amountInKobo = Math.round(reservation.amountPaid * 100);

    console.log("🔍 [INITIALIZE PAYMENT] Payment details:", {
      email: userDetails.email,
      amount: reservation.amountPaid,
      amountInKobo,
      reference,
    });

    // Set callback URL to frontend
    const callbackUrl = `${process.env.FRONTEND_URL}/auth/payment-callback`;

    // Initialize Paystack payment with callback URL
    const paymentData = await PaystackService.initializeTransaction(
      userDetails.email,
      amountInKobo,
      reference,
      {
        reservation_id: reservationId,
        user_id: user.userId,
        target_views: reservation.targetViews,
        platform: reservation.platform,
      },
      callbackUrl // Add callback URL parameter
    );

    console.log("paymentData", paymentData);

    if (!paymentData.status) {
      console.log(
        "❌ [INITIALIZE PAYMENT] Paystack error:",
        paymentData.message
      );
      return handleResponse(
        400,
        paymentData.message || "Failed to initialize payment"
      );
    }

    // Update reservation with payment reference in DATABASE
    await prisma.campaignReservation.update({
      where: { reservationId },
      data: {
        status: "PAYMENT_INITIATED",
        paymentReference: reference,
      },
    });

    console.log("✅ [INITIALIZE PAYMENT] Payment initialized successfully");

    return handleResponse(200, "Payment initialized successfully", {
      paymentData,
      authorization_url: paymentData.data.authorization_url,
      reference: paymentData.data.reference,
      access_code: paymentData.data.access_code,
      amount: pricing.totalCost,
      reservationId: reservationId,
      callback_url: callbackUrl,
      instructions: "Redirect user to authorization_url to complete payment",
    });
  } catch (error: unknown) {
    console.error("❌ [INITIALIZE PAYMENT] Error:", error);
    return handleCatch(error);
  }
}
