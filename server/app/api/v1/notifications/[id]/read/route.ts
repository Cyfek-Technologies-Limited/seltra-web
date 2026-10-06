import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../../lib/user";
import { prisma } from "../../../../../../lib/db.cjs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await prisma.notification.update({
      where: { id: params.id, userId: user.userId },
      data: { isRead: true },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
