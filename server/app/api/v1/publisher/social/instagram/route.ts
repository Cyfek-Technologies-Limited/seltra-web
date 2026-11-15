import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { createSocialState, socialRedirectUri } from "../../../../../../lib/social-verification";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRoles(request);
  if (!user?.roles.includes("PUBLISHER")) return NextResponse.json({ error: "Publisher access required" }, { status: 401 });
  const appId = process.env.META_APP_ID;
  if (!appId) return NextResponse.json({ error: "Meta integration is not configured" }, { status: 503 });
  const state = await createSocialState("instagram", user.userId);
  const url = new URL("https://www.facebook.com/v26.0/dialog/oauth");
  url.search = new URLSearchParams({ client_id: appId, redirect_uri: socialRedirectUri("instagram"), response_type: "code", scope: "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights", state }).toString();
  if (request.headers.get("authorization")) return NextResponse.json({ authorizationUrl: url.toString() });
  return NextResponse.redirect(url);
}
