"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Mail, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerifyPhoneModal } from "@/components/VerifyPhoneModal";

export default function VerifyEmailPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "waiting"
  >(token && email ? "loading" : "waiting");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [openVerify, setOpenVerify] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (token && email) {
      completeVerification(token, email);
    }
  }, [token, email]);

  const completeVerification = async (token: string, email: string) => {
    try {
      setStatus("loading");
      setMessage("Verifying your email...");

      const response = await fetch(`${BASE_URL}/auth/verify-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: decodeURIComponent(email),
          token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "Email verified successfully! Redirecting to dashboard..."
        );

        // ✅ Store token in localStorage for iPhone compatibility
        if (data.token) {
          localStorage.setItem("auth-token", data.token);
        }

        setTimeout(() => {
          if (data.data?.role === "publisher") {
            // router.push("/dashboard/publisher");
            router.push("/auth/onboarding");
          } else if (data.data?.role === "advertiser") {
            router.push("/dashboard/advertiser");
          }
        }, 1500);

        // setTimeout(() => {
        //   setOpenVerify(true);
        // }, 1500);

        // setTimeout(() => {
        //   router.push("/auth/onboarding");
        // }, 1500);
      } else {
        setStatus("error");
        setMessage(
          data.error ||
            "Verification failed. You can request a new verification email."
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);

      // Get email from URL or use a stored one
      const userEmail = email || localStorage.getItem("pending_email");

      if (!userEmail) {
        setMessage("Email not found. Please sign up again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ New verification email sent! Check your inbox.");
        setResendCount((prev) => prev + 1);

        // Store email for future resend attempts
        localStorage.setItem("pending_email", userEmail);
      } else {
        setMessage(`❌ ${data.error || "Failed to resend email"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "success" ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : status === "error" ? (
              <XCircle className="h-12 w-12 text-red-600" />
            ) : status === "loading" ? (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            ) : (
              <Mail className="h-12 w-12 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "success"
              ? "Email Verified!"
              : status === "error"
              ? "Verification Failed"
              : status === "loading"
              ? "Verifying Email..."
              : "Verify Your Email"}
          </CardTitle>
          <CardDescription>
            {status === "waiting" && "Check your email for a verification link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "waiting" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to your email address. Please
                check your inbox and click the link to verify your account.
              </p>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check spam folder or resend.
                </p>

                <Button
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendCount >= 3}
                  variant="outline"
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Verification Email
                      {resendCount > 0 && ` (${resendCount})`}
                    </>
                  )}
                </Button>

                {resendCount >= 3 && (
                  <p className="text-xs text-amber-600">
                    Maximum resend attempts reached. Please wait or contact
                    support.
                  </p>
                )}

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending New Verification Email...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Send New Verification Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push("/auth/signup")}
                  variant="outline"
                  className="w-full"
                >
                  Try Signing Up Again
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          )}

          {/* {isLogin && (
            <div className="text-center">
              <Button asChild className="w-full">
                <Link href={"/auth/login"}>Login</Link>
              </Button>
            </div>
          )} */}

          {status === "success" && (
            <VerifyPhoneModal
              open={openVerify}
              onClose={() => setIsLogin(true)}
              phone={""}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
