"use client";
import { useEffect, useState } from "react";
import { UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Card, Logo } from "../../../components/ui/ReusableComponents";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams } from "next/navigation";
import { AuthDivider, GoogleAuthButton } from "@/components/GoogleAuthButton";

export default function Register() {
  const searchParams = useSearchParams();
  const { isLoading, signUp, continueWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
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

    sessionStorage.setItem(
      "pending_registration",
      JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    );

    await signUp(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-subtle to-secondary-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-elevated">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">Join Seltra</CardTitle>
          <CardDescription className="text-black">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleAuthButton
            label="Sign up with Google"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full"
          />
          <AuthDivider label="or sign up with email" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number (must be a whatsapp line)"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label
                htmlFor="terms"
                className="text-xs lg:text-sm font-normal leading-5"
              >
                I agree to the{" "}
                <Link
                  href="/legal/privacy"
                  className="text-primary underline font-medium"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                . You&apos;ll review the terms for your account type during
                onboarding.
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !agreeToTerms}
            >
              {isLoading ? (
                "Creating account..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <div className="pt-4 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
