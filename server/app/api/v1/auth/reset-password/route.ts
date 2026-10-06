import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deletePasswordResetToken,
  validatePasswordResetToken,
} from "../../../../../lib/password-reset-token";
import { hashPassword } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    console.log("🔐 Reset password request for token");

    // Validate token
    const tokenValidation = await validatePasswordResetToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 400 }
      );
    }

    const { user, resetToken } = tokenValidation;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        // Clear any existing password reset tokens for this user
      },
    });

    // Delete the used reset token
    await deletePasswordResetToken(token);

    console.log("✅ Password reset successful for user:", user.email);

    return NextResponse.json({
      status: 200,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
