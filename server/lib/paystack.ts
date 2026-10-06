// lib/paystack.ts - UPDATED WITH TRANSACTION INITIALIZATION
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";
import axios from "axios";

const PAYSTACK_URL = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY;
// Detect if we're in live mode
const IS_LIVE_MODE =
  PAYSTACK_SECRET_KEY?.startsWith("sk_live_") ||
  process.env.NODE_ENV === "production";

function headers(idempotencyKey?: string) {
  return {
    Authorization: `Bearer ${SECRET}`,
    "Content-Type": "application/json",
    ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
  };
}

export class PaystackService {
  private static baseURL = PAYSTACK_BASE_URL;
  private static secretKey = PAYSTACK_SECRET_KEY;
  private static isLiveMode = IS_LIVE_MODE;

  private static async makeRequest(url: string, options: RequestInit = {}) {
    try {
      console.log(
        `🔍 [PAYSTACK ${this.isLiveMode ? "LIVE" : "TEST"}] Making request to:`,
        url
      );

      if (!this.secretKey) {
        throw new Error("Paystack secret key not configured");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log(
        `✅ [PAYSTACK ${this.isLiveMode ? "LIVE" : "TEST"}] Request successful`
      );
      return data;
    } catch (error: any) {
      console.error(
        `❌ [PAYSTACK ${this.isLiveMode ? "LIVE" : "TEST"}] API error:`,
        error
      );
      throw error;
    }
  }

  // ADD THIS METHOD - Initialize payment transaction
  static async initializeTransaction(
    email: string,
    amount: number, // amount in kobo
    reference: string,
    metadata: any = {},
    callbackUrl?: string
  ): Promise<any> {
    try {
      console.log("🔍 [PAYSTACK] Initializing transaction:", {
        email,
        amount,
        reference,
        metadata,
      });

      if (!this.secretKey) {
        throw new Error("Paystack secret key not configured");
      }

      const payload: any = {
        email,
        amount: Math.round(amount), // Ensure amount is in kobo
        reference,
        metadata,
        currency: "NGN",
      };

      // Add callback URL if provided
      if (callbackUrl) {
        payload.callback_url = callbackUrl;
      }

      const url = `${this.baseURL}/transaction/initialize`;
      const response = await this.makeRequest(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("✅ [PAYSTACK] Transaction initialized successfully");
      return response;
    } catch (error) {
      console.error("❌ [PAYSTACK] Initialize transaction error:", error);
      throw error;
    }
  }

  // Verify transaction (add this too)
  static async verifyTransaction(reference: string): Promise<any> {
    try {
      console.log("🔍 [PAYSTACK] Verifying transaction:", reference);

      const url = `${this.baseURL}/transaction/verify/${reference}`;
      const response = await this.makeRequest(url);

      console.log("✅ [PAYSTACK] Transaction verified successfully");
      return response;
    } catch (error) {
      console.error("❌ [PAYSTACK] Verify transaction error:", error);
      throw error;
    }
  }

  // Get list of supported banks
  static async getBanks(): Promise<any[]> {
    const url = `${this.baseURL}/bank?country=nigeria&currency=NGN`;
    const data = await this.makeRequest(url);
    return data.data;
  }

  // Verify account number
  static async verifyAccountNumber(accountNumber: string, bankCode: string) {
    const url = `${this.baseURL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;
    return await this.makeRequest(url);
  }

  // 2️⃣ Verify account number
  static async verifyAccount(accountNumber: string, bankCode: string) {
    const res = await axios.get(
      `${PAYSTACK_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: headers() }
    );
    return res.data;
  }

  static async ensureRecipient(
    accountNumber: string,
    bankCode: string,
    accountName: string,
    idempotencyKey: string
  ) {
    const res = await axios.post(
      `${PAYSTACK_URL}/transferrecipient`,
      {
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      { headers: headers(idempotencyKey) }
    );

    if (!res.data.status) throw new Error("Failed to create recipient");

    return res.data.data.recipient_code;
  }

  // Create transfer recipient
  static async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
    type: string = "nuban"
  ) {
    const url = `${this.baseURL}/transferrecipient`;
    return await this.makeRequest(url, {
      method: "POST",
      body: JSON.stringify({
        type,
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    });
  }

  // Initiate transfer (THIS WILL WORK AFTER UPGRADE)

  // 4️⃣ Initiate transfer
  static async initiateTransfer(
    amount: number,
    recipientCode: string,
    reference: string,
    idempotencyKey: string
  ) {
    const res = await axios.post(
      `${PAYSTACK_URL}/transfer`,
      {
        source: "balance",
        amount,
        recipient: recipientCode,
        reason: "Seltra Publisher Withdrawal",
        reference,
      },
      { headers: headers(idempotencyKey) }
    );

    return res.data;
  }

  static async getTransfer(transferCodeOrId: string) {
    try {
      const url = `${this.baseURL}/transfer/${transferCodeOrId}`;
      const res = await this.makeRequest(url, {
        method: "POST",
      });

      return res.data;
    } catch (error: any) {
      console.error(
        "Paystack getTransfer error",
        error.response?.data || error
      );
      return null;
    }
  }

  // Complete transfer flow
  static async processPayout({
    amount,
    accountNumber,
    bankName,
    accountName,
    reference,
    idempotencyKey,
  }: any) {
    // A. Get banks → find bank code
    const banks = await this.getBanks();
    const bank = banks.find((b) =>
      b.name.toLowerCase().includes(bankName.toLowerCase())
    );

    if (!bank) throw new Error(`Bank not found: ${bankName}`);

    // B. Verify account
    const verified = await this.verifyAccount(accountNumber, bank.code);
    if (!verified.status) throw new Error("Account number verification failed");

    // C. Create recipient
    const recipientCode = await this.ensureRecipient(
      accountNumber,
      bank.code,
      accountName,
      idempotencyKey
    );

    // D. Initiate transfer
    const transfer = await this.initiateTransfer(
      amount,
      recipientCode,
      reference,
      idempotencyKey
    );

    return {
      status: transfer.status,
      transferCode: transfer.data.transfer_code,
      message: transfer.message,
    };
  }
}
