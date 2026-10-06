// components/campaign/AIImageGenerator.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Download, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  aiImageGenerator,
  ImageGenerationResponse,
} from "@/lib/ai-image-generation";

interface AIImageGeneratorProps {
  campaignName: string;
  category: string;
  platform: string;
  onImageGenerated: (imageUrl: string) => void;
}

export function AIImageGenerator({
  campaignName,
  category,
  platform,
  onImageGenerated,
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] =
    useState<ImageGenerationResponse | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe what you want in your flyer",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiImageGenerator.generateFlyer({
        prompt,
        campaignName,
        category,
        platform,
      });

      setGeneratedImage(result);
      onImageGenerated(result.imageUrl);

      toast({
        title: "Flyer Generated!",
        description: "Your AI-generated flyer is ready to use",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage.imageUrl);
      toast({
        title: "Flyer Applied!",
        description: "AI-generated flyer has been added to your campaign",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          Generate Flyer with AI
        </CardTitle>
        <CardDescription>
          Create a professional flyer instantly. Describe what you want and
          we'll generate it for free.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-prompt">Describe your flyer</Label>
          <Textarea
            id="ai-prompt"
            placeholder="e.g., 'A vibrant flyer for a restaurant sale with food images, discount text, and contact information'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Be specific about colors, style, and content for better results
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Free Flyer
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-3 p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Flyer Ready!</span>
            </div>

            <div className="space-y-2">
              <img
                src={generatedImage.imageUrl}
                alt="Generated flyer"
                className="w-full rounded-lg border max-h-64 object-contain"
              />
              <p className="text-xs text-muted-foreground">
                Generated: {generatedImage.generatedAt.toLocaleTimeString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUseImage} className="flex-1">
                Use This Flyer
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(generatedImage.imageUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
