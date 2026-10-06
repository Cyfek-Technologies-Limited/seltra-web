// app/api/v1/upload/presigned-url/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
let s3Client: any = null;

try {
  if (
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  ) {
    const { S3Client } = require("@aws-sdk/client-s3");
    s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
} catch (error) {
  console.log("❌ R2 configuration failed:", error);
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "File name and type are required" },
        { status: 400 }
      );
    }

    // Validate file size
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Generate unique file key
    const fileExtension =
      fileName.split(".").pop()?.toLowerCase() ||
      (fileType.startsWith("image/") ? "jpg" : "mp4");
    const fileKey = `creatives/${randomUUID()}.${fileExtension}`;

    // Generate presigned URL with CORS headers
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      // Add CORS-related metadata
      Metadata: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Construct public URL for the uploaded file
    const fileUrl = `${
      process.env.R2_PUBLIC_URL ||
      `https://pub-${
        process.env.R2_ENDPOINT?.split(".")[0]
      }.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`
    }/${fileKey}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      fileKey,
    });
  } catch (error: any) {
    console.error("🔴 Presigned URL error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
