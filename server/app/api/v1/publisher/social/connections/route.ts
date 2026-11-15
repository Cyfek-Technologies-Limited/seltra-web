import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRoles(request);
  if (!user?.roles.includes("PUBLISHER")) return NextResponse.json({ error: "Publisher access required" }, { status: 401 });
  const publisher = await prisma.publisher.findUnique({ where: { userId: user.userId }, select: { id: true } });
  if (!publisher) return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  const connections = await (prisma as any).publisherSocialConnection.findMany({ where: { publisherId: publisher.id }, select: { provider: true, username: true, expiresAt: true, scopes: true } });
  return NextResponse.json({ connections });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUserWithRoles(request);
  if (!user?.roles.includes("PUBLISHER")) return NextResponse.json({ error: "Publisher access required" }, { status: 401 });
  const { provider } = await request.json();
  if (!["tiktok", "instagram"].includes(provider)) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  const publisher = await prisma.publisher.findUnique({ where: { userId: user.userId }, select: { id: true } });
  if (!publisher) return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  await (prisma as any).publisherSocialConnection.deleteMany({ where: { publisherId: publisher.id, provider } });
  return NextResponse.json({ success: true });
}
