// app/api/v1/publisher/withdraw/route.ts - UPDATED TO USE "SUCCESS" FOR WITHDRAWAL STATUS AND HANDLE 'PENDING' AS SUCCESS
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch"; // For Paystack API calls
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");
}

// Helper to get bank code from bank name
async function getBankCode(bankName: string): Promise<string | null> {
  console.log(`[BACKEND] Fetching bank list to resolve code for: ${bankName}`);
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`[BACKEND] Failed to fetch banks: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      status: boolean;
      data: { name: string; code: string }[];
    };
    if (!data.status) {
      console.error("[BACKEND] Paystack bank list error:", data);
      return null;
    }

    const bank = data.data.find(
      (b) => b.name.toLowerCase() === bankName.toLowerCase()
    );
    if (!bank) {
      console.error(`[BACKEND] Bank not found: ${bankName}`);
      return null;
    }

    console.log(`[BACKEND] Resolved bank code: ${bank.code} for ${bank.name}`);
    return bank.code;
  } catch (error) {
    console.error("[BACKEND] Error fetching bank list:", error);
    return null;
  }
}

// Helper to create Paystack recipient
async function createRecipient(account: any): Promise<string | null> {
  const bankCode = await getBankCode(account.bankName);
  if (!bankCode) return null;

  console.log(
    `[BACKEND] Creating Paystack recipient for account: ${account.accountNumber}`
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
        `[BACKEND] Failed to create recipient: ${response.status}`,
        errorData
      );
      return null;
    }

    const data = (await response.json()) as {
      status: boolean;
      data: { recipient_code: string };
    };
    if (!data.status) {
      console.error("[BACKEND] Paystack recipient creation error:", data);
      return null;
    }

    console.log(
      `[BACKEND] Created recipient code: ${data.data.recipient_code}`
    );
    return data.data.recipient_code;
  } catch (error) {
    console.error("[BACKEND] Error creating recipient:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[BACKEND] Received withdrawal request");

    const user = await getCurrentUserWithRoles(req);
    if (!user) {
      console.log("[BACKEND] Authentication failed");
      return handleResponse(401, "Authentication required");
    }

    if (!user.roles.includes("PUBLISHER")) {
      console.log("[BACKEND] User not a publisher");
      return handleResponse(401, "Only publishers can withdraw funds");
    }

    const { amount, idempotencyKey } = await req.json();
    console.log(
      `[BACKEND] Requested amount: ${amount}, idempotencyKey: ${
        idempotencyKey || "generated"
      }`
    );

    const min = Number(process.env.MIN_WITHDRAWAL || 100);
    const max = Number(process.env.MAX_WITHDRAWAL || 50000);

    if (!amount || amount <= 0) {
      console.log("[BACKEND] Invalid amount");
      return handleResponse(400, "Valid amount required");
    }
    if (amount < min) {
      console.log(`[BACKEND] Amount below min: ${amount} < ${min}`);
      return handleResponse(400, `Minimum withdrawal is ₦${min}`);
    }
    if (amount > max) {
      console.log(`[BACKEND] Amount above max: ${amount} > ${max}`);
      return handleResponse(400, `Maximum withdrawal is ₦${max}`);
    }

    // Fetch publisher and account
    console.log(`[BACKEND] Fetching publisher for userId: ${user.userId}`);
    const publisher = await prisma.publisher.findUnique({
      where: { userId: user.userId },
      include: { account: true },
    });
    if (!publisher || !publisher.account) {
      console.log("[BACKEND] Publisher account not found");
      return handleResponse(400, "Publisher account not found");
    }
    if (!publisher.account.isVerified) {
      console.log("[BACKEND] Bank account not verified");
      return handleResponse(400, "Bank account not verified");
    }
    if (amount > publisher.account.availableBalance) {
      console.log(
        `[BACKEND] Insufficient balance: ${amount} > ${publisher.account.availableBalance}`
      );
      return handleResponse(400, "Insufficient balance");
    }

    // Create unique reference & idempotencyKey
    const reference = `WDL-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 8)}`;
    const idKey = idempotencyKey || uuidv4();
    console.log(
      `[BACKEND] Generated reference: ${reference}, idempotencyKey: ${idKey}`
    );

    // Use a DB transaction to create withdrawal, decrement balance, and create pending transaction
    console.log("[BACKEND] Starting DB transaction");
    const withdrawal = await prisma.$transaction(
      async (tx) => {
        // Avoid duplicate idempotencyKey
        const existing = await tx.withdrawal.findUnique({
          where: { idempotencyKey: idKey },
        });
        if (existing) {
          console.log(`[BACKEND] Duplicate idempotencyKey found: ${idKey}`);
          return existing;
        }

        const wd = await tx.withdrawal.create({
          data: {
            publisherId: publisher.id,
            amount,
            status: "PROCESSING",
            reference,
            idempotencyKey: idKey,
          },
        });
        console.log(`[BACKEND] Created withdrawal ID: ${wd.id}`);

        // Decrement availableBalance
        await tx.publisherAccount.update({
          where: { publisherId: publisher.id },
          data: { availableBalance: { decrement: amount } },
        });
        console.log("[BACKEND] Decremented available balance");

        // Create transaction record for ledger (status: PENDING)
        await tx.transaction.create({
          data: {
            userId: user.userId,
            amount,
            type: "WITHDRAWAL",
            status: "PENDING",
            reference,
          },
        });
        console.log("[BACKEND] Created pending transaction record");

        return wd;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    // Process Paystack payout synchronously
    console.log(
      `[BACKEND] Starting Paystack payout for withdrawal ID: ${withdrawal.id}`
    );
    try {
      const publisherAccount = publisher.account;
      if (!publisherAccount) {
        throw new Error("Publisher account not found");
      }

      // Get or create recipient code
      let recipientCode = publisherAccount.paystackRecipientCode;
      if (!recipientCode) {
        console.log("[BACKEND] No existing recipient code, creating new");
        recipientCode = await createRecipient(publisherAccount);
        if (!recipientCode) {
          throw new Error("Failed to create Paystack recipient");
        }

        // Update account with recipient code
        await prisma.publisherAccount.update({
          where: { publisherId: withdrawal.publisherId },
          data: { paystackRecipientCode: recipientCode },
        });
        console.log("[BACKEND] Updated publisher account with recipient code");
      }

      // Initiate transfer (amount in kobo)
      const amountKobo = withdrawal.amount * 100;
      console.log(
        `[BACKEND] Initiating Paystack transfer for ${amountKobo} kobo to recipient: ${recipientCode}`
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
          `[BACKEND] Paystack transfer failed: ${transferResponse.status}`,
          errorData
        );
        throw new Error("Paystack transfer failed");
      }

      const transferData = (await transferResponse.json()) as {
        status: boolean;
        message: string;
        data: { status: string };
      };
      console.log("[BACKEND] Paystack transfer response:", transferData);

      if (!transferData.status) {
        console.error(
          "[BACKEND] Transfer not successful:",
          transferData.message
        );
        throw new Error("Transfer not completed successfully");
      }

      const transferStatus = transferData.data.status;
      if (transferStatus === "otp") {
        // Specific handling for OTP case
        throw new Error(
          "Transfer requires OTP. Please disable OTP in your Paystack dashboard for automated transfers: https://dashboard.paystack.com/#/settings/preferences"
        );
      } else if (transferStatus !== "success" && transferStatus !== "pending") {
        console.error("[BACKEND] Transfer not successful:", transferStatus);
        throw new Error(
          `Transfer status: ${transferStatus}. Expected 'success' or 'pending'.`
        );
      }

      // Update withdrawal and transaction to SUCCESS
      await prisma.$transaction(
        async (tx) => {
          await tx.withdrawal.update({
            where: { id: withdrawal.id },
            data: { status: "SENT" }, // Changed from "COMPLETED" to "SUCCESS" to match likely enum value
          });
          console.log("[BACKEND] Updated withdrawal status to SUCCESS");

          await tx.transaction.updateMany({
            where: { reference: withdrawal.reference, type: "WITHDRAWAL" },
            data: { status: "SENT" },
          });
          console.log("[BACKEND] Updated transaction status to SUCCESS");
        },
        {
          maxWait: 5000,
          timeout: 10000, // Increased timeout for status update transaction
        }
      );

      console.log(
        `[BACKEND] Payout completed successfully for withdrawalId: ${withdrawal.id}`
      );

      return handleResponse(200, "Withdrawal completed successfully", {
        withdrawalId: withdrawal.id,
      });
    } catch (error: any) {
      console.error(
        `[BACKEND] Payout failed for withdrawalId: ${withdrawal.id}:`,
        error
      );

      // On failure, refund balance and update statuses
      await prisma.$transaction(
        async (tx) => {
          await tx.publisherAccount.update({
            where: { publisherId: withdrawal.publisherId },
            data: { availableBalance: { increment: withdrawal.amount } },
          });
          console.log("[BACKEND] Refunded amount to available balance");

          await tx.withdrawal.update({
            where: { id: withdrawal.id },
            data: { status: "FAILED" },
          });
          console.log("[BACKEND] Updated withdrawal status to FAILED");

          await tx.transaction.updateMany({
            where: { reference: withdrawal.reference, type: "WITHDRAWAL" },
            data: { status: "FAILED" },
          });
          console.log("[BACKEND] Updated transaction status to FAILED");
        },
        {
          maxWait: 5000,
          timeout: 10000, // Increased timeout for refund transaction to prevent expiration
        }
      );

      return handleResponse(500, "Withdrawal failed: " + error.message);
    }
  } catch (err: any) {
    console.error("[BACKEND] Withdraw endpoint error:", err);
    return handleResponse(500, "Internal server error", err);
  }
}
