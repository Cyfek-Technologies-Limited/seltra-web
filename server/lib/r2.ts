import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadBufferToR2(
  buffer: Buffer,
  contentType: string,
  folder = "stamped-creatives"
) {
  const extension =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
      ? "webp"
      : "jpg";

  const fileKey = `${folder}/${randomUUID()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const fileUrl = `${
    process.env.R2_PUBLIC_URL ||
    `https://pub-${
      process.env.R2_ENDPOINT?.split(".")[0]
    }.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`
  }/${fileKey}`;

  return {
    fileKey,
    fileUrl,
  };
}
