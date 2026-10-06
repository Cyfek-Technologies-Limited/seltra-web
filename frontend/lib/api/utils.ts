// hooks/useCampaigns.ts
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const CACHE_KEY = "cached_campaigns";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const handleGet = async <T>(
  endpoint: string,
  options: {
    params?: Record<string, string>;
  } = {}
): Promise<T | null> => {
  const { params } = options;

  try {
    const urlParams = params ? new URLSearchParams(params) : "";
    const url = urlParams
      ? `${BASE_URL}${endpoint}?${urlParams}`
      : `${BASE_URL}${endpoint}`;

    console.log("🟡 [handleGet] Fetching:", url);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    // Add auth token from localStorage
    const token = localStorage.getItem("auth-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    console.log("🟢 [handleGet] Response status:", response.status);

    if (response.status === 401) {
      localStorage.removeItem("auth-token");
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    console.log("📊 [handleGet] Response data:", res);

    if (res.status === 200 && res.data) {
      return res.data;
    } else {
      throw new Error(res.error || "Request failed");
    }
  } catch (error: any) {
    console.error("🔴 [handleGet] Error:", error);
    throw error;
  }
};

export const handlePost = async <T>(
  endpoint: string,
  data: any
): Promise<T | null> => {
  try {
    console.log("🟡 [handlePost] Posting to:", endpoint, data);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    const token = localStorage.getItem("auth-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });

    console.log("🟢 [handlePost] Response status:", response.status);

    if (response.status === 401) {
      localStorage.removeItem("auth-token");
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    console.log("📊 [handlePost] Response data:", res);

    if (res.status === 200 || res.status === 201) {
      return res.data;
    } else {
      throw new Error(res.error || "Request failed");
    }
  } catch (error: any) {
    console.error("🔴 [handlePost] Error:", error);
    throw error;
  }
};

export function useCampaigns() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    getCampaigns();
  }, []);

  // File upload
  const handleFileUpload = async (
    file: File,
    endpoint: string = "/upload/creative"
  ): Promise<string | null> => {
    try {
      console.log("🟡 [handleFileUpload] Uploading file...", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const headers: HeadersInit = {};
      const token = localStorage.getItem("auth-token");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      console.log("🟢 [handleFileUpload] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const res = await response.json();
      console.log("📊 [handleFileUpload] Response:", res);

      if (res.status === "200" && res.data?.url) {
        return res.data.url;
      } else {
        throw new Error(res.error || "Failed to upload file");
      }
    } catch (error: any) {
      console.error("🔴 [handleFileUpload] Error:", error);
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      return await handleFileUpload(file, "/upload/creative");
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const createCampaign = async (
    formData: any,
    uploadedFile: File | null
  ): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🟡 [useCampaigns] Starting campaign creation flow...");

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

      let fileUrl: string | null = null;
      if (uploadedFile) {
        fileUrl = await uploadImage(uploadedFile);
        if (!fileUrl) throw new Error("Failed to upload image");
      }

      const campaignData = {
        title: formData.campaignName,
        category: formData.category,
        description: formData.adText,
        targetViews: parseInt(formData.targetViews),
        platform: formData.platform,
        amountPaid: formData.amountPaid,
        adCreative: { fileUrl: fileUrl!, text: formData.adText },
      };

      console.log(
        "📦 [useCampaigns] Campaign data for reservation:",
        campaignData
      );

      const reservation = await handlePost<CampaignReservation>(
        "/campaigns/reserve",
        campaignData
      );
      if (!reservation) throw new Error("Failed to reserve campaign");

      const paymentData = await handlePost<PaymentData>("/payment/initialize", {
        reservationId: reservation.reservationId,
      });
      if (!paymentData) throw new Error("Failed to initialize payment");

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

  const getCampaigns = async (filters?: {
    status?: string;
    platform?: string;
  }): Promise<Campaign[]> => {
    setCampaignLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.platform) params.platform = filters.platform;

      const campaignsData = await handleGet<Campaign[]>("/campaigns", {
        params,
      });

      if (Array.isArray(campaignsData)) {
        setCampaigns(campaignsData);
        return campaignsData;
      } else {
        throw new Error("Invalid campaigns data format");
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

  const getCampaign = async (id: string): Promise<Campaign | null> => {
    setIsLoading(true);
    try {
      const campaign = await handleGet<Campaign>(`/campaigns/${id}`);
      if (campaign) {
        setCurrentCampaign(campaign);
        return campaign;
      } else {
        throw new Error("Failed to fetch campaign");
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

  const updateCampaign = async (
    id: string,
    updateData: UpdateCampaignData
  ): Promise<Campaign | null> => {
    setIsLoading(true);
    try {
      const updatedCampaign = await handlePost<Campaign>(
        `/campaigns/${id}`,
        updateData
      );
      if (updatedCampaign) {
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === id ? updatedCampaign : campaign
          )
        );
        if (currentCampaign?.id === id) setCurrentCampaign(updatedCampaign);

        toast({
          title: "Campaign Updated!",
          description: "Your campaign has been updated successfully.",
        });
        return updatedCampaign;
      } else {
        throw new Error("Failed to update campaign");
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

  const deleteCampaign = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await handlePost<any>(`/campaigns/${id}`, {});
      if (result) {
        setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
        if (currentCampaign?.id === id) setCurrentCampaign(null);

        toast({
          title: "Campaign Deleted!",
          description: "Your campaign has been deleted successfully.",
        });
        return true;
      } else {
        throw new Error("Failed to delete campaign");
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
    getCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    handleGet,
    handlePost,
    handleFileUpload,
  };
}
