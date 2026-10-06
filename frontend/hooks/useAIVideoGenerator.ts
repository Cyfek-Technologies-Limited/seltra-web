// hooks/useAIVideoGenerator.ts
import { useState } from "react";
import { toast } from "./use-toast";

interface VideoGenerationRequest {
  productDescription: string;
  productName: string;
  targetAudience?: string;
  platform?: string;
  tone?: string;
}

interface VideoGenerationResult {
  videoUrl?: string;
  status: "generating" | "completed" | "failed" | "pending";
  message?: string;
  estimatedTime?: string;
  provider?: string;
  id?: string;
}

export function useAIVideoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] =
    useState<VideoGenerationResult | null>(null);
  const [progress, setProgress] = useState(0);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const generateVideo = async (
    data: VideoGenerationRequest
  ): Promise<VideoGenerationResult | null> => {
    setIsGenerating(true);
    setGeneratedVideo({
      status: "generating",
      message: "Starting video generation...",
    });
    setProgress(0);

    try {
      const response = await fetch(`${BASE_URL}/ai/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate video");
      }

      const result = await response.json();

      if (result.status === 200) {
        setGeneratedVideo(result.video);

        if (result.video.videoUrl) {
          toast({
            title: "Video Generated!",
            description: "Your AI-generated product video is ready",
            variant: "default",
          });
        } else {
          toast({
            title: "Video Generation Started",
            description:
              "We're creating your video. This may take a few minutes.",
            variant: "default",
          });
        }

        setIsGenerating(false);
        return result.video;
      } else {
        setIsGenerating(false);
        throw new Error("Invalid response from AI service");
      }
    } catch (error: any) {
      console.error("🔴 AI Video Generation Error:", error);
      setGeneratedVideo({
        status: "failed",
        message: error.message || "Could not generate video",
      });

      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate video",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const checkVideoStatus = async (videoId: string, provider: string) => {
    try {
      const response = await fetch(`${BASE_URL}/ai/video-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, provider }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedVideo(result.video);
        return result.video;
      }
    } catch (error) {
      console.error("Error checking video status:", error);
    }
  };

  const clearVideo = () => {
    setGeneratedVideo(null);
    setProgress(0);
  };

  return {
    generateVideo,
    generatedVideo,
    isGenerating,
    progress,
    clearVideo,
    checkVideoStatus,
  };
}
