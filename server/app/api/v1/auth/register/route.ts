import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import crypto from "crypto";
import { prisma } from "../../../../../lib/db.cjs";
import { hashPassword } from "../../../../../lib";
import { sendVerificationEmail } from "../../../../../lib/email-service";

const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
  referralCode: z.string().optional(),
  role: z.enum(["publisher", "advertiser", "admin"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      phone,
      email,
      password,
      referralCode,
      role: inputRole,
    } = registerSchema.parse(body);

    console.log("🚨 PRODUCTION REGISTRATION - NO USER CREATION:", email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { status: "409", error: "User already exists with this email" },
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

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password for temporary storage
    const hashedPassword = await hashPassword(password);

    // Store in pending registrations
    const pendingData: any = {
      email,
      username,
      phone,
      password: hashedPassword,
      role: inputRole,
      token,
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
    const emailSent = await sendVerificationEmail(email, token, username);
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
