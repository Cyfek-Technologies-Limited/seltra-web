"use client";

import { useEffect, useState } from "react";
import type { ClipboardEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type VerificationStatus = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(searchEmail);
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", ""]);
  const code = codeDigits.join("");
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (searchEmail) {
      setEmail(searchEmail);
    } else {
      const pendingEmail = localStorage.getItem("pending_email");
      if (pendingEmail) setEmail(pendingEmail);
    }
  }, [searchEmail]);

  const completeVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !/^\d{5}$/.test(code)) {
      setStatus("error");
      setMessage("Enter the 5-digit code sent to your email.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "That code is incorrect. Check it and try again.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Email verified! Taking you to onboarding…");
      if (data.token) localStorage.setItem("auth-token", data.token);

      window.setTimeout(() => {
        if (data.needsOnboarding || !data.data?.role) {
          router.push("/auth/onboarding?flow=email");
        } else if (data.data?.role === "publisher") {
          router.push("/auth/onboarding");
        } else if (data.data?.role === "advertiser") {
          router.push("/dashboard/advertiser");
        }
      }, 1200);
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Could not verify the code. Check your connection and try again.");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Email not found. Please sign up again.");
      return;
    }

    setResendLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Could not send another code. Please try again.");
        return;
      }

      setCodeDigits(["", "", "", "", ""]);
      setStatus("idle");
      setMessage("A new verification code was sent. Check your inbox.");
      setResendCount((current) => current + 1);
      localStorage.setItem("pending_email", email);
    } catch {
      setStatus("error");
      setMessage("Could not send a new code. Check your connection and try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const updateCodeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...codeDigits];
    nextCode[index] = digit || "";
    setCodeDigits(nextCode);
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
    if (digit && index < 4) focusCodeInput(index + 1);
  };

  const pasteCode = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    setCodeDigits([...digits.split(""), ...Array(5 - digits.length).fill("")]);
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
    focusCodeInput(Math.min(digits.length, 4));
  };

  const focusCodeInput = (index: number) => {
    document.getElementById(`verification-digit-${index}`)?.focus();
  };

  const isBusy = status === "loading" || status === "success";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            {status === "success" ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : status === "loading" || resendLoading ? (
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            ) : (
              <Mail className="h-12 w-12 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "success" ? "Email verified" : "Verify your email"}
          </CardTitle>
          <CardDescription>
            Enter the 5-digit code we sent to {email || "your email address"}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status !== "success" && (
            <>
              <form onSubmit={completeVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label>Verification code</Label>
                  <div className="flex justify-center gap-2.5 sm:gap-3" role="group" aria-label="5-digit verification code">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Input
                        key={index}
                        id={`verification-digit-${index}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        aria-label={`Verification digit ${index + 1}`}
                        value={codeDigits[index]}
                        onChange={(event) => updateCodeDigit(index, event.target.value)}
                        onPaste={pasteCode}
                        onKeyDown={(event) => {
                          if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
                            focusCodeInput(index - 1);
                          } else if (event.key === "ArrowLeft" && index > 0) {
                            focusCodeInput(index - 1);
                          } else if (event.key === "ArrowRight" && index < 4) {
                            focusCodeInput(index + 1);
                          }
                        }}
                        disabled={isBusy || !email}
                        required
                        maxLength={1}
                        pattern="[0-9]"
                        className="h-11 w-11 rounded-md border-[1px] border-black/30 bg-white p-0 text-center text-lg text-slate-900 shadow-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 sm:h-12 sm:w-12"
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isBusy || code.length !== 5 || !email}>
                  {status === "loading" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking code…</>
                  ) : (
                    "Verify email"
                  )}
                </Button>
              </form>

              <div className="space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t get the email? Check your spam folder or request another code.
                </p>
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendCount >= 3 || !email}
                  variant="outline"
                  className="w-full"
                >
                  {resendLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending code…</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" />Send another code{resendCount > 0 ? ` (${resendCount})` : ""}</>
                  )}
                </Button>
                {resendCount >= 3 && (
                  <p className="text-xs text-amber-700">
                    You&apos;ve reached the resend limit. Please try again later.
                  </p>
                )}
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
