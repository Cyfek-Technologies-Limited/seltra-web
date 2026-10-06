// lib/ocr-claude.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ScreenshotAnalysis {
  proofCodeFound: boolean;
  proofCodeText: string | null;
  viewCount: number | null;
  platform:
    | "whatsapp"
    | "facebook"
    | "instagram"
    | "telegram"
    | "tiktok"
    | "unknown";
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface MultiScreenshotAnalysis {
  screenshots: ScreenshotAnalysis[];
  totalViews: number;
  platforms: string[];
  uniquePlatformCount: number;
  proofCodeFound: boolean;
  proofCodeText: string | null;
  overallConfidence: "high" | "medium" | "low";
}

async function analyzeScreenshot(
  imageUrl: string,
  expectedProofCode: string
): Promise<ScreenshotAnalysis> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const mediaType = (
    ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)
      ? contentType
      : "image/jpeg"
  ) as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  const prompt = `You are analyzing a social media screenshot for an advertising verification system.

The publisher may have posted on WhatsApp Status, Facebook Story, Instagram Story, Telegram, TikTok, or any other platform.

Your job is to extract THREE pieces of information:

1. PLATFORM: Identify which social media platform this screenshot is from. Look for platform-specific UI elements:
   - WhatsApp: dark/light chat UI, "My Status", eye icon badge bottom-left
   - Facebook: Facebook logo, blue UI, "Your Story", "X views" text
   - Instagram: Instagram UI, camera icon, "Seen by" or eye icon
   - Telegram: Telegram UI, blue/white, view counter
   - TikTok: TikTok UI, black background, heart/comment/share buttons on right

2. PROOF CODE: Look for a stamped overlay code in the format "SELTRA-XXXXXX" (6 alphanumeric characters after the dash). It appears as white bold text on a dark semi-transparent rounded box, usually in a corner of the image. The expected code is: ${expectedProofCode}

3. VIEW COUNT: Look for the view/seen count. Depending on the platform:
   - WhatsApp: number next to eye icon 👁 in bottom-left pill badge
   - Facebook: "X views" or "Viewed by X" text
   - Instagram: number next to eye icon, or "Seen by X"
   - Telegram: number with views icon
   - TikTok: number with play/view icon
   Extract ONLY the number (e.g. if you see "Seen by 45 people", return 45).

Respond ONLY with a JSON object, no other text:
{
  "proofCodeFound": true or false,
  "proofCodeText": "the exact code you see, or null if not found",
  "viewCount": the number or null if not visible,
  "platform": "whatsapp" | "facebook" | "instagram" | "telegram" | "tiktok" | "unknown",
  "confidence": "high" | "medium" | "low",
  "reasoning": "brief explanation of what you found"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      proofCodeFound: Boolean(parsed.proofCodeFound),
      proofCodeText: parsed.proofCodeText ?? null,
      viewCount: typeof parsed.viewCount === "number" ? parsed.viewCount : null,
      platform: parsed.platform ?? "unknown",
      confidence: parsed.confidence ?? "low",
      reasoning: parsed.reasoning ?? "",
    };
  } catch {
    console.error("Failed to parse Claude OCR response:", text);
    return {
      proofCodeFound: false,
      proofCodeText: null,
      viewCount: null,
      platform: "unknown",
      confidence: "low",
      reasoning: "Failed to parse response",
    };
  }
}

// Single screenshot (for specific platform campaigns)
export async function extractDataFromSocialScreenshot(
  imageUrl: string,
  expectedProofCode: string
): Promise<ScreenshotAnalysis> {
  return analyzeScreenshot(imageUrl, expectedProofCode);
}

// Multiple screenshots (for "all" platform campaigns)
export async function extractDataFromMultipleScreenshots(
  imageUrls: string[],
  expectedProofCode: string
): Promise<MultiScreenshotAnalysis> {
  // Analyze all screenshots in parallel
  const results = await Promise.all(
    imageUrls.map((url) => analyzeScreenshot(url, expectedProofCode))
  );

  // Find the proof code across all screenshots (only needs to appear in one)
  const codeMatch = results.find(
    (r) => r.proofCodeFound && r.proofCodeText !== null
  );

  // Sum views across all screenshots
  const totalViews = results.reduce((sum, r) => sum + (r.viewCount ?? 0), 0);

  // Collect unique platforms (excluding unknown)
  const platforms = [
    ...new Set(results.map((r) => r.platform).filter((p) => p !== "unknown")),
  ];

  // Overall confidence = lowest confidence among all screenshots
  const confidencePriority = { low: 0, medium: 1, high: 2 };
  const overallConfidence = results.reduce((lowest, r) => {
    return confidencePriority[r.confidence] < confidencePriority[lowest]
      ? r.confidence
      : lowest;
  }, "high" as "high" | "medium" | "low");

  return {
    screenshots: results,
    totalViews,
    platforms,
    uniquePlatformCount: platforms.length,
    proofCodeFound: !!codeMatch,
    proofCodeText: codeMatch?.proofCodeText ?? null,
    overallConfidence,
  };
}
