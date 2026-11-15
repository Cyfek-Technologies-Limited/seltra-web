import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { createSocialState, socialRedirectUri } from "../../../../../../lib/social-verification";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRoles(request);
  if (!user?.roles.includes("PUBLISHER")) return NextResponse.json({ error: "Publisher access required" }, { status: 401 });
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) return NextResponse.json({ error: "TikTok integration is not configured" }, { status: 503 });
  const state = await createSocialState("tiktok", user.userId);
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.search = new URLSearchParams({ client_key: clientKey, scope: "user.info.basic,video.list", response_type: "code", redirect_uri: socialRedirectUri("tiktok"), state }).toString();
  if (request.headers.get("authorization")) return NextResponse.json({ authorizationUrl: url.toString() });
  return NextResponse.redirect(url);
}
