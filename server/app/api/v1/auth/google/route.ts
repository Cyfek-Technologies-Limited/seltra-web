// app/api/v1/auth/google/route.ts
import { NextRequest } from "next/server";
import { handleResponse } from "../../../../../lib";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "publisher"; // Default role

    // Construct Google OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set(
      "redirect_uri",
      `${BASE_URL}/api/v1/auth/google/callback`
    );
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "profile email");
    authUrl.searchParams.set("state", role); // Store role in state
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    return handleResponse(200, "Google OAuth URL generated", {
      authUrl: authUrl.toString(),
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return handleResponse(500, "Failed to initialize Google authentication");
  }
}
