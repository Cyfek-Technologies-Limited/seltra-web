// lib/functions/publishers/campaigns/claim.ts - FIXED
import { toast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// acceptCampaign function
export const acceptCampaign = async (campaignId: string): Promise<boolean> => {
  try {
    console.log("🟡 [useCampaigns] Accepting campaign...", campaignId);
    // Get the auth token from localStorage
    const token = localStorage.getItem("auth-token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/publisher/campaigns/accept`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ campaignId }),
    });

    console.log(
      "🟢 [useCampaigns] Accept campaign response status:",
      response.status
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    console.log("📊 [useCampaigns] Accept campaign response:", res);

    if (res.status === 200 || res.status === 201) {
      toast({
        title: "Campaign Accepted!",
        description: "You have successfully accepted the campaign.",
      });
      return true;
    } else {
      throw new Error(res.error || "Failed to accept campaign");
    }
  } catch (error: any) {
    console.error("🔴 [useCampaigns] Accept campaign error:", error);
    toast({
      title: "Accept Failed",
      description: error.message || "Failed to accept campaign",
      variant: "destructive",
    });
    return false;
  } finally {
  }
};

// Update your handleClaimClick functionrr
export const handleClaimClick = (
  campaign: AcceptedCampaign,
  setSelectedCampaign,
  setShowClaimDialog,
  remainingViews?: number // Add this parameter
) => {
  // Only allow claiming if campaign is active
  if (campaign.status !== "ACTIVE") {
    toast({
      title: "Cannot Submit Proof",
      description:
        campaign.status === "PENDING"
          ? "Proof already submitted and under review"
          : campaign.status === "APPROVED"
          ? "Claim has been approved"
          : campaign.status === "PAID"
          ? "Payment has been completed"
          : campaign.status === "REJECTED"
          ? "Claim was rejected"
          : "Campaign is not available for proof submission",
      variant: "destructive",
    });
    return;
  }

  // Check if there are remaining views
  const viewsRemaining =
    remainingViews ?? campaign.targetViews - campaign.views;
  if (viewsRemaining <= 0) {
    toast({
      title: "No Views Available",
      description: "This campaign has already reached its target views.",
      variant: "destructive",
    });
    return;
  }

  setSelectedCampaign(campaign);
  setShowClaimDialog(true);
};

export async function handleDownloadMaterial(url: string, filename: string) {
  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isVideo =
    /\.(mp4|mov|webm|avi)$/i.test(url) ||
    /\.(mp4|mov|webm|avi)$/i.test(filename);

  if (isIOS && isVideo) {
    // iOS Safari cannot programmatically download videos
    // Open in new tab — user can then hold and tap "Save Video"
    window.open(url, "_blank");
    toast({
      title: "Save Your Video",
      description:
        "Hold your finger on the video, then tap 'Save Video' to save it to your camera roll.",
      duration: 6000,
    });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(url, "_blank");
    toast({
      title: "Opening in web browser",
      description:
        "If download doesn't start, hold the video and tap 'Save Video'.",
      duration: 5000,
    });
  }
}

export const submitProof = async (
  campaignId: string,
  proofImages: File[],
  proofUrls: string[], // Changed from proofUrl to proofUrls (array)
  views: number,
  setIsSubmitting: (value: boolean) => void,
  notes?: string
): Promise<boolean> => {
  try {
    setIsSubmitting(true);
    console.log("🟡 [submitProof] Submitting proof...", {
      campaignId,
      views,
      proofUrlsCount: proofUrls.length,
      proofImagesCount: proofImages.length,
    });

    // Upload all proof images and collect their URLs
    const uploadedUrls: string[] = [];

    // Upload each image individually
    for (const file of proofImages) {
      const formData = new FormData();
      formData.append("file", file);

      console.log("🟡 Uploading proof image...", file.name);
      const uploadResponse = await fetch(`${BASE_URL}/upload/creative`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Upload failed:", errorText);
        throw new Error(`Failed to upload proof image: ${file.name}`);
      }

      const uploadRes = await uploadResponse.json();
      console.log("🟡 Upload response:", uploadRes);

      const imageUrl =
        uploadRes.data?.url || uploadRes.url || uploadRes.imageUrl;

      if (imageUrl) {
        uploadedUrls.push(imageUrl);
        console.log("✅ Image uploaded successfully:", imageUrl);
      } else {
        console.error("❌ No URL in upload response:", uploadRes);
        throw new Error("No image URL returned from upload");
      }
    }

    if (uploadedUrls.length === 0) {
      throw new Error("No proof images were successfully uploaded");
    }

    console.log("🟡 All proof images uploaded:", uploadedUrls);
    console.log("🟡 Proof URLs:", proofUrls);

    const claimPayload = {
      campaignId: campaignId,
      proofImages: uploadedUrls, // Array of image URLs
      proofUrls: proofUrls, // Array of post URLs
      views: views,
      notes: notes || "",
    };

    console.log("🟡 Submit claim payload:", claimPayload);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/publisher/campaigns/submit`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(claimPayload),
    });

    console.log("🟢 Submit claim response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Claim submission failed:", errorData);
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    console.log("📊 Submit claim response:", res);

    if (res.status === 201 || res.status === 200) {
      toast({
        title: "Claim Submitted!",
        description: "Your claim has been submitted for review and approval.",
      });
      return true;
    } else {
      throw new Error(res.error || "Failed to submit claim");
    }
  } catch (error: any) {
    console.error("🔴 Submit claim error:", error);
    toast({
      title: "Submission Failed",
      description: error.message || "Failed to submit claim",
      variant: "destructive",
    });
    return false;
  } finally {
    setIsSubmitting(false);
  }
};

// Export other functions if needed

export const canSubmitProof = (campaign: AcceptedCampaign) => {
  // Only allow submitting proof for campaigns that are active and haven't been submitted yet
  return campaign.status === "ACTIVE" || campaign.status === "PENDING_REVIEW";
};
