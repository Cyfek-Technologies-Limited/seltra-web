// app/api/verify-phone/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser, getFullUser } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db.cjs";
import { sendWhatsAppTemplate } from "../../../../../lib/whatsapp-service";

function generateOtp() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
}

export async function POST(req: NextRequest) {
  const user = await getFullUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  const otp = generateOtp();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  console.log("otp generated", otp);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone,
      phoneOtpHash: otpHash,
      phoneOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 5 mins
    },
  });

  // WhatsApp template: "phone_verification"
  const isCodeSent = await sendWhatsAppTemplate(
    phone,
    "seltra_verification_code",
    [otp, "09165165583"], // body params
    "Expires in 10 minutes.", // footer
    otp // URL button param
  );

  console.log("WhatsApp template:", isCodeSent);

  if (!isCodeSent)
    return NextResponse.json(
      { success: false, data: isCodeSent },
      { status: 400 }
    );

  return NextResponse.json({ success: true, data: isCodeSent });
}
