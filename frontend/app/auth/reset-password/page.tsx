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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Key,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const { resetPassword } = useAuth();

  useEffect(() => {
    // Validate token on page load
    if (!token) {
      setTokenValid(false);
      setMessage("Invalid or missing reset token");
      setStatus("error");
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid reset token");
      setStatus("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const success = await resetPassword(token, formData.password);

      if (success) {
        setStatus("success");
        setMessage(
          "Password reset successfully! You can now login with your new password."
        );

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage("Failed to reset password. The link may have expired.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while resetting your password");
    }
  };

  if (tokenValid === false) {
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
              <div className="p-3 rounded-full bg-red-100">
                <Key className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {message ||
                  "The reset link is invalid, expired, or has already been used."}
              </AlertDescription>
            </Alert>
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please request a new password reset link from the login page.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Get New Reset Link</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Key className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {status === "success" ? "Password Reset" : "Set New Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "success"
              ? "Your password has been reset successfully"
              : "Enter your new password below"}
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
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                    disabled={status === "loading"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                    disabled={status === "loading"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading" || !tokenValid}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. You will be
                redirected to the login page shortly.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          )}

          {status !== "success" && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
