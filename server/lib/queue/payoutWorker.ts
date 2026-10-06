// lib/queue/payoutWorker.ts - NEW FILE FOR THE BULLMQ WORKER
// This should be run in a separate process, e.g., via pm2 or a dedicated server script.
// Example: node lib/queue/payoutWorker.ts
// Make sure to add this to your deployment setup.

import { Worker } from "bullmq";
import IORedis from "ioredis";
import fetch from "node-fetch"; // Or use axios
import { prisma } from "../db.cjs";

const connection = new IORedis(process.env.REDIS_URL!);
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");
}

// Helper to get bank code from bank name
async function getBankCode(bankName: string): Promise<string | null> {
  console.log(`[WORKER] Fetching bank list to resolve code for: ${bankName}`);
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`[WORKER] Failed to fetch banks: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      status: boolean;
      data: { name: string; code: string }[];
    };
    if (!data.status) {
      console.error("[WORKER] Paystack bank list error:", data);
      return null;
    }

    const bank = data.data.find(
      (b) => b.name.toLowerCase() === bankName.toLowerCase()
    );
    if (!bank) {
      console.error(`[WORKER] Bank not found: ${bankName}`);
      return null;
    }

    console.log(`[WORKER] Resolved bank code: ${bank.code} for ${bank.name}`);
    return bank.code;
  } catch (error) {
    console.error("[WORKER] Error fetching bank list:", error);
    return null;
  }
}

// Helper to create Paystack recipient
async function createRecipient(account: any): Promise<string | null> {
  const bankCode = await getBankCode(account.bankName);
  if (!bankCode) return null;

  console.log(
    `[WORKER] Creating Paystack recipient for account: ${account.accountNumber}`
  );
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: account.accountName,
        account_number: account.accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `[WORKER] Failed to create recipient: ${response.status}`,
        errorData
      );
      return null;
    }

    const data = (await response.json()) as {
      status: boolean;
      data: { recipient_code: string };
    };
    if (!data.status) {
      console.error("[WORKER] Paystack recipient creation error:", data);
      return null;
    }

    console.log(`[WORKER] Created recipient code: ${data.data.recipient_code}`);
    return data.data.recipient_code;
  } catch (error) {
    console.error("[WORKER] Error creating recipient:", error);
    return null;
  }
}

// Worker setup
const worker = new Worker(
  "payouts",
  async (job) => {
    const { withdrawalId, idempotencyKey } = job.data;
    console.log(
      `[WORKER] Processing payout job for withdrawalId: ${withdrawalId}, idempotencyKey: ${idempotencyKey}`
    );

    try {
      // Fetch withdrawal
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: { publisher: { include: { account: true } } },
      });

      if (!withdrawal) {
        console.error(`[WORKER] Withdrawal not found: ${withdrawalId}`);
        throw new Error("Withdrawal not found");
      }

      if (withdrawal.status !== "PROCESSING") {
        console.log(
          `[WORKER] Withdrawal already processed: status ${withdrawal.status}`
        );
        return; // Idempotent, skip if not processing
      }

      const publisherAccount = withdrawal.publisher.account;
      if (!publisherAccount) {
        console.error("[WORKER] Publisher account not found");
        throw new Error("Publisher account not found");
      }

      // Get or create recipient code
      // NOTE: You need to add a field 'paystackRecipientCode' to PublisherAccount schema
      // prisma migration: add paystackRecipientCode: String? @map("paystack_recipient_code")
      let recipientCode = publisherAccount.paystackRecipientCode; // Assuming field added
      if (!recipientCode) {
        console.log("[WORKER] No existing recipient code, creating new");
        recipientCode = await createRecipient(publisherAccount);
        if (!recipientCode) {
          throw new Error("Failed to create Paystack recipient");
        }

        // Update account with recipient code
        await prisma.publisherAccount.update({
          where: { publisherId: withdrawal.publisherId },
          data: { paystackRecipientCode: recipientCode },
        });
        console.log("[WORKER] Updated publisher account with recipient code");
      }

      // Initiate transfer (amount in kobo)
      const amountKobo = withdrawal.amount * 100;
      console.log(
        `[WORKER] Initiating Paystack transfer for ${amountKobo} kobo to recipient: ${recipientCode}`
      );
      const transferResponse = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: amountKobo,
          recipient: recipientCode,
          reference: withdrawal.reference,
          reason: "Seltra Publisher Earnings Withdrawal",
        }),
      });

      if (!transferResponse.ok) {
        const errorData = await transferResponse.json();
        console.error(
          `[WORKER] Paystack transfer failed: ${transferResponse.status}`,
          errorData
        );
        throw new Error("Paystack transfer failed");
      }

      const transferData = (await transferResponse.json()) as {
        status: boolean;
        message: string;
        data: { status: string };
      };
      console.log("[WORKER] Paystack transfer response:", transferData);

      if (!transferData.status || transferData.data.status !== "success") {
        console.error(
          "[WORKER] Transfer not successful:",
          transferData.data.status
        );
        throw new Error("Transfer not completed successfully");
      }

      // Update withdrawal and transaction to COMPLETED/SUCCESS
      await prisma.$transaction(async (tx) => {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "COMPLETED" },
        });
        console.log("[WORKER] Updated withdrawal status to COMPLETED");

        await tx.transaction.updateMany({
          where: { reference: withdrawal.reference, type: "WITHDRAWAL" },
          data: { status: "SUCCESS" },
        });
        console.log("[WORKER] Updated transaction status to SUCCESS");
      });

      console.log(
        `[WORKER] Payout completed successfully for withdrawalId: ${withdrawalId}`
      );
    } catch (error: any) {
      console.error(
        `[WORKER] Payout failed for withdrawalId: ${withdrawalId}:`,
        error
      );

      // On failure, refund balance and update statuses
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
      });
      if (withdrawal) {
        await prisma.$transaction(async (tx) => {
          await tx.publisherAccount.update({
            where: { publisherId: withdrawal.publisherId },
            data: { availableBalance: { increment: withdrawal.amount } },
          });
          console.log("[WORKER] Refunded amount to available balance");

          await tx.withdrawal.update({
            where: { id: withdrawalId },
            data: { status: "FAILED" },
          });
          console.log("[WORKER] Updated withdrawal status to FAILED");

          await tx.transaction.updateMany({
            where: { reference: withdrawal.reference, type: "WITHDRAWAL" },
            data: { status: "FAILED" },
          });
          console.log("[WORKER] Updated transaction status to FAILED");
        });
      }

      // Rethrow to trigger BullMQ retry
      throw error;
    }
  },
  { connection }
);

console.log("[WORKER] Payout worker started and listening for jobs");

// Handle process termination
process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
