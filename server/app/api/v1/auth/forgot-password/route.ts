import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePasswordResetToken } from "../../../../../lib/password-reset-token";
import { prisma } from "../../../../../lib/db.cjs";
import { sendPasswordResetEmail } from "../../../../../lib/email-service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    console.log("🔐 Forgot password request for:", email);

    // Generate reset token
    const resetToken = await generatePasswordResetToken(email);

    if (!resetToken) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        status: 200,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Get user for email
    const user = await prisma.user.findUnique({
      where: { id: resetToken.userId },
      select: { username: true, email: true },
    });

    if (!user) {
      return NextResponse.json({
        status: 200,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Send reset email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      resetToken.token,
      user.username || "User"
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ Password reset email sent to:", email);

    return NextResponse.json({
      status: 200,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process reset request" },
      { status: 500 }
    );
  }
}
