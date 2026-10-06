// components/campaign/AIVideoGenerator.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Sparkles, CreditCard, Lock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  aiVideoGenerator,
  VideoGenerationResponse,
} from "@/lib/ai-image-generation";

interface AIVideoGeneratorProps {
  productName: string;
  productDescription: string;
  category: string;
  platform: string;
  onVideoGenerated: (videoUrl: string) => void;
}

export function AIVideoGenerator({
  productName,
  productDescription,
  category,
  platform,
  onVideoGenerated,
}: AIVideoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] =
    useState<VideoGenerationResponse | null>(null);
  const router = useRouter();

  const VIDEO_PRICE = aiVideoGenerator.getVideoPrice();

  const handleGenerateVideo = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Information needed",
        description: "Please complete campaign details first",
        variant: "destructive",
      });
      return;
    }

    // Redirect to payment page for video generation
    const searchParams = new URLSearchParams({
      productName,
      productDescription,
      category: category || "general",
      platform,
      type: "video-generation",
      price: VIDEO_PRICE.toString(),
    });

    router.push(`/payment/video-generation?${searchParams.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="w-5 h-5" />
          Generate Video Ad with AI
          <Badge variant="secondary" className="ml-2">
            ₦{VIDEO_PRICE.toLocaleString()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Create engaging video ads automatically. Perfect for social media
          campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">
                Premium Video Generation
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 15-second professional video ads</li>
                <li>• Optimized for {platform} platform</li>
                <li>• Text overlays and background music</li>
                <li>• Mobile-optimized format</li>
                <li>• High engagement potential</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerateVideo}
          disabled={!productName.trim() || !productDescription.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Generate Video - ₦{VIDEO_PRICE.toLocaleString()}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Payment required before generation</p>
          <p>• Video will be available for download after payment</p>
          <p>• You can use the video in multiple campaigns</p>
        </div>
      </CardContent>
    </Card>
  );
}
