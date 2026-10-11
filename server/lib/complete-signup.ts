// lib/complete-signup.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "./db.cjs";
import { createAuthToken, getUserIdFromRequest } from "./user";
import { formatAuthUser, setAuthCookie } from "./onboarding";

const completeSignupSchema = z.object({
  role: z.enum(["publisher", "advertiser"]),
  acceptedTerms: z.literal(true),
  username: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .max(25)
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Phone number must have at least 10 digits",
    }),
  referralCode: z.string().optional(),
});

function errorResponse(status: number, error: string) {
  return NextResponse.json({ status, error }, { status });
}

export async function handleCompleteSignup(
  req: NextRequest,
  flow: "email" | "google"
) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return errorResponse(401, "Unauthorized");

    const parsed = completeSignupSchema.safeParse(await req.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0];
      const message =
        field === "acceptedTerms"
          ? "You must accept the terms to continue"
          : field === "role"
          ? "Please choose publisher or advertiser"
          : field === "username"
          ? "Please enter your full name"
          : field === "phone"
          ? "Please enter a valid phone number"
          : "Invalid input";
      return errorResponse(400, message);
    }
    const { role, username, phone } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse(404, "User not found");

    if (flow === "email" && !user.emailVerified) {
      return errorResponse(403, "Please verify your email first");
    }
    if (flow === "google" && !user.googleId) {
      return errorResponse(403, "This account is not linked to Google");
    }
    if (user.roles.length > 0) {
      return errorResponse(409, "Account setup already completed");
    }

    const enumRole = role === "publisher" ? "PUBLISHER" : "ADVERTISER";

    const updatedUser = await prisma.$transaction(async (tx: any) => {
      // Conditional update guards against two concurrent requests assigning roles.
      const { count } = await tx.user.updateMany({
        where: { id: userId, roles: { isEmpty: true } },
        data: { roles: [enumRole], username, phone },
      });
      if (count === 0) return null;

      if (enumRole === "PUBLISHER") {
        const existingPublisher = await tx.publisher.findUnique({
          where: { userId },
        });
        if (!existingPublisher) {
          const publisher = await tx.publisher.create({
            data: { userId, verified: false },
          });
          await tx.publisherAccount.create({
            data: {
              publisherId: publisher.id,
              totalEarnings: 0,
              availableBalance: 0,
              pendingBalance: 0,
              isVerified: false,
            },
          });
        }
      }

      return tx.user.findUnique({ where: { id: userId } });
    });

    if (!updatedUser) {
      return errorResponse(409, "Account setup already completed");
    }

    const token = await createAuthToken(updatedUser.id, updatedUser.roles);
    const response = NextResponse.json(
      {
        status: 200,
        msg: "Account setup completed",
        token,
        data: formatAuthUser(updatedUser),
      },
      { status: 200 }
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Complete signup failed:", error);
    return errorResponse(500, "Failed to complete your account setup");
  }
}
