import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/db.cjs";
import { getUserIdFromRequest } from "../../../../../lib/user";

const CAMPAIGN_GOALS = [
  "Brand awareness",
  "More sales",
  "Website or app visits",
  "Walk-in customers",
  "Promote an event",
  "Grow social followers",
] as const;

const profileUpdateSchema = z
  .object({
    username: z.string().trim().min(2).max(50).nullable().optional(),
    phone: z.string().trim().max(30).nullable().optional(),
    companyName: z.string().trim().min(1).max(100).optional(),
    industry: z.string().trim().min(1).max(100).optional(),
    targetAudience: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
    audienceNotes: z.string().trim().max(500).nullable().optional(),
    campaignGoal: z.enum(CAMPAIGN_GOALS).optional(),
    monthlyBudget: z.string().trim().min(1).max(60).optional(),
    targetLocations: z.string().trim().max(200).nullable().optional(),
  })
  .strict();

async function getAdvertiserId(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return { error: "Unauthorized", status: 401 as const };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, roles: true },
  });
  if (!user) return { error: "User not found", status: 404 as const };
  if (!user.roles.includes("ADVERTISER")) {
    return { error: "Advertiser access required", status: 403 as const };
  }
  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAdvertiserId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        email: true,
        username: true,
        phone: true,
        createdAt: true,
        advertiserProfile: true,
      },
    });
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("Failed to load advertiser profile:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAdvertiserId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = profileUpdateSchema.safeParse(await request.json());
    if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
      return NextResponse.json(
        { error: "Please provide valid profile fields to update" },
        { status: 400 }
      );
    }

    const { username, phone, ...advertiserFields } = parsed.data;
    const hasAdvertiserFields = Object.keys(advertiserFields).length > 0;

    const profile = await prisma.advertiserProfile.findUnique({
      where: { userId: auth.userId },
      select: { userId: true },
    });
    if (hasAdvertiserFields && !profile) {
      return NextResponse.json(
        { error: "Complete advertiser onboarding before editing business details" },
        { status: 409 }
      );
    }

    const data = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id: auth.userId },
        data: {
          ...(username !== undefined ? { username: username || null } : {}),
          ...(phone !== undefined ? { phone: phone || "No Phone Number" } : {}),
        },
        select: { email: true, username: true, phone: true, createdAt: true },
      });
      if (hasAdvertiserFields) {
        await tx.advertiserProfile.update({
          where: { userId: auth.userId },
          data: advertiserFields,
        });
      }
      const advertiserProfile = await tx.advertiserProfile.findUnique({
        where: { userId: auth.userId },
      });
      return { ...user, advertiserProfile };
    });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Failed to update advertiser profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
