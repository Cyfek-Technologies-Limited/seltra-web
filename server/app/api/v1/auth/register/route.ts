import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "../../../../../lib/db.cjs";
import { hashPassword } from "../../../../../lib";
import { sendVerificationEmail } from "../../../../../lib/email-service";
import {
  generateVerificationCode,
  hashVerificationCode,
  VERIFICATION_CODE_TTL_MS,
} from "../../../../../lib/verification-code";

// New signups send only email + password; role, name and phone are collected
// during onboarding. The legacy fields stay optional so older clients keep working.
const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
  username: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  role: z.enum(["publisher", "advertiser", "admin"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 400,
          error: "Please enter a valid email and a password of at least 8 characters",
        },
        { status: 400 }
      );
    }
    const {
      username,
      phone,
      email,
      password,
      referralCode,
      role: inputRole,
    } = parsed.data;

    console.log("🚨 PRODUCTION REGISTRATION - NO USER CREATION:", email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const isGoogleOnly =
        existingUser.authProvider === "GOOGLE" && !existingUser.passwordHash;
      return NextResponse.json(
        {
          status: 409,
          error: isGoogleOnly
            ? "This email is registered with Google. Please continue with Google."
            : "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Check if pending registration exists
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (existingPending) {
      return NextResponse.json(
        {
          status: "409",
          error: "Verification already sent. Please check your email.",
        },
        { status: 409 }
      );
    }

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(code, email);
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

    // Hash password for temporary storage
    const hashedPassword = await hashPassword(password);

    // Store in pending registrations
    // An empty role means "choose during onboarding".
    const pendingData: any = {
      email,
      username: username ?? "",
      phone: phone ?? "",
      password: hashedPassword,
      role: inputRole ?? "",
      token: codeHash,
      expiresAt,
    };

    // Only include referralCode if it has a value
    if (referralCode && referralCode.trim() !== "") {
      pendingData.referralCode = referralCode;
    }

    // Store in pending registrations - NO USER CREATED
    await prisma.pendingRegistration.create({
      data: pendingData,
    });

    // Send ACTUAL verification email
    const emailSent = await sendVerificationEmail(
      email,
      code,
      username || "there"
    );
    if (!emailSent) {
      // Clean up pending registration if email fails
      await prisma.pendingRegistration.deleteMany({ where: { email } });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ PENDING REGISTRATION CREATED - NO USER IN DATABASE");

    return NextResponse.json({
      status: 200,
      msg: "Verification email sent",
      message:
        "Verification email sent. You must verify your email before your account is created.",
      verificationRequired: true,
    });
  } catch (error) {
    console.error("🔴 FULL PRISMA ERROR DETAILS:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error meta:", error.meta);
    console.error("Full error:", JSON.stringify(error, null, 2));

    // Clean up
    try {
      const { email } = await req.json();
      await prisma.pendingRegistration.deleteMany({ where: { email } });
    } catch {}

    return NextResponse.json(
      {
        error: error.name,
        registerErrorMessage: error.message,
      },
      { status: 500 }
    );
  }
}
