// app/api/v1/blogs/create/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../lib/user";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);

    if (!user) {
      return handleResponse(401, "Authentication required");
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

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return handleResponse(409, "A blog with this title already exists");
    }

    let coverImageUrl = "";

    // Handle file upload using your existing upload route
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        console.log("🟡 [CREATE BLOG] Uploading cover image...");

        // Use your existing upload route
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
            "✅ [CREATE BLOG] Cover image uploaded successfully:",
            coverImageUrl
          );
        } else {
          console.error("❌ [CREATE BLOG] Upload failed:", uploadResult);
          return handleResponse(
            500,
            "Failed to upload cover image: " +
              (uploadResult.error || uploadResult.msg)
          );
        }
      } catch (uploadError) {
        console.error("❌ [CREATE BLOG] File upload error:", uploadError);
        return handleResponse(500, "Failed to upload cover image");
      }
    } else {
      return handleResponse(400, "Cover image is required");
    }

    // Subject to admin review - only publish if user is admin
    const isAdmin = user.roles.includes("ADMIN");
    const shouldPublish = isAdmin;

    const blog = await prisma.blog.create({
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
        published: shouldPublish,
        publishedAt: shouldPublish ? new Date() : null,
        authorId: user.userId,
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

    const message = shouldPublish
      ? "Blog published successfully"
      : "Blog created successfully and submitted for admin review";

    console.log("✅ [CREATE BLOG] Blog created successfully:", blog.id);
    return handleResponse(201, message, blog);
  } catch (error: unknown) {
    console.error("❌ [CREATE BLOG] Error:", error);
    return handleCatch(error);
  }
}

// Helper function to get base URL (same as your upload route)
function getBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXTAUTH_URL || "https://seltra.app";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
}
