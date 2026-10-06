// hooks/useCampaigns.ts - WITHOUT CACHING
import { useEffect, useState } from "react";
import { toast } from "./use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function useCampaigns() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  // Get current user on component mount
  useEffect(() => {
    getCampaigns();
  }, []);

  // Upload image and get file URL
  // In hooks/useCampaigns.ts - UPDATE THE uploadImage FUNCTION

  // hooks/useCampaigns.ts - UPDATE uploadImage function
  const uploadImage = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string | null> => {
    try {
      console.log("🟡 [useCampaigns] Uploading directly to R2...", file.name);

      // Get presigned URL from your backend
      const token = localStorage.getItem("auth-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 1. Get presigned URL from backend
      const presignedResponse = await fetch(
        `${BASE_URL}/upload/presigned-url`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, fileUrl } = await presignedResponse.json();

      // 2. Upload directly to R2 using the presigned URL
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage);
            console.log(`📊 Direct R2 Upload Progress: ${percentage}%`);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(fileUrl);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed due to network error"));
        });

        xhr.addEventListener("timeout", () => {
          reject(new Error("Upload timed out"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Upload image error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  // COMPLETE CAMPAIGN CREATION FLOW
  // In hooks/useCampaigns.ts - UPDATE THE createCampaign FUNCTION

  const createCampaign = async (
    formData: any,
    uploadedFile: File | null,
    onUploadProgress?: (progress: number) => void
  ): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🟡 [useCampaigns] Starting campaign creation flow...");

      // Validate required fields
      if (
        !formData.campaignName ||
        !formData.targetViews ||
        !uploadedFile ||
        !formData.platform
      ) {
        throw new Error(
          "Please fill in all required fields and upload an image"
        );
      }

      // 🚨 UPLOAD FILE ONLY WHEN USER CLICKS CREATE CAMPAIGN - WITH PROGRESS
      console.log("🟡 [useCampaigns] Uploading file to Cloudflare...");
      let fileUrl: string | null = null;

      if (uploadedFile) {
        // Show upload progress
        if (onUploadProgress) {
          onUploadProgress(0); // Start at 0%
        }

        fileUrl = await uploadImage(uploadedFile, onUploadProgress);

        if (!fileUrl) {
          throw new Error("Failed to upload file to cloud storage");
        }

        if (onUploadProgress) {
          onUploadProgress(100); // Complete at 100%
        }
      }

      // Continue with the rest of your existing code...
      const targetViews = parseInt(formData.targetViews);
      let ratePerView = 5;

      const platform = formData.platform.toLowerCase();
      const isVideo = uploadedFile.type.startsWith("video/");

      if (isVideo) {
        if (platform === "whatsapp") {
          ratePerView = 8;
        } else if (platform === "all") {
          ratePerView = 16;
        } else {
          ratePerView = 12;
        }
      } else {
        if (platform === "whatsapp" || platform === "telegram") {
          ratePerView = 6;
        } else if (platform === "all") {
          ratePerView = 12;
        } else {
          ratePerView = 9;
        }
      }

      const calculatedAmount = Math.round(targetViews * ratePerView);

      // Prepare campaign data
      const campaignData = {
        title: formData.campaignName,
        category: formData.category,
        description: formData.adText,
        targetViews: targetViews,
        platform: formData.platform,
        amountPaid: calculatedAmount,
        adCreative: {
          fileUrl: fileUrl!,
          text: formData.adText,
        },
      };

      console.log(
        "📦 [useCampaigns] Campaign data for reservation:",
        campaignData
      );

      // Reserve campaign
      const reservation = await reserveCampaign(campaignData);
      if (!reservation) {
        throw new Error("Failed to reserve campaign");
      }

      // Initialize payment
      const paymentData = await initializePayment(reservation.reservationId);
      if (!paymentData) {
        throw new Error("Failed to initialize payment");
      }

      // Redirect to payment
      console.log("🔄 [useCampaigns] Redirecting to payment...");
      window.location.href = paymentData.authorization_url;
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Create campaign error:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Reserve a campaign (before payment)
  const reserveCampaign = async (
    campaignData: CreateCampaignData
  ): Promise<CampaignReservation | null> => {
    try {
      console.log("🟡 [useCampaigns] Reserving campaign...", campaignData);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/campaigns/reserve`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(campaignData),
      });

      console.log(
        "🟢 [useCampaigns] Reserve response status:",
        response.status
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      console.log("📊 [useCampaigns] Reserve response:", res);

      if (res.status === 201 && res.data) {
        toast({
          title: "Campaign Reserved!",
          description: "Redirecting you to payment — please wait…",
        });
        return res.data;
      } else {
        throw new Error(res.error || "Failed to reserve campaign");
      }
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Reserve campaign error:", error);
      toast({
        title: "Reservation Failed",
        description: error.message || "Failed to reserve campaign",
        variant: "destructive",
      });
      return null;
    }
  };

  // Initialize payment for a reserved campaign
  const initializePayment = async (
    reservationId: string
  ): Promise<PaymentData | null> => {
    try {
      console.log("🟡 [useCampaigns] Initializing payment...", reservationId);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/payment/initialize`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ reservationId }),
      });

      console.log(
        "🟢 [useCampaigns] Payment init response status:",
        response.status
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      console.log("📊 [useCampaigns] Payment init response:", res);

      if (res.status === 200 && res.data) {
        toast({
          title: "Payment Initialized",
          description: "Redirecting to payment gateway...",
        });
        return res.data;
      } else {
        throw new Error(res.error || "Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Initialize payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
      return null;
    }
  };

  // In hooks/useCampaigns.ts - ENHANCED verifyPaymentAndCreateCampaign
  const verifyPaymentAndCreateCampaign = async (
    reference: string
  ): Promise<Campaign | null> => {
    const processingKey = `processing_${reference}`;
    const successKey = `success_${reference}`;

    // PROTECTION: Check if already processing or successful
    if (sessionStorage.getItem(processingKey)) {
      console.log("🛡️ Already processing this payment reference:", reference);
      return null;
    }

    const storedCampaign = sessionStorage.getItem(successKey);
    if (storedCampaign) {
      console.log("🛡️ Payment already processed successfully:", reference);
      return JSON.parse(storedCampaign);
    }

    sessionStorage.setItem(processingKey, "true");
    setIsLoading(true);

    try {
      console.log(
        "🟡 [useCampaigns] Verifying payment and creating campaign...",
        reference
      );

      // 1. First verify the payment
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const verifyResponse = await fetch(`${BASE_URL}/payment/verify`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ reference }),
      });

      console.log(
        "🟢 [useCampaigns] Payment verify response status:",
        verifyResponse.status
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${verifyResponse.status}`
        );
      }

      const verifyRes = await verifyResponse.json();
      console.log("📊 [useCampaigns] Payment verify response:", verifyRes);

      if (verifyRes.status === 200 && verifyRes.data?.verified) {
        // 2. Extract reservationId from payment metadata
        const reservationId = verifyRes.data.payment?.metadata?.reservation_id;

        if (!reservationId) {
          throw new Error("No reservation ID found in payment metadata");
        }

        console.log(
          "🟡 [useCampaigns] Creating campaign for reservation:",
          reservationId
        );

        // 3. Create the actual campaign (this will delete the reservation)
        const createResponse = await fetch(`${BASE_URL}/campaigns/create`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            reservationId,
            paymentReference: reference,
          }),
        });

        console.log(
          "🟢 [useCampaigns] Campaign create response status:",
          createResponse.status
        );

        if (!createResponse.ok) {
          const errorData = await createResponse.json();

          // Handle specific error cases
          if (createResponse.status === 404) {
            throw new Error("Campaign reservation expired or already used");
          }

          throw new Error(
            errorData.error ||
              `Failed to create campaign: ${createResponse.status}`
          );
        }

        const createRes = await createResponse.json();
        console.log("📊 [useCampaigns] Campaign create response:", createRes);

        if (createRes.status === 201 || createRes.status === 200) {
          const campaignData = createRes.data.campaign || createRes.data;

          // Store successful result
          sessionStorage.setItem(successKey, JSON.stringify(campaignData));

          toast({
            title: "Payment Verified & Campaign Created!",
            description: "Your campaign is now active and running.",
          });

          // Refresh campaigns list
          await getCampaigns();

          return campaignData;
        } else {
          throw new Error(createRes.error || "Failed to create campaign");
        }
      } else {
        throw new Error(verifyRes.error || "Payment verification failed");
      }
    } catch (error: any) {
      console.error(
        "🔴 [useCampaigns] Verify payment and create campaign error:",
        error
      );
      toast({
        title: "Verification Failed",
        description:
          error.message || "Failed to verify payment and create campaign",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      sessionStorage.removeItem(processingKey);
    }
  };

  // Get all campaigns - NO CACHING
  const getCampaigns = async (filters?: {
    status?: string;
    platform?: string;
  }): Promise<Campaign[]> => {
    setCampaignLoading(true);

    try {
      console.log("🟡 [useCampaigns] Fetching campaigns...", filters);

      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.platform) params.append("platform", filters.platform);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = params.toString()
        ? `${BASE_URL}/campaigns?${params.toString()}`
        : `${BASE_URL}/campaigns`;

      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      console.log(
        "🟢 [useCampaigns] Get campaigns response status:",
        response.status
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      console.log("📊 [useCampaigns] Get campaigns response:", res);

      if (res.status === 200 && res.data) {
        const campaignsData = res.data.campaigns || [];
        setCampaigns(campaignsData);
        return campaignsData;
      } else {
        throw new Error(res.error || "Failed to fetch campaigns");
      }
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Get campaigns error:", error);
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch campaigns",
        variant: "destructive",
      });
      return [];
    } finally {
      setCampaignLoading(false);
    }
  };

  // Get single campaign by ID - NO CACHING
  const getCampaign = async (id: string): Promise<Campaign | null> => {
    setIsLoading(true);
    try {
      console.log("🟡 [useCampaigns] Fetching campaign...", id);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      console.log(
        "🟢 [useCampaigns] Get a campaign response status:",
        response.status
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Campaign not found");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      console.log("📊 [useCampaigns] a Get campaign response:", res);

      if (res.status === 200 && res.data) {
        setCurrentCampaign(res.data);
        console.log("current campaign:", res.data);
        return res.data;
      } else {
        throw new Error(res.error || "Failed to fetch campaign");
      }
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Get campaign error:", error);
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch campaign",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update campaign (only for campaign owner)
  const updateCampaign = async (
    id: string,
    updateData: UpdateCampaignData
  ): Promise<Campaign | null> => {
    setIsLoading(true);
    try {
      console.log("🟡 [useCampaigns] Updating campaign...", { id, updateData });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      console.log(
        "🟢 [useCampaigns] Update campaign response status:",
        response.status
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to update this campaign");
        }
        if (response.status === 404) {
          throw new Error("Campaign not found");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      console.log("📊 [useCampaigns] Update campaign response:", res);

      if (res.status === 200 && res.data) {
        // Update local state
        setCampaigns((prev) =>
          prev.map((campaign) => (campaign.id === id ? res.data : campaign))
        );
        if (currentCampaign?.id === id) {
          setCurrentCampaign(res.data);
        }

        toast({
          title: "Campaign Updated!",
          description: "Your campaign has been updated successfully.",
        });
        return res.data;
      } else {
        throw new Error(res.error || "Failed to update campaign");
      }
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Update campaign error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update campaign",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete campaign (only for campaign owner)
  const deleteCampaign = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("🟡 [useCampaigns] Deleting campaign...", id);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/campaigns/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      console.log(
        "🟢 [useCampaigns] Delete campaign response status:",
        response.status
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to delete this campaign");
        }
        if (response.status === 404) {
          throw new Error("Campaign not found");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      console.log("📊 [useCampaigns] Delete campaign response:", res);

      if (res.status === 200) {
        // Remove from local state
        setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
        if (currentCampaign?.id === id) {
          setCurrentCampaign(null);
        }

        toast({
          title: "Campaign Deleted!",
          description: "Your campaign has been deleted successfully.",
        });
        return true;
      } else {
        throw new Error(res.error || "Failed to delete campaign");
      }
    } catch (error: any) {
      console.error("🔴 [useCampaigns] Delete campaign error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats for campaigns
  const getCampaignStats = (campaigns: any[]): CampaignStats => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === "active").length;
    const pending = campaigns.filter(
      (c) => c.status === "proof_pending"
    ).length;
    const completed = campaigns.filter((c) => c.status === "completed").length;
    const approved = campaigns.filter((c) => c.status === "approved").length;
    const paid = campaigns.filter((c) => c.status === "paid").length;
    const rejected = campaigns.filter((c) => c.status === "rejected").length;

    const earnings = campaigns.reduce((sum, c) => sum + (c.earnings || 0), 0);
    const totalEarnings = campaigns.reduce(
      (sum, c) => sum + (c.totalEarnings || 0),
      0
    );
    const pendingEarnings = campaigns.reduce(
      (sum, c) => sum + (c.pendingEarnings || 0),
      0
    );

    return {
      total,
      active,
      pending,
      completed,
      approved,
      paid,
      rejected,
      earnings,
      totalEarnings,
      pendingEarnings,
    };
  };

  return {
    isLoading,
    setIsLoading,
    campaigns,
    currentCampaign,
    campaignLoading,
    setCampaignLoading,
    getCampaignStats,
    createCampaign,
    reserveCampaign,
    initializePayment,
    verifyPaymentAndCreateCampaign,
    getCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
