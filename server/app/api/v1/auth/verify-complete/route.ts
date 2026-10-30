import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/db.cjs";
import { createAuthToken } from "../../../../../lib/user";
import { triggerWelcomeNotification } from "../../../../../lib/notification-triggers";
import { ReferralService } from "../../../../../lib/referral-service";
import { rateLimit } from "../../../../../lib/rate-limit";
import { hashVerificationCode } from "../../../../../lib/verification-code";

const verifyCompleteSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{5}$/),
});

function applyVerificationCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://seltra.cyfek.com",
    "https://seltra.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ]
    .filter(Boolean)
    .map((value) => value!.replace(/\/+$/, ""));

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  response.headers.append("Vary", "Origin");
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const limit = rateLimit(req, 5, 60_000);
    if (!limit.success) {
      return applyVerificationCors(
        NextResponse.json(
          { error: "Too many code attempts. Please wait a minute and try again." },
          { status: 429 }
        ),
        req
      );
    }

    const body = await req.json();
    const parsed = verifyCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return applyVerificationCors(
        NextResponse.json(
          { error: "Enter a valid email and 5-digit verification code." },
          { status: 400 }
        ),
        req
      );
    }
    const { email, code } = parsed.data;

    console.log("🚨 VERIFICATION ATTEMPT:", email);

    // The short code is stored as a hash, never in plain text.
    const pendingRegistration = await prisma.pendingRegistration.findFirst({
      where: {
        email: email,
        token: hashVerificationCode(code, email),
        expiresAt: { gt: new Date() },
      },
    });

    if (!pendingRegistration) {
      console.log("Incorrect or expired verification code:", email);
      return applyVerificationCors(
        NextResponse.json(
          {
            error:
              "That code is incorrect or has expired. Check the code and try again, or request a new one.",
          },
          { status: 400 }
        ),
        req
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Silently clean up pending registration without throwing errors
      await prisma.pendingRegistration
        .deleteMany({
          where: { email: email },
        })
        .catch(() => {}); // Ignore errors if record already gone
      return applyVerificationCors(
        NextResponse.json({ error: "User already exists" }, { status: 409 }),
        req
      );
    }

    console.log("✅ TOKEN VALID - CREATING USER:", email);

    // Empty role = new email-only signup; role is chosen during onboarding.
    const pendingRole = pendingRegistration.role || null;

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: pendingRegistration.email,
        username: pendingRegistration.username || null,
        ...(pendingRegistration.phone
          ? { phone: pendingRegistration.phone }
          : {}),
        passwordHash: pendingRegistration.password,
        emailVerified: new Date(),
        roles: !pendingRole
          ? []
          : pendingRole === "publisher"
          ? ["PUBLISHER"]
          : ["ADVERTISER"],
      },
    });

    // ✅ PROCESS REFERRAL IF CODE PROVIDED
    // if (pendingRegistration.referralCode) {
    //   try {
    //     await ReferralService.useReferralCode(
    //       pendingRegistration.referralCode,
    //       newUser.id
    //     );
    //   } catch (referralError) {
    //     console.error(
    //       "Referral processing failed, but user created:",
    //       referralError
    //     );
    //     // Don't fail user registration if referral fails
    //   }
    // }

    // await triggerWelcomeNotification(newUser.id, pendingRegistration.role);

    // Create publisher if needed
    if (pendingRegistration.role === "publisher") {
      const publisher = await prisma.publisher.create({
        data: {
          userId: newUser.id,
          verified: false,
        },
      });

      await prisma.publisherAccount.create({
        data: {
          publisherId: publisher.id,
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          isVerified: false,
        },
      });
    }

    // Create token
    const frontendRoles = pendingRole ? [pendingRole] : [];
    const authToken = await createAuthToken(newUser.id, frontendRoles);

    const response = NextResponse.json({
      status: 200,
      msg: "Email verified",
      message: "Account verified and created successfully!",
      token: authToken,
      needsOnboarding: !pendingRole,
      data: {
        _id: newUser.id,
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: pendingRole,
        roles: frontendRoles,
        emailVerified: true,
        onboardingCompleted: Boolean(pendingRole),
      },
    });

    // Set auth cookie
    response.cookies.set({
      name: "auth-token",
      value: authToken,
      httpOnly: true,
      secure: true,
      sameSite: "none", // Changed for cross-domain
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Clean up pending registration - use deleteMany and ignore errors
    await prisma.pendingRegistration
      .deleteMany({
        where: { email: email },
      })
      .catch((error) => {
        console.log(
          "⚠️ Could not delete pending registration (might already be deleted):",
          error
        );
      });

    // Add CORS headers for cross-domain

    console.log("✅ USER CREATED SUCCESSFULLY:", newUser);
    return applyVerificationCors(response, req);
  } catch (error) {
    console.error("🔴 VERIFICATION ERROR:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return applyVerificationCors(
      NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 500 }
      ),
      req
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  applyVerificationCors(response, req);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
