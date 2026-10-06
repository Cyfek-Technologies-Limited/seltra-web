// app/api/v1/payment/webhook/route.ts - ENHANCED WITH DEBUG LOGS
import { NextRequest } from "next/server";
import { PaystackService } from "../../../../../lib/paystack";
import { handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs"; // Add prisma import

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log("🔍 [WEBHOOK] Received event:", event);
    console.log(
      "🔍 [WEBHOOK] Full webhook data:",
      JSON.stringify(body, null, 2)
    );

    // Verify this is a charge.success event
    if (event === "charge.success") {
      const { reference, metadata } = data;

      console.log("🔍 [WEBHOOK] Payment successful:", {
        reference,
        metadata: metadata,
      });

      // Check if already processed (idempotency)
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference },
      });

      if (existingTransaction) {
        console.log(
          "ℹ️ [WEBHOOK] Payment already processed for reference:",
          reference
        );
        return handleResponse(200, "Webhook already processed");
      }

      // Verify the transaction with Paystack
      const verification = await PaystackService.verifyTransaction(reference);
      console.log("🔍 [WEBHOOK] Paystack verification:", verification);

      if (verification.data.status === "success") {
        // Extract reservation ID from metadata
        const reservationId = metadata?.reservation_id;

        console.log("🔍 [WEBHOOK] Extracted reservationId:", reservationId);

        if (reservationId) {
          console.log(
            "🔍 [WEBHOOK] Calling campaign creation for reservation:",
            reservationId
          );

          // Call the campaign creation endpoint
          // const createResponse = await fetch(
          //   `http://localhost:3001/api/v1/campaigns/create`,
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       reservationId,
          //       paymentReference: reference,
          //     }),
          //   }
          // );

          console.log("🔍 [WEBHOOK] success:");

          // const responseText = await createResponse.text();
          console.log("🔍 [WEBHOOK] success:");

          // if (createResponse.ok) {
          //   console.log(
          //     `✅ [WEBHOOK] Campaign created successfully for reservation ${reservationId}`
          //   );
          // } else {
          //   console.error(
          //     `❌ [WEBHOOK] Failed to create campaign for reservation ${reservationId}`
          //   );
          // }
        } else {
          console.error("❌ [WEBHOOK] No reservationId found in metadata");
        }
      } else {
        console.error(
          "❌ [WEBHOOK] Paystack verification failed:",
          verification
        );
      }
    } else {
      console.log("ℹ️ [WEBHOOK] Ignoring event:", event);
    }

    return handleResponse(200, "Webhook processed successfully");
  } catch (error: unknown) {
    console.error("❌ [WEBHOOK] Error:", error);
    return handleResponse(500, "Webhook processing failed");
  }
}
