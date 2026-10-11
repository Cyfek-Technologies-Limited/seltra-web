// app/api/v1/auth/google/exchange/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../../lib/db.cjs";
import { createAuthToken } from "../../../../../../lib/user";
import {
  formatAuthUser,
  needsOnboarding,
  setAuthCookie,
  verifyGoogleExchangeCode,
} from "../../../../../../lib/onboarding";

const exchangeSchema = z.object({ code: z.string().min(1).max(2000) });

export async function POST(req: NextRequest) {
  try {
    const parsed = exchangeSchema.safeParse(await req.json());
    const userId = parsed.success
      ? await verifyGoogleExchangeCode(parsed.data.code)
      : null;

    if (!userId) {
      return NextResponse.json(
        { status: 400, error: "Sign-in link expired. Please try again." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { status: 400, error: "Sign-in link expired. Please try again." },
        { status: 400 }
      );
    }

    const token = await createAuthToken(user.id, user.roles);
    const response = NextResponse.json(
      {
        status: 200,
        msg: "Signed in with Google",
        token,
        data: formatAuthUser(user),
        needsOnboarding: needsOnboarding(user),
      },
      { status: 200 }
    );
    setAuthCookie(response, token);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Google exchange error:", error);
    return NextResponse.json(
      { status: 500, error: "Google sign-in failed. Please try again." },
      { status: 500 }
    );
  }
}
