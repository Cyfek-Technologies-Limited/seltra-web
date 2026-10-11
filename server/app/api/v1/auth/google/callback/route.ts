// app/api/v1/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../../../../../lib/db.cjs";
import {
  createGoogleExchangeCode,
  googleRedirectUri,
  verifyGoogleState,
} from "../../../../../../lib/onboarding";

const FRONTEND_URL = process.env.FRONTEND_URL;

function redirectToFrontend(params: Record<string, string>) {
  const url = new URL(`${FRONTEND_URL}/auth/oauth-success`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url.toString(), 302);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("error")) {
    return redirectToFrontend({ error: "Google sign-in was cancelled." });
  }

  try {
    if (!(await verifyGoogleState(searchParams.get("state")))) {
      return redirectToFrontend({
        error: "Sign-in session expired. Please try again.",
      });
    }

    const code = searchParams.get("code");
    if (!code) {
      return redirectToFrontend({ error: "Missing Google authorization code." });
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      googleRedirectUri()
    );
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return redirectToFrontend({ error: "Google did not return an identity." });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();

    if (!profile?.sub || !profile.email || !profile.email_verified) {
      return redirectToFrontend({
        error: "Your Google email address is not verified.",
      });
    }

    let user = await prisma.user.findUnique({
      where: { googleId: profile.sub },
    });

    if (!user) {
      const existingByEmail = await prisma.user.findFirst({
        where: { email: { equals: profile.email, mode: "insensitive" } },
      });

      if (existingByEmail) {
        // Same verified email: link Google to the existing account.
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.sub,
            avatar: existingByEmail.avatar ?? profile.picture ?? null,
            emailVerified: existingByEmail.emailVerified ?? new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email.toLowerCase(),
            username: profile.name ?? null,
            googleId: profile.sub,
            avatar: profile.picture ?? null,
            authProvider: "GOOGLE",
            emailVerified: new Date(),
            roles: [],
          },
        });
      }
    }

    const exchangeCode = await createGoogleExchangeCode(user.id);
    return redirectToFrontend({ code: exchangeCode });
  } catch (error) {
    console.error("Google callback error:", error);
    return redirectToFrontend({
      error: "Google sign-in failed. Please try again.",
    });
  }
}
