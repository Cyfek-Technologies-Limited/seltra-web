"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeGoogleCode } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  // The code is single-use, so guard against React running the effect twice.
  const hasExchanged = useRef(false);

  useEffect(() => {
    if (hasExchanged.current) return;
    hasExchanged.current = true;

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    console.log("code:", code);

    if (oauthError || !code) {
      setStatus("error");
      setMessage(
        oauthError
          ? decodeURIComponent(oauthError)
          : "Missing sign-in code. Please try again."
      );
      return;
    }

    exchangeGoogleCode(code)
      .then(({ user, needsOnboarding }) => {
        setStatus("success");

        if (needsOnboarding) {
          if (user.username) {
            sessionStorage.setItem("google_onboarding_username", user.username);
          }
          setMessage(
            "Signed in with Google. Let's finish setting up your account..."
          );
          router.replace("/auth/onboarding?flow=google");
          return;
        }

        setMessage("Signed in successfully. Redirecting to your dashboard...");
        if (user.isAdmin) {
          window.location.href = "/dashboard/admin";
        } else if (user.isPublisher) {
          window.location.href = "/dashboard/publisher";
        } else if (user.isAdvertiser) {
          window.location.href = "/dashboard/advertiser";
        } else {
          router.replace("/auth/onboarding?flow=google");
        }
      })
      .catch((error: unknown) => {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : `Google sign-in did not work: ${error}`
        );
        console.log("error signing in:", error);
      });
  }, [searchParams, exchangeGoogleCode, router]);

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
              ? "Sign-in failed"
              : "Signing you in..."}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
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
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
