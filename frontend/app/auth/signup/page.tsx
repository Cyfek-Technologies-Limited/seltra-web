"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { AuthDivider, GoogleAuthButton } from "@/components/GoogleAuthButton";
import { AuthField, AuthShell, authInputClass } from "@/components/AuthShell";

export default function Register() {
  const searchParams = useSearchParams();
  const { isLoading, signUp, continueWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    referralCode: "",
  });

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = async () => {
    if (formData.referralCode) {
      sessionStorage.setItem("pending_referral_code", formData.referralCode);
    }
    await continueWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (!agreeToTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    await signUp({
      email: formData.email.trim(),
      password: formData.password,
      ...(formData.referralCode ? { referralCode: formData.referralCode } : {}),
    } as AuthFormData);
  };

  return (
    <AuthShell
      title={
        <>
          Create your <span className="text-accent">account</span>
        </>
      }
      subtitle="Join Seltra and start advertising or earning today."
    >
      <GoogleAuthButton
        label="Sign up with Google"
        onClick={handleGoogleSignup}
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
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </AuthField>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
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
              autoComplete="new-password"
              placeholder="Create a password"
              className={authInputClass}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              minLength={8}
            />
          </AuthField>
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </div>

        <Button
          type="submit"
          className="mt-2 h-11 w-full rounded-xl"
          disabled={isLoading || !agreeToTerms}
        >
          {isLoading ? (
            "Creating account..."
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            className="mt-0.5"
          />
          <Label
            htmlFor="terms"
            className="text-xs font-normal leading-5 text-muted-foreground"
          >
            <span>
              I agree to Seltra&apos;s{" "}
              <Link
                href="/legal/privacy"
                className="font-medium text-accent hover:underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
              . You&apos;ll review the terms for your account type during
              onboarding.
            </span>
          </Label>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
