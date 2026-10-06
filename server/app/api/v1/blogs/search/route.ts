// app/api/v1/blogs/search/route.ts
import { NextRequest } from "next/server";
import { handleCatch, handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    if (!query || query.length === 0) {
      return handleResponse(400, "Search query is required");
    }

    if (query.length < 2) {
      return handleResponse(400, "Search query must be at least 2 characters");
    }

    const skip = (page - 1) * limit;

    // Search across all fields as requested
    const where = {
      published: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
        {
          author: {
            username: { contains: query, mode: "insensitive" },
          },
        },
      ],
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
        orderBy: [
          // Prioritize title matches first
          {
            title: {
              sort: "asc",
              nulls: "last",
            },
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return handleResponse(200, "Search completed", {
      blogs,
      query,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("❌ [BLOG SEARCH] Error:", error);
    return handleCatch(error);
  }
}
