// app/api/v1/blogs/[slug]/route.ts - UPDATE THIS EXISTING FILE
import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/db.cjs";
import { handleCatch, handleResponse } from "../../../../../lib";
import { getCurrentUserWithRoles } from "../../../../../lib/user";

// Existing GET function for public access
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    console.log("🟡 [GET BLOG API] === START ===");
    console.log("🟡 [GET BLOG API] Fetching blog with slug:", slug);

    const blog = await prisma.blog.findUnique({
      where: {
        slug,
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        comments: {
          where: { approved: true },
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
        },
      },
    });

    console.log("🟡 [GET BLOG API] Database query result:", {
      found: !!blog,
      blogId: blog?.id,
      title: blog?.title,
      published: blog?.published,
    });

    if (!blog) {
      console.log("❌ [GET BLOG API] Blog not found in database");
      return handleResponse(404, "Blog not found");
    }

    // Increment view count
    await prisma.blog.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    console.log("✅ [GET BLOG API] Blog found, returning response");
    return handleResponse(200, "Blog retrieved successfully", blog);
  } catch (error: unknown) {
    console.error("❌ [GET BLOG API] Error:", error);
    return handleCatch(error);
  }
}

// NEW: PUT method for updating blog (you can add this to the same file)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const user = await getCurrentUserWithRoles(request);

    if (!user) {
      return handleResponse(401, "Authentication required");
    }

    // Find blog by slug first
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (!existingBlog) {
      return handleResponse(404, "Blog not found");
    }

    // Check permissions
    const isAuthor = user.userId === existingBlog.authorId;
    const isAdmin = user.roles.includes("ADMIN");

    if (!isAuthor && !isAdmin) {
      return handleResponse(403, "You don't have permission to edit this blog");
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;
    const published = formData.get("published") === "true";
    const coverImageFile = formData.get("coverImage") as File;

    if (!title || !content) {
      return handleResponse(400, "Title and content are required");
    }

    // Generate new slug if title changed
    let newSlug = existingBlog.slug;
    if (title !== existingBlog.title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check if new slug already exists (excluding current blog)
      const existingSlug = await prisma.blog.findUnique({
        where: {
          slug: newSlug,
          NOT: { id: existingBlog.id },
        },
      });

      if (existingSlug) {
        return handleResponse(409, "A blog with this title already exists");
      }
    }

    let coverImageUrl = existingBlog.coverImage;

    // Handle new cover image upload
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverImageFile);

        const uploadResponse = await fetch(
          `${getBaseUrl()}/api/v1/upload/creative`,
          {
            method: "POST",
            body: uploadFormData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (uploadResult.status === "200" && uploadResult.data) {
          coverImageUrl = uploadResult.data.url;
        } else {
          return handleResponse(
            500,
            "Failed to upload cover image: " +
              (uploadResult.error || uploadResult.msg)
          );
        }
      } catch (uploadError) {
        console.error("❌ [UPDATE BLOG] File upload error:", uploadError);
        return handleResponse(500, "Failed to upload cover image");
      }
    }

    // Only allow publishing if user is admin
    const canPublish = isAdmin;
    const finalPublishedStatus = published && canPublish;

    const updatedBlog = await prisma.blog.update({
      where: { id: existingBlog.id },
      data: {
        title,
        slug: newSlug,
        content,
        excerpt: excerpt || content.substring(0, 150) + "...",
        coverImage: coverImageUrl,
        category,
        tags: tags
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        published: finalPublishedStatus,
        publishedAt:
          finalPublishedStatus && !existingBlog.publishedAt
            ? new Date()
            : existingBlog.publishedAt,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    const message = finalPublishedStatus
      ? "Blog updated and published successfully"
      : published && !canPublish
      ? "Blog updated successfully. Publishing requires admin approval."
      : "Blog updated successfully";

    return handleResponse(200, message, updatedBlog);
  } catch (error: unknown) {
    console.error("❌ [UPDATE BLOG BY SLUG] Error:", error);
    return handleCatch(error);
  }
}

function getBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXTAUTH_URL || "https://seltra.app";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
}
