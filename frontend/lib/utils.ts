import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth-token");
};

export const handleResponse = (res) => {
  console.log("response", res);

  if (res.status === "200") {
    toast({
      title: "Success!",
      description: res.msg,
    });
  } else {
    toast({
      title: "Failed!",
      variant: "destructive",
      description: res.error,
    });
  }
};

export const handleGet = async (url) => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const localStorageToken = getAuthToken();
    if (localStorageToken) {
      headers["Authorization"] = `Bearer ${localStorageToken}`;
    }

    const response = await fetch(`${BASE_URL}/${url}`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (err) {
    toast({
      title: "An Error Occured",
      description: err.message,
      variant: "destructive",
    });
    console.log("err", err);
  }
};

export const handlePost = async (url, formData) => {
  try {
    const resRaw = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const res = await resRaw.json();
    handleResponse(res);
    return res;
  } catch (error) {
    toast({
      title: error.message,
      description: "Please refresh the page and try again.",
      variant: "destructive",
    });
    console.log("err", error);
    return;
  }
};
export const handleInputChange =
  (setState: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

export const handlePostWithFile = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: data, // Pass FormData directly
      // credentials: "include", // Include cookies if needed
    });

    const res = await response.json();
    handleResponse(res);
    return res;
  } catch (error) {
    toast({
      title: error.message,
      description: "Please refresh the page and try again.",
      variant: "destructive",
    });
    console.log("err", error);
    return;
  }
};

export const handleUploadProof = async (campaignId: string, proofData: any) => {
  // TODO: API call to upload proof
  console.log("Uploading proof for campaign:", campaignId, proofData);
  toast({
    title: "Proof Submitted!",
    description: "Your proof has been submitted for verification.",
  });
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/utils.ts - Additional utility functions
export const handlePut = async (url: string, data: any) => {
  try {
    const resRaw = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res = await resRaw.json();
    handleResponse(res);
    return res;
  } catch (error) {
    toast({
      title: error.message,
      description: "Please refresh the page and try again.",
      variant: "destructive",
    });
    console.log("err", error);
    return;
  }
};

export const handleDelete = async (url: string) => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const localStorageToken = getAuthToken();
    if (localStorageToken) {
      headers["Authorization"] = `Bearer ${localStorageToken}`;
    }

    const resRaw = await fetch(url, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    const res = await resRaw.json();
    handleResponse(res);
    return res;
  } catch (error) {
    toast({
      title: error.message,
      description: "Please refresh the page and try again.",
      variant: "destructive",
    });
    console.log("err", error);
    return;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log("🔵 [lib/utils] Getting current user...");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth token from localStorage for iPhone compatibility
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("token", token);

    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log(
      "🟢 [lib/utils] Current user response status:",
      response.status
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.log("❌ [useAuth] Not authenticated (401)");
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res: UserResponse = await response.json();
    console.log("📊 [useAuth] Current user response:", res);

    if (res.status === 200 && res.data) {
      console.log("✅ [useAuth] Current user fetched successfully");
      return res.data;
    } else {
      console.log("❌ [useAuth] Failed to get current user:", res.error);
      return null;
    }
  } catch (error: any) {
    console.log("🔴 [useAuth] Error getting current user:", error);
    return null;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
