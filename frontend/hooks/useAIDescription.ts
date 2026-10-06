// hooks/useAIDescription.ts
import { useState, useCallback } from "react";
import { toast } from "./use-toast";

export interface AIDescriptionRequest {
  campaignName: string;
  shortDescription: string;
  platform?: string;
  targetAudience?: string;
  tone?: string; // Optional: allow tone specification
}

export interface AIVersion {
  title: string;
  description: string;
  tone: string;
}

export interface AIResponse {
  success: boolean;
  generatedDescription?: {
    versions: AIVersion[];
  };
  versions?: AIVersion[]; // Fallback property
  error?: string;
  originalInput?: AIDescriptionRequest;
}

export interface UseAIDescriptionReturn {
  generateDescription: (
    data: AIDescriptionRequest
  ) => Promise<AIVersion[] | null>;
  generatedDescriptions: AIVersion[];
  isGenerating: boolean;
  clearDescriptions: () => void;
  error: string | null;
  retryCount: number;
}

// Fallback content generator for when AI service is unavailable
// const generateFallbackContent = (
//   campaignName: string,
//   shortDescription: string,
//   platform?: string,
//   targetAudience?: string
// ): AIVersion[] => {
//   const platformText = platform ? `on ${platform}` : "across social media";
//   const audienceText = targetAudience
//     ? `targeting ${targetAudience}`
//     : "for maximum engagement";

//   return [
//     {
//       title: "Engaging Social Ad",
//       description: `Discover ${campaignName}! ${shortDescription}. Perfect ${audienceText} ${platformText}. Click to learn more and take action today!`,
//       tone: "Conversational",
//     },
//     {
//       title: "Compelling Offer",
//       description: `Don't miss out on ${campaignName}! ${shortDescription}. Limited time opportunity ${platformText}. Join now and experience the difference!`,
//       tone: "Urgent",
//     },
//     {
//       title: "Value Proposition",
//       description: `Experience the amazing benefits of ${campaignName}. ${shortDescription}. Designed ${audienceText} ${platformText}. Start your journey today!`,
//       tone: "Exciting",
//     },
//     {
//       title: "Trust Building",
//       description: `Join thousands who love ${campaignName}. ${shortDescription}. Built with quality and care ${platformText}. Your satisfaction is guaranteed!`,
//       tone: "Trustworthy",
//     },
//   ];
// };

// Validate AI response structure
const validateAIResponse = (data: any): data is AIResponse => {
  if (!data || typeof data !== "object") return false;

  // Check if we have versions in either structure
  const hasVersions =
    (data.generatedDescription?.versions &&
      Array.isArray(data.generatedDescription.versions)) ||
    (data.versions && Array.isArray(data.versions));

  return data.success === true && hasVersions;
};

// Extract versions from response with fallbacks
const extractVersions = (data: any): AIVersion[] => {
  if (!data) return [];

  // Try different possible response structures
  const versions =
    data.generatedDescription?.versions ||
    data.versions ||
    data.descriptions ||
    [];

  // Validate each version has required fields
  return versions
    .filter(
      (version: any) =>
        version &&
        typeof version.title === "string" &&
        typeof version.description === "string" &&
        typeof version.tone === "string"
    )
    .map((version: any) => ({
      title: version.title || "AI Generated Version",
      description: version.description || "",
      tone: version.tone || "Conversational",
    }));
};

export function useAIDescription(): UseAIDescriptionReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<
    AIVersion[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const generateDescription = useCallback(
    async (data: AIDescriptionRequest): Promise<AIVersion[] | null> => {
      if (!data.campaignName?.trim() || !data.shortDescription?.trim()) {
        const errorMsg = "Campaign name and description are required";
        setError(errorMsg);
        toast({
          title: "Missing Information",
          description: errorMsg,
          variant: "destructive",
        });
        return null;
      }

      setIsGenerating(true);
      setError(null);
      setGeneratedDescriptions([]);

      try {
        console.log("🟡 [AI] Generating description with data:", {
          campaignName: data.campaignName,
          shortDescription: data.shortDescription.substring(0, 100) + "...",
          platform: data.platform,
          targetAudience: data.targetAudience,
        });

        // Validate BASE_URL
        if (!BASE_URL) {
          console.warn("🟡 [AI] BASE_URL not found, using fallback content");
          throw new Error("AI service endpoint not configured");
        }

        const response = await fetch(`${BASE_URL}/ai/generate-description`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        console.log("🟡 [AI] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("🔴 [AI] API error response:", errorText);
          throw new Error(
            `AI service responded with ${response.status}: ${response.statusText}`
          );
        }

        const result: AIResponse = await response.json();
        console.log("🟡 [AI] Raw API response:", result);

        // Validate response structure
        if (!validateAIResponse(result)) {
          console.warn("🟡 [AI] Invalid response structure, using fallback");
          throw new Error("AI service returned invalid response format");
        }

        const versions = extractVersions(result);

        if (versions.length === 0) {
          throw new Error("No valid descriptions were generated");
        }

        setGeneratedDescriptions(versions);
        setRetryCount(0); // Reset retry count on success

        toast({
          title: "AI Description Generated!",
          description: `Created ${versions.length} compelling versions for your campaign`,
        });

        return versions;
      } catch (error: any) {
        console.error("🔴 AI Generation Error:", error);

        // Generate fallback content
        // const fallbackVersions = generateFallbackContent(
        //   data.campaignName,
        //   data.shortDescription,
        //   data.platform,
        //   data.targetAudience
        // );

        // setGeneratedDescriptions(fallbackVersions);
        setRetryCount((prev) => prev + 1);

        const errorMessage = error.message || "Could not generate description";
        setError(errorMessage);

        // Only show error toast if this is not a fallback scenario
        if (!error.message?.includes("fallback")) {
          toast({
            title:
              retryCount > 0
                ? "Using Fallback Content"
                : "AI Service Unavailable",
            description:
              retryCount > 0
                ? "Showing pre-generated marketing copy"
                : "Using backup content while AI service is down",
            variant: retryCount > 0 ? "default" : "destructive",
          });
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [BASE_URL, retryCount]
  );

  const clearDescriptions = useCallback(() => {
    setGeneratedDescriptions([]);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    generateDescription,
    generatedDescriptions,
    isGenerating,
    clearDescriptions,
    error,
    retryCount,
  };
}
