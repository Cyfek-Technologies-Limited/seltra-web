// app/api/v1/auth/google/route.ts
import { handleResponse } from "../../../../../lib";
import { createGoogleState, googleRedirectUri } from "../../../../../lib/onboarding";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Role is no longer passed here: new Google users choose it during onboarding.
export async function GET() {
  try {
    if (!GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_APP_URL) {
      return handleResponse(500, "Google sign-in is not configured");
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", googleRedirectUri());
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("state", await createGoogleState());
    authUrl.searchParams.set("prompt", "select_account");

    return handleResponse(200, "Google OAuth URL generated", {
      authUrl: authUrl.toString(),
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return handleResponse(500, "Failed to initialize Google authentication");
  }
}
