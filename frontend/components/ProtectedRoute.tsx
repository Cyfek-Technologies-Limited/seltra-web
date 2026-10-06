// components/ProtectedRoute.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, userLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const checkAuth = setTimeout(() => {
      setIsChecking(false);

      if (!userLoading) {
        if (!isAuthenticated()) {
          console.log("🔐 Not authenticated, redirecting to login");
          router.push("/auth/login");
          return;
        }

        if (requiredRole && !hasRole(requiredRole)) {
          console.log("🚫 Insufficient permissions, redirecting");
          router.push("/dashboard");
          return;
        }
      }
    }, 500);

    return () => clearTimeout(checkAuth);
  }, [user, userLoading, isAuthenticated, hasRole, requiredRole, router]);

  // Show loading spinner while checking auth
  if (userLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If we have a user and they're authenticated, show the content
  if (user && isAuthenticated()) {
    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  // If we get here, we're still loading or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
