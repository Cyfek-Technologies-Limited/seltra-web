import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);

    if (!user || !user.roles.includes("admin")) {
      return handleResponse(403, "Admin access required");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'video' or 'thumbnail'

    if (!file) {
      return handleResponse(400, "No file provided");
    }

    // Validate file type
    if (type === "video" && !file.type.startsWith("video/")) {
      return handleResponse(400, "Only video files are allowed");
    }

    if (type === "thumbnail" && !file.type.startsWith("image/")) {
      return handleResponse(400, "Only image files are allowed for thumbnails");
    }

    // Validate file size (50MB for videos, 5MB for images)
    const maxSize = type === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return handleResponse(
        400,
        `File size must be less than ${type === "video" ? "50MB" : "5MB"}`
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() ||
      (type === "video" ? "mp4" : "jpg");
    const fileName = `${randomUUID()}.${fileExtension}`;
    const folder = type === "video" ? "videos" : "thumbnails";
    const uploadsDir = join(process.cwd(), "public/uploads/tutorials", folder);

    // Create directory if it doesn't exist
    await mkdir(uploadsDir, { recursive: true });

    // Save file to filesystem
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/tutorials/${folder}/${fileName}`;

    return handleResponse(200, "File uploaded successfully", {
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
