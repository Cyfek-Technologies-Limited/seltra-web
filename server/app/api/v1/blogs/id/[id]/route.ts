// app/api/v1/blogs/id/[id]/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";

// GET single blog by ID (for editing)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUserWithRoles(request);

    if (!user) {
      return handleResponse(401, "Authentication required");
    }

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      return handleResponse(404, "Blog not found");
    }

    // Check permissions - only author or admin can edit
    const isAuthor = user.userId === blog.authorId;
    const isAdmin = user.roles.includes("ADMIN");

    if (!isAuthor && !isAdmin) {
      return handleResponse(403, "You don't have permission to edit this blog");
    }

    return handleResponse(200, "Blog retrieved successfully", blog);
  } catch (error: unknown) {
    console.error("❌ [GET BLOG BY ID] Error:", error);
    return handleCatch(error);
  }
}

// UPDATE blog by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUserWithRoles(request);

    if (!user) {
      return handleResponse(401, "Authentication required");
    }

    // Check if blog exists and user has permission
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
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
    let slug = existingBlog.slug;
    if (title !== existingBlog.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check if new slug already exists (excluding current blog)
      const existingSlug = await prisma.blog.findUnique({
        where: {
          slug,
          NOT: { id },
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
        console.log("🟡 [UPDATE BLOG] Uploading new cover image...");

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
          console.log(
            "✅ [UPDATE BLOG] New cover image uploaded:",
            coverImageUrl
          );
        } else {
          console.error("❌ [UPDATE BLOG] Upload failed:", uploadResult);
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
      where: { id },
      data: {
        title,
        slug,
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

    console.log("✅ [UPDATE BLOG] Blog updated successfully:", updatedBlog.id);
    return handleResponse(200, message, updatedBlog);
  } catch (error: unknown) {
    console.error("❌ [UPDATE BLOG] Error:", error);
    return handleCatch(error);
  }
}

// Helper function to get base URL
function getBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXTAUTH_URL || "https://seltra.app";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
}
