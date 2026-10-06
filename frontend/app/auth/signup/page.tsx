// Updated signup.tsx: Added phone number input and formData
"use client";
import { useEffect, useState } from "react";
import {
  UserPlus,
  ArrowLeft,
  Users,
  Megaphone,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
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
type UserRole = "publisher" | "advertiser";
type SignupStep = "role-selection" | "registration";
export default function Register() {
  const searchParams = useSearchParams();
  const { isLoading, signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignupStep>("role-selection");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "publisher" as UserRole,
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
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    handleInputChange("role", role);
  };
  const handleContinue = () => {
    if (selectedRole) {
      setCurrentStep("registration");
    }
  };
  const handleBack = () => {
    setCurrentStep("role-selection");
    setSelectedRole(null);
    setAgreeToTerms(false); // Reset terms agreement when going back
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    // Validate password length
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    // Validate terms agreement
    if (!agreeToTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy");
      return;
    }
    // Store registration data in sessionStorage
    sessionStorage.setItem(
      "pending_registration",
      JSON.stringify({
        username: formData.username,
        email: formData.email,
        // phone: formData.phone,
        password: formData.password,
        role: formData.role,
      })
    );
    const result = await signUp(formData);
    if (result) {
      console.log("Signup successful, verification message sent to WhatsApp");
    }
  };
  // Get the appropriate terms link based on selected role
  const getTermsLink = () => {
    if (selectedRole === "publisher") {
      return "/legal/terms-publisher";
    } else if (selectedRole === "advertiser") {
      return "/legal/terms-advertiser";
    }
    return "/legal/terms-publisher"; // Default fallback
  };
  // Role Selection Step
  if (currentStep === "role-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-subtle to-secondary-subtle flex items-center justify-center p-4">
        <div className="w-full ">
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center">
              <Logo />
            </Link>
            <CardTitle className="text-2xl">Join Seltra</CardTitle>
            <CardDescription className="text-black">
              Choose how you want to use Seltra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 ">
            <div className="lg:flex gap-10 space-y-6 justify-center items-center">
              {/* Publisher Card */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all max-h-[200px] mt-5 hover:shadow-md flex-[0.4] ${
                  selectedRole === "publisher"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
                onClick={() => handleRoleSelect("publisher")}
              >
                <div className=" items-start space-x-4">
                  <div className="p-3 w-[55px] bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      Become a Publisher
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Earn money by displaying ads on your social media. Perfect
                      for content creators and all social media users.
                    </p>
                  </div>
                </div>
              </div>
              {/* Advertiser Card */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all max-h-[200px] flex-[0.4] hover:shadow-md ${
                  selectedRole === "advertiser"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
                onClick={() => handleRoleSelect("advertiser")}
              >
                <div className=" space-x-4">
                  <div className="w-[55px] p-3 rounded-lg bg-green-100 ">
                    <Megaphone className="h-6 mx-auto text-green-600 " />
                  </div>
                  <div className=" gap-2 items-center flex">
                    <h3 className="font-semibold text-lg">
                      Become an Advertiser
                    </h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload your business flyer or video, and thousands of
                      Nigerians share it on their personal social media accounts
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="mx-auto block w-[40%] flex"
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <div className="pt-4 border-t border-border w-[40%] mx-auto">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    );
  }
  // Registration Form Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-subtle to-secondary-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-elevated">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">
            Join as {selectedRole === "publisher" ? "Publisher" : "Advertiser"}
          </CardTitle>
          <CardDescription className="text-black">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            {/* <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (optional)</Label>
              <Input
                id="referralCode"
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChange={(e) =>
                  handleInputChange("referralCode", e.target.value)
                }
              />
            </div> */}
            {/* Terms and Conditions Checkbox */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-[10px] lg:text-sm font-normal leading-5"
                >
                  I agree to the{" "}
                  <Link
                    href={getTermsLink()}
                    className="text-primary underline font-medium"
                    target="_blank"
                  >
                    {selectedRole === "publisher" ? "Publisher" : "Advertiser"}{" "}
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-primary underline font-medium"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
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
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
