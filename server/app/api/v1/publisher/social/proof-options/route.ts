import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { refreshSocialAccessToken } from "../../../../../../lib/social-verification";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRoles(request);
  if (!user?.roles.includes("PUBLISHER")) return NextResponse.json({ error: "Publisher access required" }, { status: 401 });
  const provider = new URL(request.url).searchParams.get("provider");
  if (provider !== "tiktok" && provider !== "instagram") return NextResponse.json({ error: "Choose TikTok or Instagram" }, { status: 400 });
  const publisher = await prisma.publisher.findUnique({ where: { userId: user.userId }, select: { id: true } });
  if (!publisher) return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  const connection = await (prisma as any).publisherSocialConnection.findUnique({ where: { publisherId_provider: { publisherId: publisher.id, provider } } });
  if (!connection) return NextResponse.json({ error: `Connect your ${provider} account in Publisher Profile first` }, { status: 409 });
  try {
    const token = await refreshSocialAccessToken(connection);
    if (provider === "tiktok") {
      const response = await fetch("https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,create_time,share_url,view_count", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ max_count: 20 }),
      });
      const result = await response.json();
      if (!response.ok || result.error?.code !== "ok") throw new Error(result.error?.message || "Could not load TikTok videos");
      return NextResponse.json({ items: (result.data?.videos || []).map((video: any) => ({ id: video.id, label: video.title || video.video_description || "TikTok video", views: video.view_count, url: video.share_url, timestamp: video.create_time })) });
    }
    const url = new URL(`https://graph.facebook.com/v26.0/${connection.accountId}/stories`);
    url.search = new URLSearchParams({ fields: "id,media_type,timestamp", access_token: token }).toString();
    const response = await fetch(url);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Could not load Instagram Stories");
    const stories = await Promise.all((result.data || []).map(async (story: any) => {
      const insightUrl = new URL(`https://graph.facebook.com/v26.0/${story.id}/insights`);
      insightUrl.search = new URLSearchParams({ metric: "views", access_token: token }).toString();
      const insightResponse = await fetch(insightUrl);
      const insight = await insightResponse.json();
      if (!insightResponse.ok) return null;
      const metric = (insight.data || []).find((entry: any) => entry.name === "views");
      const views = metric?.values?.[0]?.value ?? metric?.total_value?.value;
      if (!Number.isFinite(Number(views))) return null;
      return { id: story.id, label: `Instagram Story · ${new Date(story.timestamp).toLocaleString()}`, views: Number(views), timestamp: story.timestamp };
    }));
    return NextResponse.json({ items: stories.filter(Boolean) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not retrieve platform metrics" }, { status: 502 });
  }
}
