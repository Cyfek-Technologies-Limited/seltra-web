// scripts/reconcilePayouts.ts

import { prisma } from "../lib/db.cjs";
import { PaystackService } from "../lib/paystack";

async function reconcile() {
  // Find recent unsettled withdrawals
  const rows = await prisma.withdrawal.findMany({
    where: {
      status: { in: ["PROCESSING", "SENT"] },
      createdAt: { lt: new Date(Date.now() - 1000 * 60 * 5) }, // older than 5 mins
    },
  });

  for (const wd of rows) {
    try {
      if (!wd.paymentReference) {
        // maybe transfer not yet created — skip or log
        console.log("No paymentReference for", wd.id);
        continue;
      }

      const transfer = await PaystackService.getTransfer(wd.paymentReference);

      if (!transfer) {
        console.warn("Transfer not found for", wd.paymentReference);
        continue;
      }

      const providerStatus =
        transfer.data?.status || transfer.data?.transfer?.status;
      // Normalize statuses as needed
      if (providerStatus === "success" || providerStatus === "paid") {
        await prisma.withdrawal.update({
          where: { id: wd.id },
          data: { status: "PAID", providerStatus, completedAt: new Date() },
        });
        await prisma.transaction.updateMany({
          where: { reference: wd.reference },
          data: { status: "COMPLETED", providerStatus },
        });
      } else if (providerStatus === "failed" || providerStatus === "rejected") {
        await prisma.withdrawal.update({
          where: { id: wd.id },
          data: { status: "FAILED", providerStatus },
        });
        // refund
        await prisma.publisherAccount.update({
          where: { publisherId: wd.publisherId },
          data: { availableBalance: { increment: wd.amount } },
        });
        await prisma.transaction.updateMany({
          where: { reference: wd.reference },
          data: { status: "FAILED", providerStatus },
        });
      } else {
        // still pending — keep watching
        console.log("Still pending", wd.id, providerStatus);
      }
    } catch (err) {
      console.error("Reconcile error for", wd.id, err);
    }
  }
}

reconcile()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
