// lib/functions/publishers/earnings.ts - UPDATED WITH MORE LOGS
import { toast } from "@/hooks/use-toast";
import { handleGet, handlePost } from "@/lib/api/utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Add proper interface for the dashboard data
interface PublisherDashboardStats {
  totalCampaigns: number;
  availableCampaigns: number;
  totalEarnings: number;
  approvedEarnings: number;
  pendingEarnings: number;
  strikes: number;
  completionRate: number;
}

interface PublisherDashboardAccount {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  isVerified: boolean;
}

interface PublisherDashboardProfile {
  verified: boolean;
  platforms: any;
  userId: string;
  memberSince: Date;
  age: Number;
  gender: string;
  location: string;
  occupation: string;
  phone: string;
}

interface RecentEarning {
  id: string;
  amount: number;
  views: number;
  status: string;
  claimedAt: Date;
  campaignTitle: string;
  platform: string;
}

interface Strike {
  reason: string;
  severity: string;
  issuedAt: Date;
}

export interface PublisherDashboardData {
  profile: PublisherDashboardProfile;
  account: PublisherDashboardAccount;
  stats: PublisherDashboardStats;
  recentEarnings: RecentEarning[];
  strikes: Strike[];
  warnings: string | null;
}

export const getPublisherDashboard =
  async (): Promise<PublisherDashboardData> => {
    try {
      console.log("🟡 [getPublisherDashboard] Fetching publisher dashboard...");

      // 🔥 IPHONE FIX: Add timeout and better error handling
      const data = await handleGet<PublisherDashboardData>(
        "/publisher/dashboard"
      );

      if (!data) {
        throw new Error("No data received from server");
      }

      // 🔥 IPHONE FIX: Validate and transform the data to ensure it matches the interface
      const validatedData: PublisherDashboardData = {
        profile: data.profile || {
          verified: false,
          platforms: {},
          userId: "",
          memberSince: new Date(),
          age: 0,
          gender: "",
          location: "",
          occupation: "",
          phone: "",
        },
        account: data.account || {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          isVerified: false,
        },
        stats: data.stats || {
          totalCampaigns: 0,
          availableCampaigns: 0,
          totalEarnings: 0,
          approvedEarnings: 0,
          pendingEarnings: 0,
          strikes: 0,
          completionRate: 0,
        },
        recentEarnings: data.recentEarnings || [],
        strikes: data.strikes || [],
        warnings: data.warnings || null,
      };

      console.log(
        "✅ [getPublisherDashboard] Data loaded successfully:",
        validatedData
      );
      return validatedData;
    } catch (error: any) {
      console.error("🔴 [getPublisherDashboard] Error:", error);

      // 🔥 IPHONE FIX: Provide fallback data instead of throwing
      const fallbackData: PublisherDashboardData = {
        profile: {
          verified: false,
          platforms: {},
          userId: "unknown",
          memberSince: new Date(),
          age: 0,
          gender: "",
          location: "",
          phone: "",
          occupation: "",
        },
        account: {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          isVerified: false,
        },
        stats: {
          totalCampaigns: 0,
          availableCampaigns: 0,
          totalEarnings: 0,
          approvedEarnings: 0,
          pendingEarnings: 0,
          strikes: 0,
          completionRate: 0,
        },
        recentEarnings: [],
        strikes: [],
        warnings:
          "Unable to load dashboard data. Please check your connection.",
      };

      // Only show toast for non-auth errors
      if (
        !error.message?.includes("Authentication failed") &&
        !error.message?.includes("401")
      ) {
        toast({
          title: "Connection Issue",
          description: "Failed to load dashboard data. Using offline data.",
          variant: "destructive",
        });
      }

      return fallbackData;
    }
  };

// Updated with more logs
export const initiateWithdrawal = async (amount: number): Promise<boolean> => {
  try {
    console.log(
      "🟡 [initiateWithdrawal] Starting withdrawal process for amount:",
      amount
    );
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    const token = localStorage.getItem("auth-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/publisher/withdraw`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ amount }),
    });

    console.log(
      "🟢 [initiateWithdrawal] Withdrawal response status:",
      response.status
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[initiateWithdrawal] Server error response:", errorData);
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const res = await response.json();
    console.log("📊 [initiateWithdrawal] Withdrawal response data:", res);

    if (res.status === 200) {
      console.log("[initiateWithdrawal] Withdrawal queued successfully");
      toast({
        title: "Withdrawal Requested",
        description:
          res.message ||
          "Your withdrawal is being processed. It may take a few moments.",
      });
      return true;
    } else {
      throw new Error(res.error || "Failed to process withdrawal");
    }
  } catch (error: any) {
    console.error("🔴 [initiateWithdrawal] Error:", error);
    toast({
      title: "Withdrawal Failed",
      description: error.message || "Failed to process withdrawal",
      variant: "destructive",
    });
    return false;
  }
};
