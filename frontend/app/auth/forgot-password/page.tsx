// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "Password reset instructions have been sent to your email"
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send reset email");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while processing your request");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button variant="ghost" asChild className="w-auto p-0 mb-2">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
          <div className="flex justify-center mb-4">
            <div
              className={`p-3 rounded-full ${
                status === "success" ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <Mail className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            {status === "success"
              ? "Check your email for reset instructions"
              : "Enter your email to reset your password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert
              variant={status === "error" ? "destructive" : "default"}
              className="mb-4"
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status !== "success" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                We've sent password reset instructions to your email address.
                Please check your inbox and follow the link to reset your
                password.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/login">Back to Login</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStatus("idle");
                    setEmail("");
                    setMessage("");
                  }}
                >
                  Try Another Email
                </Button>
              </div>
            </div>
          )}

          {status !== "success" && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
