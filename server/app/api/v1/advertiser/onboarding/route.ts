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

const MONTHLY_BUDGETS = [
  "Under ₦50,000",
  "₦50,000 - ₦200,000",
  "₦200,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "Over ₦1,000,000",
  "Not sure yet",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const advertiserOnboardingSchema = z.object({
  companyName: z.string().trim().min(1).max(100),
  industry: z.string().trim().min(1).max(100),
  targetAudience: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
  audienceNotes: optionalText(500),
  campaignGoal: z.enum(CAMPAIGN_GOALS),
  monthlyBudget: z.enum(MONTHLY_BUDGETS),
  targetLocations: optionalText(200),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { status: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const parsed = advertiserOnboardingSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 400,
          error: "Please fill in all required business details",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    if (!user) {
      return NextResponse.json(
        { status: 404, error: "User not found" },
        { status: 404 }
      );
    }
    if (!user.roles.includes("ADVERTISER")) {
      return NextResponse.json(
        { status: 403, error: "Only advertisers can complete this onboarding" },
        { status: 403 }
      );
    }

    const profile = await prisma.advertiserProfile.upsert({
      where: { userId },
      create: { userId, ...parsed.data },
      update: parsed.data,
    });

    return NextResponse.json(
      {
        status: 200,
        msg: "Advertiser onboarding completed successfully",
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Advertiser onboarding failed:", error);
    return NextResponse.json(
      { status: 500, error: "Failed to save advertiser profile" },
      { status: 500 }
    );
  }
}
