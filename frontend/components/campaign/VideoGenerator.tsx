// components/campaign/VideoGenerator.tsx
"use client";
import { useState } from "react";
import { useAIVideoGenerator } from "@/hooks/useAIVideoGenerator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Video, Sparkles, Play, Download, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VideoGeneratorProps {
  productName: string;
  productDescription: string;
  onVideoGenerated: (videoUrl: string) => void;
}

export function VideoGenerator({
  productName,
  productDescription,
  onVideoGenerated,
}: VideoGeneratorProps) {
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const { generateVideo, generatedVideo, isGenerating, progress, clearVideo } =
    useAIVideoGenerator();

  const handleGenerateVideo = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide product name and description",
        variant: "destructive",
      });
      return;
    }

    const result = await generateVideo({
      productName,
      productDescription,
      targetAudience: "Nigerian social media users",
      platform: "whatsapp",
      tone: "engaging",
    });

    if (result?.videoUrl) {
      onVideoGenerated(result.videoUrl);
    }
  };

  const handleUseVideo = () => {
    if (generatedVideo?.videoUrl) {
      onVideoGenerated(generatedVideo.videoUrl);
      setShowVideoGenerator(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowVideoGenerator(!showVideoGenerator)}
        className="flex items-center gap-2"
      >
        <Video className="w-4 h-4" />
        {showVideoGenerator ? "Close AI Video" : "Generate AI Video"}
      </Button>

      {showVideoGenerator && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="w-5 h-5" />
              AI Video Generator
            </CardTitle>
            <CardDescription className="text-blue-700">
              Create a professional product demo video using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Generation Status */}
            {isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    Generating video...
                  </span>
                  <Badge variant="secondary">{progress}%</Badge>
                </div>
                <Progress value={progress} className="h-2 bg-blue-200" />
                <p className="text-xs text-blue-600">
                  This may take 2-5 minutes. Your video will be ready shortly.
                </p>
              </div>
            )}

            {/* Generated Video Preview */}
            {generatedVideo && (
              <div className="space-y-3">
                {generatedVideo.videoUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border-2 border-green-200">
                      <video
                        src={generatedVideo.videoUrl}
                        controls
                        className="w-full h-64 object-cover"
                        poster="/video-poster.jpg"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        <Play className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleUseVideo}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Use This Video
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href={generatedVideo.videoUrl}
                          download="product-video.mp4"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="font-medium">
                        Video is being generated
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      {generatedVideo.message ||
                        "Your video is being processed and will be ready soon."}
                    </p>
                    {generatedVideo.estimatedTime && (
                      <p className="text-xs text-amber-600 mt-1">
                        Estimated time: {generatedVideo.estimatedTime}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Generation Failed */}
            {generatedVideo?.status === "failed" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="font-medium">Video generation failed</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  {generatedVideo.message ||
                    "Please try again or upload your own video."}
                </p>
                <Button
                  onClick={handleGenerateVideo}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Generate Button */}
            {!isGenerating && !generatedVideo && (
              <div className="space-y-3">
                <div className="text-sm text-blue-700 space-y-2">
                  <p>
                    ✨ AI will create a 15-30 second product demo video
                    featuring:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Professional product showcase</li>
                    <li>Engaging text overlays</li>
                    <li>Optimized for social media</li>
                    <li>Call-to-action included</li>
                  </ul>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={!productName.trim() || !productDescription.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Product Video
                </Button>
              </div>
            )}

            {/* Clear Video */}
            {generatedVideo && (
              <Button variant="outline" onClick={clearVideo} className="w-full">
                Generate New Video
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
