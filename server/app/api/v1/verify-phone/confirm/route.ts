// app/api/verify-phone/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db.cjs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const otpHash = crypto.createHash("sha256").update(code).digest("hex");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (
    !dbUser?.phoneOtpHash ||
    dbUser.phoneOtpHash !== otpHash ||
    !dbUser.phoneOtpExpiresAt ||
    dbUser.phoneOtpExpiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "Invalid or expired code" },
      { status: 400 }
    );
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.userId },
    data: {
      verified: true,
      phoneOtpHash: null,
      phoneOtpExpiresAt: null,
    },
  });

  return NextResponse.json(
    { success: true, data: verifiedUser },
    { status: 200 }
  );
}
