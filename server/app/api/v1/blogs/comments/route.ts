// app/api/v1/blogs/[slug]/comments/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../lib/user";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) {
      return handleResponse(401, "Authentication required");
    }

    const { slug } = params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return handleResponse(400, "Comment content is required");
    }

    if (content.length > 1000) {
      return handleResponse(400, "Comment must be less than 1000 characters");
    }

    // Find the blog
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog) {
      return handleResponse(404, "Blog not found");
    }

    const comment = await prisma.blogComment.create({
      data: {
        content: content.trim(),
        authorId: user.userId,
        blogId: blog.id,
        parentId: parentId || null,
        approved: true, // Visible immediately as requested
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        replies: {
          where: { approved: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(
      "✅ [CREATE COMMENT] Comment created successfully:",
      comment.id
    );
    return handleResponse(201, "Comment created successfully", comment);
  } catch (error: unknown) {
    console.error("❌ [CREATE COMMENT] Error:", error);
    return handleCatch(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const comments = await prisma.blogComment.findMany({
      where: {
        blog: { slug },
        approved: true,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        replies: {
          where: { approved: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return handleResponse(200, "Comments retrieved successfully", comments);
  } catch (error: unknown) {
    console.error("❌ [GET COMMENTS] Error:", error);
    return handleCatch(error);
  }
}
