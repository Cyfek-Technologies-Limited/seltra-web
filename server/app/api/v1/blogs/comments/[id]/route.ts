// app/api/v1/blogs/comments/[id]/route.ts
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) {
      return handleResponse(401, "Authentication required");
    }

    const { id } = params;

    const comment = await prisma.blogComment.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!comment) {
      return handleResponse(404, "Comment not found");
    }

    // Check if user owns the comment or is admin
    const isOwner = comment.authorId === user.userId;
    const isAdmin = user.roles.includes("admin");

    if (!isOwner && !isAdmin) {
      return handleResponse(403, "Not authorized to delete this comment");
    }

    // Delete comment and its replies
    await prisma.blogComment.deleteMany({
      where: {
        OR: [{ id }, { parentId: id }],
      },
    });

    console.log("✅ [DELETE COMMENT] Comment deleted successfully:", id);
    return handleResponse(200, "Comment deleted successfully");
  } catch (error: unknown) {
    console.error("❌ [DELETE COMMENT] Error:", error);
    return handleCatch(error);
  }
}
