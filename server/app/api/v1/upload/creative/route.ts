// app/api/v1/upload/creative/route.ts - FIXED
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ⚠️ CRITICAL: Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Types for our response
interface UploadResponse {
  status: string;
  data?: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storage: "r2";
    type: "image" | "video";
  };
  error?: string;
  msg?: string;
}

// Helper function to handle responses with CORS
function handleResponse(
  status: number,
  message: string,
  data?: any,
  origin?: string
): NextResponse {
  const response: UploadResponse = {
    status: status.toString(),
    msg: message,
    ...(data && { data }),
  };

  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  return NextResponse.json(response, { status, headers });
}

function handleCatch(error: unknown, origin?: string): NextResponse {
  console.error("Upload error:", error);

  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers }
    );
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500, headers }
  );
}

// Check if R2 is configured and initialize client
let s3Client: any = null;
let r2Configured = false;
let PutObjectCommand: any = null;

try {
  if (
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  ) {
    const { S3Client } = require("@aws-sdk/client-s3");
    const { PutObjectCommand: PutCommand } = require("@aws-sdk/client-s3");

    s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      maxAttempts: 3,
      requestTimeout: 30000, // 30 seconds
    });

    PutObjectCommand = PutCommand;
    r2Configured = true;
    console.log("✅ R2 storage configured");
  } else {
    console.log("❌ R2 not configured - missing environment variables");
  }
} catch (error) {
  console.log("❌ R2 configuration failed:", error);
}

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

// File size limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  // Get origin for CORS
  const origin = request.headers.get("origin") || "https://seltra.app";
  const allowedOrigins = [
    "https://seltra.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  const isAllowedOrigin = allowedOrigins.includes(origin);

  try {
    console.log("🔍 [UPLOAD CREATIVE] Starting file upload...");

    // Check content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return handleResponse(
        400,
        "Expected multipart/form-data",
        undefined,
        isAllowedOrigin ? origin : "*"
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("❌ No file provided");
      return handleResponse(
        400,
        "No file provided",
        undefined,
        isAllowedOrigin ? origin : "*"
      );
    }

    // Determine file type
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
    const fileType = isImage ? "image" : isVideo ? "video" : null;

    if (!fileType) {
      console.log("❌ Invalid file type:", file.type);
      return handleResponse(
        400,
        `Unsupported file type. Supported formats: ${[
          ...SUPPORTED_IMAGE_TYPES,
          ...SUPPORTED_VIDEO_TYPES,
        ].join(", ")}`,
        undefined,
        isAllowedOrigin ? origin : "*"
      );
    }

    // Validate file size based on type
    const maxSize = fileType === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      console.log("❌ File too large:", file.size);
      const maxSizeMB = maxSize / 1024 / 1024;
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      return handleResponse(
        400,
        `${
          fileType === "image" ? "Image" : "Video"
        } size (${fileSizeMB}MB) exceeds maximum ${maxSizeMB}MB limit`,
        undefined,
        isAllowedOrigin ? origin : "*"
      );
    }

    console.log("🟡 [UPLOAD CREATIVE] Processing file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + "MB",
      fileType,
    });

    // Check R2 configuration
    if (!r2Configured || !s3Client) {
      console.log("❌ R2 not configured properly");
      return handleResponse(
        500,
        "Cloud storage not configured",
        undefined,
        isAllowedOrigin ? origin : "*"
      );
    }

    // Generate unique filename
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() ||
      (fileType === "image" ? "jpg" : "mp4");
    const fileName = `${randomUUID()}.${fileExtension}`;
    const fileKey = `creatives/${fileName}`;

    console.log("🟡 [UPLOAD CREATIVE] Uploading to R2...", {
      fileKey,
      bucket: process.env.R2_BUCKET_NAME,
      endpoint: process.env.R2_ENDPOINT,
    });

    // Convert file to buffer
    console.log("🟡 Converting file to buffer...");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("✅ File converted to buffer:", {
      bufferSize: buffer.length,
      bufferSizeMB: (buffer.length / 1024 / 1024).toFixed(2) + "MB",
    });

    try {
      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          fileType: fileType,
        },
      });

      console.log("🟡 Sending PutObjectCommand to R2...");
      const r2Response = await s3Client.send(command);
      console.log("✅ R2 upload response:", {
        statusCode: r2Response.$metadata.httpStatusCode,
        requestId: r2Response.$metadata.requestId,
      });

      // Construct public URL
      const fileUrl = `${
        process.env.R2_PUBLIC_URL ||
        `https://pub-${
          process.env.R2_ENDPOINT?.split(".")[0]
        }.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`
      }/${fileKey}`;

      const responseData = {
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storage: "r2" as const,
        type: fileType,
      };

      console.log(
        "✅ [UPLOAD CREATIVE] File uploaded to R2 successfully:",
        responseData
      );

      return handleResponse(
        200,
        "File uploaded successfully",
        responseData,
        isAllowedOrigin ? origin : "*"
      );
    } catch (r2Error: any) {
      console.error("❌ [UPLOAD CREATIVE] R2 upload failed:", {
        error: r2Error.message,
        name: r2Error.name,
        code: r2Error.Code,
        time: r2Error.time,
        region: r2Error.region,
        hostId: r2Error.hostId,
        requestId: r2Error.requestId,
        extendedRequestId: r2Error.extendedRequestId,
        cfId: r2Error.cfId,
        bucket: process.env.R2_BUCKET_NAME,
        endpoint: process.env.R2_ENDPOINT,
      });

      // Specific error handling for common R2 issues
      if (r2Error.name === "CredentialsProviderError") {
        return handleResponse(
          500,
          "Cloud storage authentication failed",
          undefined,
          isAllowedOrigin ? origin : "*"
        );
      } else if (r2Error.name === "BucketAlreadyExists") {
        return handleResponse(
          500,
          "Cloud storage bucket issue",
          undefined,
          isAllowedOrigin ? origin : "*"
        );
      } else if (r2Error.name === "NoSuchBucket") {
        return handleResponse(
          500,
          "Cloud storage bucket not found",
          undefined,
          isAllowedOrigin ? origin : "*"
        );
      } else if (r2Error.Code === "AccessDenied") {
        return handleResponse(
          500,
          "Cloud storage access denied",
          undefined,
          isAllowedOrigin ? origin : "*"
        );
      } else if (r2Error.Code === "InvalidAccessKeyId") {
        return handleResponse(
          500,
          "Cloud storage invalid credentials",
          undefined,
          isAllowedOrigin ? origin : "*"
        );
      } else if (r2Error.Code === "SignatureDoesNotMatch") {
        return handleResponse(
          500,
          "Cloud storage signature mismatch",
          undefined,
          isAllowedOrigin ? origin : "*"
        );
      }

      return handleResponse(
        500,
        `Cloud storage error: ${r2Error.message}`,
        undefined,
        isAllowedOrigin ? origin : "*"
      );
    }
  } catch (error: unknown) {
    console.error("❌ [UPLOAD CREATIVE] Upload failed:", error);
    return handleCatch(error, isAllowedOrigin ? origin : "*");
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "https://seltra.app";
  const allowedOrigins = [
    "https://seltra.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  const isAllowedOrigin = allowedOrigins.includes(origin);

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Content-Length",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}
