import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationEmail } from "../../../../../lib/email-service";
import { prisma } from "../../../../../lib/db.cjs";
import { canResendEmail } from "../../../../../lib/rate-limit";
import {
  generateVerificationCode,
  hashVerificationCode,
  VERIFICATION_CODE_TTL_MS,
} from "../../../../../lib/verification-code";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resendSchema.parse(body);

    console.log("🔄 RESEND VERIFICATION REQUEST:", email);

    // Check if pending registration exists
    const pendingRegistration = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pendingRegistration) {
      return NextResponse.json(
        { error: "No pending registration found. Please sign up again." },
        { status: 404 }
      );
    }

    // Check if user already exists (edge case)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Clean up pending registration
      await prisma.pendingRegistration.delete({ where: { email } });
      return NextResponse.json(
        { error: "User already exists. Please log in instead." },
        { status: 409 }
      );
    }

    if (!canResendEmail(email)) {
      return NextResponse.json(
        { error: "You have requested too many codes. Please try again later." },
        { status: 429 }
      );
    }

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(code, email);
    const newExpiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

    // Update pending registration with new token
    await prisma.pendingRegistration.update({
      where: { email },
      data: {
        token: codeHash,
        expiresAt: newExpiresAt,
      },
    });

    // Send new verification email
    const emailSent = await sendVerificationEmail(
      email,
      code,
      pendingRegistration.username
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ VERIFICATION EMAIL RESENT:", email);

    return NextResponse.json({
      status: 200,
      message: "A new verification code was sent to your email.",
      email: email,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
