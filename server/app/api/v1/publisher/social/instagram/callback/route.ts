import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/db.cjs";
import { encryptSocialToken, socialRedirectUri, verifySocialState } from "../../../../../../../lib/social-verification";

const returnToProfile = (result: string) => NextResponse.redirect(`${(process.env.FRONTEND_URL || "").replace(/\/+$/, "")}/dashboard/publisher/profile?social=${encodeURIComponent(result)}`);

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const userId = await verifySocialState("instagram", params.get("state"));
  const code = params.get("code");
  if (!userId || !code || params.has("error")) return returnToProfile("instagram-error");
  try {
    const tokenUrl = new URL("https://graph.facebook.com/v26.0/oauth/access_token");
    tokenUrl.search = new URLSearchParams({ client_id: process.env.META_APP_ID || "", client_secret: process.env.META_APP_SECRET || "", redirect_uri: socialRedirectUri("instagram"), code }).toString();
    const shortResponse = await fetch(tokenUrl);
    const shortToken = await shortResponse.json();
    if (!shortResponse.ok || !shortToken.access_token) throw new Error("Meta token exchange failed");

    const longUrl = new URL("https://graph.facebook.com/v26.0/oauth/access_token");
    longUrl.search = new URLSearchParams({ grant_type: "fb_exchange_token", client_id: process.env.META_APP_ID || "", client_secret: process.env.META_APP_SECRET || "", fb_exchange_token: shortToken.access_token }).toString();
    const longResponse = await fetch(longUrl);
    const longToken = await longResponse.json();
    const userToken = longResponse.ok && longToken.access_token ? longToken.access_token : shortToken.access_token;

    const pagesResponse = await fetch(`https://graph.facebook.com/v26.0/me/accounts?fields=access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(userToken)}`);
    const pages = await pagesResponse.json();
    const account = (pages.data || []).find((page: any) => page.instagram_business_account?.id);
    if (!pagesResponse.ok || !account) throw new Error("No Instagram professional account linked to a Facebook Page was found");
    const publisher = await prisma.publisher.findUnique({ where: { userId }, select: { id: true } });
    if (!publisher) throw new Error("Publisher account not found");

    await (prisma as any).publisherSocialConnection.upsert({
      where: { publisherId_provider: { publisherId: publisher.id, provider: "instagram" } },
      create: { publisherId: publisher.id, provider: "instagram", accountId: account.instagram_business_account.id, username: account.instagram_business_account.username || null, accessToken: encryptSocialToken(account.access_token), refreshToken: encryptSocialToken(userToken), expiresAt: new Date(Date.now() + (longToken.expires_in || 5_184_000) * 1000), scopes: ["pages_show_list", "pages_read_engagement", "instagram_basic", "instagram_manage_insights"] },
      update: { accountId: account.instagram_business_account.id, username: account.instagram_business_account.username || null, accessToken: encryptSocialToken(account.access_token), refreshToken: encryptSocialToken(userToken), expiresAt: new Date(Date.now() + (longToken.expires_in || 5_184_000) * 1000), scopes: ["pages_show_list", "pages_read_engagement", "instagram_basic", "instagram_manage_insights"] },
    });
    return returnToProfile("instagram-connected");
  } catch (error) {
    console.error("Instagram OAuth callback failed:", error);
    return returnToProfile("instagram-error");
  }
}
