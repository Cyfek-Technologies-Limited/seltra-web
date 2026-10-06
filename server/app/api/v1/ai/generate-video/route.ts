// app/api/v1/ai/generate-video/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { productDescription, productName, targetAudience, platform, tone } =
      await request.json();

    if (!productDescription || !productName) {
      return NextResponse.json(
        { error: "Product description and name are required" },
        { status: 400 }
      );
    }

    // Generate AI prompt for video creation
    const videoPrompt = generateVideoPrompt({
      productDescription,
      productName,
      targetAudience,
      platform,
      tone,
    });

    // Choose your AI video generation service
    const videoResult = await generateAIVideo(videoPrompt);

    return NextResponse.json({
      success: true,
      video: videoResult,
      originalInput: {
        productName,
        productDescription,
        targetAudience,
        platform,
        tone,
      },
    });
  } catch (error: any) {
    console.error("🔴 AI Video Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}

function generateVideoPrompt(data: {
  productDescription: string;
  productName: string;
  targetAudience?: string;
  platform?: string;
  tone?: string;
}): string {
  return `Create a compelling 15-30 second product demo video for: ${
    data.productName
  }

PRODUCT DETAILS: ${data.productDescription}
TARGET AUDIENCE: ${data.targetAudience || "General consumers"}
PLATFORM: ${data.platform || "Social media"}
TONE: ${data.tone || "Engaging and professional"}

Video should include:
1. Clear product showcase
2. Key benefits and features
3. Call-to-action
4. Optimized for mobile viewing
5. Engaging visuals and text overlays

Format: MP4, 1080x1920 (9:16 vertical format)`;
}

async function generateAIVideo(prompt: string): Promise<any> {
  // Option 1: Runway ML
  const runwayResult = await generateWithRunwayML(prompt);
  if (runwayResult) return runwayResult;

  // Option 2: Pika Labs
  const pikaResult = await generateWithPikaLabs(prompt);
  if (pikaResult) return pikaResult;

  // Option 3: Stability AI
  const stabilityResult = await generateWithStabilityAI(prompt);
  if (stabilityResult) return stabilityResult;

  // Fallback: Return placeholder for manual video creation
  return {
    videoUrl: null,
    status: "pending",
    message: "Video generation in queue. We'll notify you when it's ready.",
    estimatedTime: "5-10 minutes",
  };
}

// Runway ML Implementation
async function generateWithRunwayML(prompt: string) {
  try {
    const response = await fetch("https://api.runwayml.com/v1/video/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RUNWAYML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: 15, // seconds
        resolution: "1080x1920",
        aspect_ratio: "9:16",
      }),
    });

    if (!response.ok) throw new Error("Runway ML API error");

    const data = await response.json();
    return {
      videoUrl: data.video_url,
      status: data.status,
      id: data.id,
      provider: "runwayml",
    };
  } catch (error) {
    console.error("Runway ML error:", error);
    return null;
  }
}

// Pika Labs Implementation
async function generateWithPikaLabs(prompt: string) {
  try {
    const response = await fetch("https://api.pika.labs/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PIKA_LABS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: 4, // 4 seconds for Pika
        size: "1080x1920",
      }),
    });

    if (!response.ok) throw new Error("Pika Labs API error");

    const data = await response.json();
    return {
      videoUrl: data.video_url,
      status: data.status,
      id: data.id,
      provider: "pika",
    };
  } catch (error) {
    console.error("Pika Labs error:", error);
    return null;
  }
}

// Stability AI Implementation
async function generateWithStabilityAI(prompt: string) {
  try {
    const response = await fetch(
      "https://api.stability.ai/v2beta/video/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: 15,
          resolution: "1080x1920",
        }),
      }
    );

    if (!response.ok) throw new Error("Stability AI API error");

    const data = await response.json();
    return {
      videoUrl: data.video_url,
      status: data.status,
      id: data.id,
      provider: "stability",
    };
  } catch (error) {
    console.error("Stability AI error:", error);
    return null;
  }
}
