"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { AuthDivider, GoogleAuthButton } from "@/components/GoogleAuthButton";
import { AuthField, AuthShell, authInputClass } from "@/components/AuthShell";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, login, continueWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <AuthShell
      title={
        <>
          Welcome <span className="text-accent">back</span>
        </>
      }
      subtitle="Sign in to your Seltra account to continue."
    >
      <GoogleAuthButton
        label="Continue with Google"
        onClick={continueWithGoogle}
        disabled={isLoading}
        className="h-11 w-full rounded-xl"
      />

      <AuthDivider label="or continue with email" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email address</Label>
          <AuthField icon={<Mail className="h-4 w-4" aria-hidden="true" />}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={authInputClass}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </AuthField>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <AuthField
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            trailing={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            }
          >
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={authInputClass}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </AuthField>
        </div>

        <Button
          type="submit"
          className="mt-2 h-11 w-full rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            "Signing in..."
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-accent hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
