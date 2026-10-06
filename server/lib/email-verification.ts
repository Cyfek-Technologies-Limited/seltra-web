import { prisma } from "./db.cjs";
import crypto from "crypto";

export async function generateVerificationToken(userId: string) {
  // Delete any existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { userId },
  });

  // Generate new token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const verificationToken = await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return verificationToken;
}

export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    throw new Error("Invalid verification token");
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    throw new Error("Verification token has expired");
  }

  // Update user email verification status
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return verificationToken.user;
}

export async function isEmailVerified(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return !!user?.emailVerified;
}
