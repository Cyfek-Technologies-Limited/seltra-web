// lib/functions/publishers/campaign.ts - UPDATED
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Get campaigns for publishers (campaigns they're participating in)
export const getPublisherCampaigns = async (filters?: {
  status?: string;
}): Promise<any[]> => {
  // setIsLoading(true);
  try {
    console.log(
      "🟡 [useCampaigns] Fetching publisher accepted campaigns...",
      filters
    );

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    // 🔥 IPHONE FIX: Add auth token from localStorage
    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);

    const url = `${BASE_URL}/publisher/campaigns/my-campaigns`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log(
      "🟢 [useCampaigns] Publisher campaigns response status:",
      response.status
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    console.log("📊 [useCampaigns] Publisher campaigns response:", res);

    if (res.status === 200 && res.data) {
      return res.data.campaigns || [];
    } else {
      throw new Error(res.error || "Failed to fetch publisher campaigns");
    }
  } catch (error: any) {
    console.error("🔴 [useCampaigns] Get publisher campaigns error:", error);
    toast({
      title: "Fetch Failed",
      description: error.message || "Failed to fetch your campaigns",
      variant: "destructive",
    });
    return [];
  } finally {
    //   setIsLoading(false);
  }
};

export const loadCampaigns = async (statusFilter, setCampaigns, setStats) => {
  try {
    const data = await getPublisherCampaigns(
      statusFilter === "all" ? {} : { status: statusFilter }
    );
    setCampaigns(data.reverse());
    // Stats are included in the response from our new API
    // if (data.stats) {
    //   setStats(data.stats);
    // }
  } catch (error) {
    console.error("Failed to load campaigns:", error);
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      );
    case "REJECTED":
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    case "PAID":
      return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "PAID":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "REJECTED":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const getCampaignRemainingViews = async (
  campaignId: string
): Promise<number> => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    // 🔥 IPHONE FIX: Add auth token from localStorage
    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BASE_URL}/campaigns/${campaignId}/remaining-views`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    return res.remainingViews || 0;
  } catch (error: any) {
    console.error("🔴 Error fetching remaining views:", error);
    throw error;
  }
};
