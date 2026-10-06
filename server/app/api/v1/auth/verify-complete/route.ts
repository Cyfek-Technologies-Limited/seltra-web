import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/db.cjs";
import { createAuthToken } from "../../../../../lib/user";
import { triggerWelcomeNotification } from "../../../../../lib/notification-triggers";
import { ReferralService } from "../../../../../lib/referral-service";

const verifyCompleteSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token } = verifyCompleteSchema.parse(body);

    console.log("🚨 VERIFICATION ATTEMPT:", email);

    // Find pending registration by email AND token
    const pendingRegistration = await prisma.pendingRegistration.findFirst({
      where: {
        email: email,
        token: token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!pendingRegistration) {
      console.log("❌ Invalid or expired verification:", { email, token });
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
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
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    console.log("✅ TOKEN VALID - CREATING USER:", email);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: pendingRegistration.email,
        username: pendingRegistration.username,
        phone: pendingRegistration.phone,
        passwordHash: pendingRegistration.password,
        emailVerified: new Date(),
        roles:
          pendingRegistration.role === "publisher"
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
    const frontendRoles = [pendingRegistration.role];
    const authToken = await createAuthToken(newUser.id, frontendRoles);

    const response = NextResponse.json({
      status: 200,
      message: "Account verified and created successfully!",
      token: authToken,
      data: {
        _id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: pendingRegistration.role,
        roles: [pendingRegistration.role],
        emailVerified: true,
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
    response.headers.set("Access-Control-Allow-Origin", "https://seltra.app");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    console.log("✅ USER CREATED SUCCESSFULLY:", newUser);
    return response;
  } catch (error) {
    console.error("🔴 VERIFICATION ERROR:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Verification Failed",
        verifyErrorName: error.name,
        verifyErrormessage: error.message,
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "https://seltra.app");
  response.headers.set("Access-Control-Allow-Credentials", "true");
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
