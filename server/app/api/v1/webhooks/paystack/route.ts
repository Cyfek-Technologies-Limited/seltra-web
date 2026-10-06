import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../../lib/db.cjs";

// Get webhook secret from environment variables
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // 🔒 CRITICAL: Verify webhook signature
    if (!verifyPaystackWebhook(body, signature)) {
      console.error(
        "❌ [WEBHOOK] Invalid signature - potential security threat"
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    console.log("🔍 [PAYSTACK WEBHOOK] Received verified event:", event.event);

    // Process the verified event
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data);
        break;
      case "transfer.success":
        await handleSuccessfulTransfer(event.data);
        break;
      case "transfer.failed":
        await handleFailedTransfer(event.data);
        break;
      case "transfer.reversed":
        await handleReversedTransfer(event.data);
        break;
      default:
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ [PAYSTACK WEBHOOK] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}

// 🔒 SECURITY: Verify Paystack webhook signature
function verifyPaystackWebhook(
  payload: string,
  signature: string | null
): boolean {
  if (!PAYSTACK_WEBHOOK_SECRET) {
    console.error("❌ [WEBHOOK] PAYSTACK_WEBHOOK_SECRET not configured");
    return false;
  }

  if (!signature) {
    console.error("❌ [WEBHOOK] No signature provided");
    return false;
  }

  try {
    // Compute HMAC SHA512 hash
    const computedSignature = crypto
      .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    // Compare computed signature with provided signature
    const isValid = computedSignature === signature;

    if (!isValid) {
      console.error("❌ [WEBHOOK] Signature mismatch:", {
        computed: computedSignature.substring(0, 20) + "...",
        received: signature.substring(0, 20) + "...",
      });
    }

    return isValid;
  } catch (error) {
    console.error("❌ [WEBHOOK] Signature verification error:", error);
    return false;
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    console.log("✅ [WEBHOOK] Payment successful:", data.reference);

    // Update payment status in your database
    await prisma.transaction.update({
      where: { reference: data.reference },
      data: {
        status: "COMPLETED",
        metadata: {
          ...data,
          processedAt: new Date(),
        },
      },
    });

    // If this is for a campaign, mark it as paid
    if (data.metadata?.reservationId) {
      // Your campaign activation logic here
    }
  } catch (error) {
    console.error("❌ [WEBHOOK] Error handling successful payment:", error);
  }
}

async function handleSuccessfulTransfer(data: any) {
  try {
    console.log("✅ [WEBHOOK] Transfer successful:", data.reference);

    // Update withdrawal status to completed
    await prisma.withdrawal.update({
      where: { reference: data.reference },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        paymentReference: data.transfer_code,
      },
    });
  } catch (error) {
    console.error("❌ [WEBHOOK] Error handling successful transfer:", error);
  }
}

async function handleFailedTransfer(data: any) {
  try {
    console.log("❌ [WEBHOOK] Transfer failed:", data.reference);

    // Update withdrawal status to failed and refund balance
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { reference: data.reference },
      include: { publisher: true },
    });

    if (withdrawal) {
      await prisma.$transaction([
        // Update withdrawal status
        prisma.withdrawal.update({
          where: { reference: data.reference },
          data: {
            status: "FAILED",
            completedAt: new Date(),
          },
        }),
        // Refund amount to publisher's available balance
        prisma.publisherAccount.update({
          where: { publisherId: withdrawal.publisherId },
          data: {
            availableBalance: {
              increment: withdrawal.amount,
            },
          },
        }),
      ]);
    }
  } catch (error) {
    console.error("❌ [WEBHOOK] Error handling failed transfer:", error);
  }
}

async function handleReversedTransfer(data: any) {
  try {
    console.log("🔄 [WEBHOOK] Transfer reversed:", data.reference);

    // Handle transfer reversal (similar to failed transfer)
    await handleFailedTransfer(data);
  } catch (error) {
    console.error("❌ [WEBHOOK] Error handling reversed transfer:", error);
  }
}

// Add GET method for webhook validation (Paystack sometimes sends GET requests)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "active",
    message: "Paystack webhook is active and ready to receive events",
  });
}
