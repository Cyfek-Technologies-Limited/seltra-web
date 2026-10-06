// hooks/useRoleManager.ts
import { useState } from "react";
import { toast } from "./use-toast";
import { useAuth } from "./useAuth";

interface UseRoleManagerReturn {
  addRole: (role: "PUBLISHER" | "ADVERTISER") => Promise<boolean>;
  switchDashboard: (targetRole: "PUBLISHER" | "ADVERTISER" | "ADMIN") => void;
  isLoading: boolean;
  currentRole: "PUBLISHER" | "ADVERTISER" | "ADMIN";
}

export function useRoleManager(): UseRoleManagerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const addRole = async (
    role: "PUBLISHER" | "ADVERTISER"
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/user/roles`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          action: "add",
          role: role,
        }),
      });

      const result = await response.json();

      if (result.status === 200) {
        await refreshUser(); // Refresh user data to get updated roles
        toast({
          title: "Success!",
          description: result.message,
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Failed",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Role management error:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchDashboard = (
    targetRole: "PUBLISHER" | "ADVERTISER" | "ADMIN"
  ) => {
    // Simply redirect to the appropriate dashboard
    if (targetRole === "PUBLISHER") {
      window.location.href = "/dashboard/publisher";
    } else if (targetRole === "ADVERTISER") {
      window.location.href = "/dashboard/advertiser";
    } else {
      window.location.href = "/dashboard/admin";
    }
  };

  // Determine current active role based on current route or user's available roles
  const getCurrentRole = (): "PUBLISHER" | "ADVERTISER" | "ADMIN" => {
    // if (user?.isAdmin) return "ADMIN";
    const path = window.location.pathname;
    if (path.includes("/advertiser")) return "ADVERTISER";
    if (path.includes("/publisher")) return "PUBLISHER";
    if (path.includes("/admin")) return "ADMIN";
    // Default to first available role

    return "PUBLISHER"; // fallback
  };

  return {
    addRole,
    switchDashboard,
    isLoading,
    currentRole: getCurrentRole(),
  };
}
