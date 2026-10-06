// app/api/v1/payment/verify/route.ts - FIXED VERSION
import { NextRequest } from "next/server";
import { handleCatch, handleResponse } from "../../../../../lib";
import { PaystackService } from "../../../../../lib/paystack";
import { prisma } from "../../../../../lib/db.cjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return handleResponse(400, "Payment reference is required");
    }

    console.log("🔍 [PAYMENT VERIFY] Verifying payment reference:", reference);

    // Verify payment with Paystack
    const verification = await PaystackService.verifyTransaction(reference);

    console.log("🔍 [PAYMENT VERIFY] Paystack response:", {
      status: verification.status,
      message: verification.message,
      data_status: verification.data?.status,
      gateway_response: verification.data?.gateway_response,
      amount: verification.data?.amount,
      currency: verification.data?.currency,
    });

    // FIX: Check the correct status fields
    const isSuccessful =
      verification.status === true && // Paystack API status
      verification.data?.status === "success"; // Transaction status

    if (isSuccessful) {
      console.log("✅ [PAYMENT VERIFY] Payment verified successfully");

      return handleResponse(200, "Payment verified successfully", {
        payment: verification.data,
        verified: true,
        status: verification.data.status,
        amount: verification.data.amount,
        currency: verification.data.currency,
        paidAt: verification.data.paid_at,
      });
    } else {
      console.log("❌ [PAYMENT VERIFY] Payment verification failed:", {
        apiStatus: verification.status,
        transactionStatus: verification.data?.status,
        gatewayResponse: verification.data?.gateway_response,
      });

      return handleResponse(400, "Payment verification failed", {
        payment: verification.data,
        verified: false,
        status: verification.data?.status,
        gateway_response: verification.data?.gateway_response,
        message: verification.message,
      });
    }
  } catch (error: unknown) {
    console.error("🔴 [PAYMENT VERIFY] Error:", error);
    return handleCatch(error);
  }
}
