// app/api/v1/ai/generate-description/route.ts
import { NextRequest, NextResponse } from "next/server";

const AI_PROVIDER = process.env.AI_PROVIDER || "openai"; // openai, anthropic, etc.

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generatePrompt(
  campaignName: string,
  shortDescription: string,
  platform?: string,
  targetAudience?: string
): string {
  const platforms = platform ? `for ${platform}` : "for social media";
  const audience = targetAudience
    ? `targeting ${targetAudience}`
    : "targeting Nigerian social media users";

  return `You are an expert marketing copywriter. Create compelling, engaging ad copy for a business campaign.

CAMPAIGN NAME: ${campaignName}
BUSINESS DESCRIPTION: ${shortDescription}
PLATFORM: ${platforms}
TARGET AUDIENCE: ${audience}

Generate 3 different versions of marketing copy that:
1. Create curiosity and engagement
2. Highlight the value proposition clearly
3. Use conversational, relatable language
4. Include a clear call-to-action
5. Are optimized for social media sharing
6. Sound authentic and trustworthy

Format the response as JSON with this structure:
{
  "versions": [
    {
      "title": "Creative title for this version",
      "description": "Full marketing copy here...",
      "tone": "Conversational/Urgent/Exciting/etc."
    }
  ]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const { campaignName, shortDescription, platform, targetAudience } =
      await request.json();

    if (!campaignName || !shortDescription) {
      return NextResponse.json(
        { error: "Campaign name and description are required" },
        { status: 400 }
      );
    }

    const prompt = generatePrompt(
      campaignName,
      shortDescription,
      platform,
      targetAudience
    );

    const generatedDescription = await generateAIContent(prompt);

    const responseData = {
      success: true,
      generatedDescription,
      originalInput: {
        campaignName,
        shortDescription,
        platform,
        targetAudience,
      },
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("🔴 AI Description Generation Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate description" },
      { status: 500 }
    );
  }
}

async function generateAIContent(prompt: string): Promise<any> {
  if (AI_PROVIDER === "openai") {
    return await generateWithOpenAI(prompt);
  } else if (AI_PROVIDER === "anthropic") {
    return await generateWithAnthropic(prompt);
  } else {
    throw new Error("Unsupported AI provider");
  }
}

// OpenAI Implementation
async function generateWithOpenAI(prompt: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert marketing copywriter specializing in social media advertising.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  return JSON.parse(content);
}

// Anthropic Implementation
async function generateWithAnthropic(prompt: string): Promise<any> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

  const data = await response.json();
  const content = data.content[0]?.text;
  return JSON.parse(content);
}
