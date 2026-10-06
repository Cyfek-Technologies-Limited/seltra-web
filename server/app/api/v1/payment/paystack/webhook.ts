// pages/api/paystack/webhook.ts
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { prisma } from "../../../../../lib/db.cjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET!;
  const signature = req.headers["x-paystack-signature"] as string | undefined;
  const body = JSON.stringify(req.body || {});

  // Verify signature if secret provided
  if (secret) {
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    if (signature !== hash) {
      console.warn("Invalid paystack webhook signature");
      return res.status(400).send("Invalid signature");
    }
  }

  const event = req.body;
  // event.event = "transfer.success" or "transfer.failed" etc. structure depends on Paystack.
  try {
    // Example for transfer success
    if (
      event.event === "transfer.success" ||
      event.event === "transfer.completed"
    ) {
      const transfer = event.data;
      const reference = transfer.reference; // should match withdrawal.reference
      const providerRef = transfer.id || transfer.transfer_code;

      // idempotent update
      await prisma.$transaction(async (tx) => {
        const wd = await tx.withdrawal.findUnique({ where: { reference } });
        if (!wd) return;

        // Already PAID? skip
        if (wd.status === "PAID") return;

        await tx.withdrawal.update({
          where: { id: wd.id },
          data: {
            status: "PAID",
            paymentReference: providerRef,
            providerStatus: "success",
            completedAt: new Date(),
          },
        });

        await tx.transaction.updateMany({
          where: { reference },
          data: {
            status: "COMPLETED",
            provider: "PAYSTACK",
            providerRef,
            providerStatus: "success",
          },
        });
      });
    }

    if (event.event === "transfer.failed") {
      const transfer = event.data;
      const reference = transfer.reference;
      const providerRef = transfer.id || transfer.transfer_code;
      await prisma.$transaction(async (tx) => {
        const wd = await tx.withdrawal.findUnique({ where: { reference } });
        if (!wd) return;

        // If failed, refund balance if not already refunded
        if (wd.status !== "FAILED") {
          await tx.withdrawal.update({
            where: { id: wd.id },
            data: {
              status: "FAILED",
              providerStatus: "failed",
              paymentReference: providerRef,
              note: "Provider reported failure",
              processedAt: new Date(),
            },
          });
          await tx.publisherAccount.update({
            where: { publisherId: wd.publisherId },
            data: { availableBalance: { increment: wd.amount } },
          });

          await tx.transaction.updateMany({
            where: { reference },
            data: {
              status: "FAILED",
              provider: "PAYSTACK",
              providerRef,
              providerStatus: "failed",
            },
          });
        }
      });
    }

    // handle other events (transfer.reversed etc.)
    return res.status(200).send("ok");
  } catch (err: any) {
    console.error("Webhook processing error", err);
    return res.status(500).send("internal error");
  }
}
