import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/db.cjs";
import { encryptSocialToken, socialRedirectUri, verifySocialState } from "../../../../../../../lib/social-verification";

const returnToProfile = (result: string) => NextResponse.redirect(`${(process.env.FRONTEND_URL || "").replace(/\/+$/, "")}/dashboard/publisher/profile?social=${encodeURIComponent(result)}`);

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const userId = await verifySocialState("tiktok", params.get("state"));
  const code = params.get("code");
  if (!userId || !code || params.has("error")) return returnToProfile("tiktok-error");
  try {
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY || "", client_secret: process.env.TIKTOK_CLIENT_SECRET || "", code, grant_type: "authorization_code", redirect_uri: socialRedirectUri("tiktok") }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token || !token.open_id) throw new Error("TikTok token exchange failed");
    const profileResponse = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", { headers: { Authorization: `Bearer ${token.access_token}` } });
    const profile = await profileResponse.json();
    const publisher = await prisma.publisher.findUnique({ where: { userId }, select: { id: true } });
    if (!publisher) throw new Error("Publisher account not found");
    await (prisma as any).publisherSocialConnection.upsert({
      where: { publisherId_provider: { publisherId: publisher.id, provider: "tiktok" } },
      create: { publisherId: publisher.id, provider: "tiktok", accountId: token.open_id, username: profile?.data?.user?.display_name || null, accessToken: encryptSocialToken(token.access_token), refreshToken: encryptSocialToken(token.refresh_token), expiresAt: new Date(Date.now() + token.expires_in * 1000), scopes: (token.scope || "").split(",").filter(Boolean) },
      update: { accountId: token.open_id, username: profile?.data?.user?.display_name || null, accessToken: encryptSocialToken(token.access_token), refreshToken: encryptSocialToken(token.refresh_token), expiresAt: new Date(Date.now() + token.expires_in * 1000), scopes: (token.scope || "").split(",").filter(Boolean) },
    });
    return returnToProfile("tiktok-connected");
  } catch (error) {
    console.error("TikTok OAuth callback failed:", error);
    return returnToProfile("tiktok-error");
  }
}
