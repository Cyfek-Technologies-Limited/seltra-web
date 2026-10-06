"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "./use-toast";

const LOGOUT_FLAG_KEY = "just_logged_out";
const USER_CACHE_KEY = "cached_user";
const CACHE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Create Auth Context
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const getCachedUser = (): { user: User | null; shouldRefresh: boolean } => {
    if (typeof window === "undefined") {
      return { user: null, shouldRefresh: true };
    }

    try {
      // Check if we just logged out
      const justLoggedOut = sessionStorage.getItem(LOGOUT_FLAG_KEY);
      if (justLoggedOut === "true") {
        localStorage.removeItem(USER_CACHE_KEY);
        return { user: null, shouldRefresh: true };
      }

      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (!cached) return { user: null, shouldRefresh: true };

      const { user: cachedUser, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_TIMEOUT;

      if (isExpired) {
        localStorage.removeItem(USER_CACHE_KEY);
        return { user: null, shouldRefresh: true };
      }

      return { user: cachedUser, shouldRefresh: false };
    } catch {
      return { user: null, shouldRefresh: true };
    }
  };

  const cacheUser = (userData: User) => {
    if (typeof window === "undefined") return;

    try {
      const cacheData = {
        user: userData,
        timestamp: Date.now(),
      };
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to cache user:", error);
    }
  };

  const clearCache = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(USER_CACHE_KEY);
      localStorage.removeItem("auth-token");
      localStorage.removeItem("pending_email");
      localStorage.removeItem("logout_flag");

      // Clear session storage as well
      sessionStorage.removeItem(LOGOUT_FLAG_KEY);
      sessionStorage.removeItem("auth_state");

      // Force state update
      setUser(null);
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  };

  // Add bfcache event listener
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // If page is restored from bfcache, refresh auth state
      if (event.persisted) {
        console.log("Page restored from bfcache, refreshing auth...");
        getCurrentUser(true);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (!window.location.pathname.startsWith("/auth")) {
      getCurrentUser();
    }
  }, []);

  const getCurrentUser = async (forceRefresh = false): Promise<User | null> => {
    let logoutTime: string | null = null;
    if (typeof window !== "undefined") {
      logoutTime = localStorage.getItem("logout_flag");
    }

    try {
      if (logoutTime && Date.now() - parseInt(logoutTime) < 5000) {
        clearCache();
        setUserLoading(false);

        return null;
      }

      let justLoggedOut: string | null = null;
      if (typeof window !== "undefined") {
        justLoggedOut = sessionStorage.getItem(LOGOUT_FLAG_KEY);
      }
      if (justLoggedOut === "true") {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(LOGOUT_FLAG_KEY);
          localStorage.removeItem("logout_flag");
        }
        setUserLoading(false);
        return null;
      }

      if (!forceRefresh) {
        const { user: cachedUser, shouldRefresh } = getCachedUser();

        if (cachedUser && !shouldRefresh) {
          console.log("cachedUser:", cachedUser);

          setUser(cachedUser);
          setUserLoading(false);
          return cachedUser;
        }

        if (cachedUser && shouldRefresh) {
          setUser(cachedUser);
          setUserLoading(false);
          refreshUserInBackground();
          return cachedUser;
        }
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      let localStorageToken: string | null = null;
      if (typeof window !== "undefined") {
        localStorageToken = localStorage.getItem("auth-token");
      }
      if (localStorageToken) {
        headers["Authorization"] = `Bearer ${localStorageToken}`;
      }

      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        headers,
        credentials: "include",
      });
      console.log("user response in useAuth is:", response);

      if (!response.ok) {
        if (response.status === 401) {
          clearCache();
          setUser(null);
          setUserLoading(false);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res: UserResponse = await response.json();

      if (res.status === 200 && res.data) {
        cacheUser(res.data);
        setUser(res.data);
        setUserLoading(false);
        return res.data;
      } else {
        clearCache();
        setUser(null);
        setUserLoading(false);
        return null;
      }
    } catch (error: any) {
      const { user: cachedUser } = getCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
        setUserLoading(false);
        return cachedUser;
      }

      setUser(null);
      setUserLoading(false);
      return null;
    }
  };

  const refreshUserInBackground = async () => {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      let localStorageToken: string | null = null;
      if (typeof window !== "undefined") {
        localStorageToken = localStorage.getItem("auth-token");
      }
      if (localStorageToken) {
        headers["Authorization"] = `Bearer ${localStorageToken}`;
      }

      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const res: UserResponse = await response.json();
        if (res.status === 200 && res.data) {
          cacheUser(res.data);
          setUser(res.data);
        }
      }
    } catch (error) {
      console.log("Background refresh failed:", error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await getCurrentUser(true);
    window.location.reload();
  };

  const signUp = async (formData: AuthFormData): Promise<boolean> => {
    setIsLoading(true);
    clearCache();

    console.log("formdata:", formData);
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const res: AuthResponse = await response.json();

      if (res.status === 200) {
        if (typeof window !== "undefined") {
          localStorage.setItem("pending_email", formData.email);
        }

        toast({
          title: "Verify Your Email",
          description: "Check your email for verification link.",
        });

        router.push(
          `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
        );
        return true;
      } else {
        toast({
          title: "Signup Failed",
          description: res.error || "Something went wrong",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    formData: Omit<AuthFormData, "name" | "confirmPassword" | "role">
  ): Promise<boolean> => {
    setIsLoading(true);
    clearCache();

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const res: AuthResponse = await response.json();

      if (res.token && typeof window !== "undefined") {
        localStorage.setItem("auth-token", res.token);
      }

      console.log("login res", res);

      if (res.status === 200) {
        if (res.data) {
          cacheUser(res.data);
          setUser(res.data);
        }

        toast({
          title: "Welcome back! 👋",
          description: res.msg || "Logged in successfully!",
        });

        if (res?.data.isAdmin) {
          window.location.href = "/dashboard/admin";
        } else if (res?.data.isPublisher) {
          window.location.href = "/dashboard/publisher";
        } else if (res?.data.isAdvertiser) {
          window.location.href = "/dashboard/advertiser";
        }

        return true;
      } else {
        toast({
          title: "Login Failed",
          description: res.error || "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Unable to connect to server",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    // Set logout flag in multiple storage locations
    if (typeof window !== "undefined") {
      sessionStorage.setItem(LOGOUT_FLAG_KEY, "true");
      localStorage.setItem("logout_flag", Date.now().toString());
    }

    // Clear all auth data
    setUser(null);
    clearCache();

    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      console.log("response,", response);

      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      } else {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out.",
        });

        // Force a full page reload to clear bfcache and React state
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Backend logout failed:", error);
      toast({
        title: "Log out Failed",
        description: error,
      });
    }
  };

  const googleLogin = async (role: string = "publisher"): Promise<void> => {
    clearCache();

    try {
      const response = await fetch(`${BASE_URL}/auth/google?role=${role}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get Google auth URL");
      }

      const data = await response.json();

      if (data.data?.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        throw new Error("No auth URL received");
      }
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: error.message || "Failed to initiate Google login",
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
        return true;
      } else {
        toast({
          title: "Reset Failed",
          description: data.error || "Failed to send reset email",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: "Failed to send reset email",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset",
          description: "Your password has been reset successfully.",
        });
        return true;
      } else {
        toast({
          title: "Reset Failed",
          description: data.error || "Failed to reset password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email to verify your account.",
        });
        return true;
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
      return false;
    }
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return {
    isLoading,
    userLoading,
    user,
    signUp,
    login,
    googleLogin,
    logout,
    refreshUser,
    getCurrentUser,
    isAuthenticated,
    hasRole,
    sendVerificationEmail,
    forgotPassword,
    resetPassword,
  };
}
