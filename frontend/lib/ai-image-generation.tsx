// =============================================== lib/ai-image-generation.ts ======================================= //

export interface ImageGenerationRequest {
  prompt: string;
  campaignName: string;
  category?: string;
  platform: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  generatedAt: Date;
}

class AIImageGenerator {
  private baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL;

  async generateFlyer(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: this.enhancePrompt(request),
          style: "marketing-flyer",
          dimensions: "1080x1080", // Square format for social media
        }),
      });

      if (!response.ok) {
        throw new Error("Image generation failed");
      }

      const data = await response.json();

      return {
        imageUrl: data.imageUrl,
        prompt: request.prompt,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error("Failed to generate image. Please try again.");
    }
  }

  private enhancePrompt(request: ImageGenerationRequest): string {
    const platformStyles = {
      whatsapp: "professional, clean, easy to read on mobile",
      instagram: "vibrant, engaging, visually appealing for social media",
      facebook: "professional, trustworthy, business-oriented",
      twitter: "bold, attention-grabbing, optimized for feed",
      tiktok: "dynamic, trendy, youth-focused",
      all: "versatile, professional, works across all platforms",
    };

    const style =
      platformStyles[request.platform as keyof typeof platformStyles] ||
      "professional";

    return `Create a marketing flyer for "${request.campaignName}". 
            Description: ${request.prompt}
            Style: ${style}, professional business flyer, high quality, Nigerian audience appropriate
            Requirements: Include space for text, visually appealing, brand-friendly`;
  }
}

export const aiImageGenerator = new AIImageGenerator();

//  ================================== lib/ai-video-generation.ts =========================================//
export interface VideoGenerationRequest {
  productName: string;
  productDescription: string;
  category?: string;
  platform: string;
  duration?: number; // in seconds
}

export interface VideoGenerationResponse {
  videoUrl: string;
  previewUrl: string;
  duration: number;
  generatedAt: Date;
  price: number;
}

class AIVideoGenerator {
  private baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL;
  private readonly VIDEO_PRICE = 15000; // 15,000 Naira

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: this.enhanceVideoPrompt(request),
          duration: request.duration || 15,
          style: "marketing-ad",
          platform: request.platform,
        }),
      });

      if (!response.ok) {
        throw new Error("Video generation failed");
      }

      const data = await response.json();

      return {
        videoUrl: data.videoUrl,
        previewUrl: data.previewUrl,
        duration: data.duration,
        generatedAt: new Date(),
        price: this.VIDEO_PRICE,
      };
    } catch (error) {
      console.error("Video generation error:", error);
      throw new Error("Failed to generate video. Please try again.");
    }
  }

  private enhanceVideoPrompt(request: VideoGenerationRequest): string {
    return `Create a 15-second marketing video ad for "${request.productName}".
            Product description: ${request.productDescription}
            Target audience: Nigerian social media users
            Style: Professional, engaging, mobile-optimized
            Requirements: Include text overlays, smooth transitions, background music`;
  }

  getVideoPrice(): number {
    return this.VIDEO_PRICE;
  }
}

export const aiVideoGenerator = new AIVideoGenerator();
