// app/api/v1/blogs/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../lib";
import { prisma } from "../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const published = searchParams.get("published") !== "false";

    const skip = (page - 1) * limit;

    const where = {
      ...(published && { published: true }),
      ...(category && { category }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              comments: {
                where: { approved: true },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    console.log("Blogs retrieved successfully", blogs);

    return handleResponse(200, "Blogs retrieved successfully", {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("❌ [GET BLOGS] Error:", error);
    return handleCatch(error);
  }
}
