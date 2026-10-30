import { createHmac, randomInt } from "crypto";

export function generateVerificationCode(): string {
  return randomInt(10_000, 100_000).toString();
}

export function hashVerificationCode(code: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return createHmac("sha256", secret)
    .update(`${email}:${code}`)
    .digest("hex");
}

export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
