"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    processOAuthCallback();
  }, []);

  const processOAuthCallback = async () => {
    try {
      // Get the role from sessionStorage
      const selectedRole = sessionStorage.getItem("oauth_role");

      if (!selectedRole) {
        throw new Error("No role selected");
      }

      // Call backend to complete OAuth registration
      const response = await fetch("/api/v1/auth/oauth-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Account created successfully! Redirecting to dashboard...");

        // Clear the stored role
        sessionStorage.removeItem("oauth_role");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to create account");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`p-3 rounded-full ${
                status === "success"
                  ? "bg-green-100"
                  : status === "error"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : status === "error" ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "success"
              ? "Success!"
              : status === "error"
              ? "Error"
              : "Processing..."}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Your account has been created successfully. You will be
                redirected shortly.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <Button
                onClick={() => router.push("/auth/signup")}
                className="w-full"
              >
                Try Again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
