"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/hooks/useCampaigns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  CreditCard,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Save,
  Edit,
  Smartphone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import Link from "next/link";
import { getPublisherDashboard } from "@/lib/functions/publishers/earnings";
import { toast } from "@/hooks/use-toast";
import { VerifyPhoneModal } from "@/components/VerifyPhoneModal";

export default function PublisherProfilePage() {
  const { user, userLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isloadProfileData, setIsLoadProfileData] = useState(true);
  const [openVerify, setOpenVerify] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Form state - UPDATED with demographic fields
  const [formData, setFormData] = useState({
    platforms: {
      whatsapp: false,
      instagram: false,
      twitter: false,
      linkedin: false,
    },
    bankName: "",
    accountNumber: "",
    accountName: "",
    // New demographic fields
    age: "",
    gender: "",
    location: "",
    occupation: "",
  });

  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  useEffect(() => {
    if (user?.isPublisher) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const data = await getPublisherDashboard();
      setProfileData(data);

      // Initialize form data with current values
      if (data) {
        setFormData({
          platforms: data.profile.platforms || {
            whatsapp: false,
            instagram: false,
            twitter: false,
            linkedin: false,
          },
          bankName: data.account.bankName || "",
          accountNumber: data.account.accountNumber || "",
          accountName: data.account.accountName || "",
          // Initialize demographic fields
          age: data.profile.age?.toString() || "",
          gender: data.profile.gender || "",
          location: data.profile.location || "",
          occupation: data.profile.occupation || "",
        });
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoadProfileData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;

    // Validation for bank details
    if (
      formData.bankName &&
      (!formData.accountNumber || !formData.accountName)
    ) {
      toast({
        title: "Event Failed",
        description: "Please fill in all bank account details",
        variant: "destructive",
      });
      return;
    }

    if (formData.accountNumber && formData.accountNumber.length < 10) {
      toast({
        title: "Event Failed",
        description: "Please enter a valid account number",
        variant: "destructive",
      });
      return;
    }

    // Validation for demographic fields
    if (
      !formData.age ||
      !formData.gender ||
      !formData.location ||
      !formData.occupation
    ) {
      toast({
        title: "Profile Incomplete",
        description:
          "Please fill in all required demographic information (age, gender, location, occupation)",
        variant: "destructive",
      });
      return;
    }

    const ageValue = parseInt(formData.age);
    if (ageValue < 18 || ageValue > 100) {
      toast({
        title: "Invalid Age",
        description: "Age must be between 18 and 100",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${BASE_URL}/publisher/profile`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();

      toast({
        title: "Success!",
        description: "Your Profile has been updated",
      });
      setIsEditing(false);
      await loadProfileData(); // Refresh data
    } catch (error: any) {
      console.error("Profile update error:", error);

      toast({
        title: "Event Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if profile is complete (all demographic fields filled)
  const isProfileComplete =
    formData.age && formData.gender && formData.location && formData.occupation;

  if (userLoading || isloadProfileData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
  }

  if (!user?.isPublisher) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Publisher Access Required
          </h3>
          <p className="text-muted-foreground mb-4">
            You need to be a publisher to access this page.
          </p>
          <Button asChild>
            <Link href="/campaigns">Explore Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Failed to load profile data
          </h3>
          <Button onClick={loadProfileData}>Retry</Button>
        </div>
      </div>
    );
  }

  const hasBankAccount =
    profileData.account.bankName &&
    profileData.account.accountNumber &&
    profileData.account.accountName;

  return (
    <div className="container  px-4 pb-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/publisher" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your publisher profile and bank account details.
            </p>
            {!isProfileComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Profile Incomplete
                    </p>
                    <p className="text-sm text-amber-700">
                      Complete your demographic information to enable
                      withdrawals
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    loadProfileData();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {!profileData.profile?.verified && (
          <p className="text-red-400 text-sm">
            <div className="flex items-center  gap-4">
              <p className="text-red-500 ">
                You need to verify your phone number to withdraw funds
              </p>
              <button
                onClick={() => setOpenVerify(true)}
                className="text-sm bg-primary rounded-lg p-2 text-white"
              >
                Verify Phone Number
              </button>
            </div>

            <VerifyPhoneModal
              open={openVerify}
              onClose={() => setOpenVerify(false)}
              phone={profileData.profile?.phone}
            />
          </p>
        )}
      </div>

      <div className=" lg:flex gap-8">
        {/* Left Column - Profile Information */}
        <div className="flex-[0.6] space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic profile information and account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Username
                  </Label>
                  <p className="font-medium mt-1">
                    {user.username || "Not set"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Member Since
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatDate(profileData.profile.memberSince)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Account Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        profileData.profile.verified ? "default" : "secondary"
                      }
                    >
                      {profileData.profile.verified
                        ? "Verified"
                        : "Pending Verification"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demographic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Demographic Information
              </CardTitle>
              <CardDescription>
                Required information for advertisers to understand your audience
                profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-1">
                    Age <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="e.g., 25"
                    min="18"
                    max="100"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-1">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="e.g., Lagos, Nigeria"
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="occupation"
                    className="flex items-center gap-1"
                  >
                    Occupation <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) =>
                        handleInputChange("occupation", e.target.value)
                      }
                      placeholder="e.g., Software Developer, Student"
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {!isEditing && !isProfileComplete && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Profile Incomplete
                      </p>
                      <p className="text-sm text-red-700">
                        You must complete all demographic fields to enable
                        withdrawals.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && isProfileComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Profile Complete
                      </p>
                      <p className="text-sm text-green-700">
                        Your demographic information is complete. You can now
                        make withdrawals.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Add your bank account details to receive payments. This
                information is secure and encrypted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) =>
                      handleInputChange("bankName", e.target.value)
                    }
                    placeholder="e.g., GTBank, Zenith Bank"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "accountNumber",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="10-digit account number"
                    maxLength={10}
                    disabled={!isEditing}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      handleInputChange("accountName", e.target.value)
                    }
                    placeholder="Name as it appears on your bank account"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Account Verification Status */}
              {hasBankAccount && (
                <div
                  className={`border rounded-lg p-4 ${
                    profileData.account.isVerified
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {profileData.account.isVerified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          profileData.account.isVerified
                            ? "text-green-800"
                            : "text-amber-800"
                        }`}
                      >
                        {profileData.account.isVerified
                          ? "Account Verified"
                          : "Account Pending Verification"}
                      </p>
                      <p
                        className={`text-sm ${
                          profileData.account.isVerified
                            ? "text-green-700"
                            : "text-amber-700"
                        }`}
                      >
                        {profileData.account.isVerified
                          ? "Your bank account has been verified and is ready for withdrawals."
                          : "Your bank account is being verified. This usually takes 24-48 hours."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!hasBankAccount && !isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        No Bank Account Added
                      </p>
                      <p className="text-sm text-blue-700">
                        Add your bank account details to receive payments from
                        your campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Summary & Security */}
        <div className="flex-[0.4] space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Available Balance
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(profileData.account.availableBalance)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Pending Balance
                  </span>
                  <span className="font-medium text-yellow-600">
                    {formatCurrency(profileData.account.pendingBalance)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Earnings
                  </span>
                  <span className="font-medium">
                    {formatCurrency(profileData.account.totalEarnings)}
                  </span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full"
                disabled={!isProfileComplete || !hasBankAccount}
              >
                <Link href="/dashboard/publisher/withdraw">
                  {!isProfileComplete
                    ? "Complete Profile to Withdraw"
                    : "Withdraw Funds"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Completion Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Withdrawal Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {isProfileComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Demographic Information</span>
              </div>
              <div className="flex items-center gap-2">
                {hasBankAccount ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Bank Account Added</span>
              </div>
              <div className="flex items-center gap-2">
                {profileData.account.availableBalance >= 3000 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Minimum Balance (₦3,000)</span>
              </div>
              <div className="flex items-center gap-2">
                {profileData.profile?.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Account Verified</span>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password securely.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={changePasswordData.currentPassword || ""}
                    onChange={(e) =>
                      setChangePasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={changePasswordData.newPassword || ""}
                    onChange={(e) =>
                      setChangePasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={changePasswordData.confirmPassword || ""}
                    onChange={(e) =>
                      setChangePasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Password strength guide */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Your new password must contain:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One number</li>
                </ul>
              </div>

              {/* SAVE PASSWORD BUTTON */}
              <Button
                className="mt-2 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
                onClick={async () => {
                  // Validate fields
                  if (
                    !changePasswordData.currentPassword ||
                    !changePasswordData.newPassword
                  ) {
                    return toast({
                      title: "Missing Fields",
                      description: "All password fields are required.",
                      variant: "destructive",
                    });
                  }

                  if (
                    changePasswordData.newPassword !==
                    changePasswordData.confirmPassword
                  ) {
                    return toast({
                      title: "Password Mismatch",
                      description: "New passwords do not match.",
                      variant: "destructive",
                    });
                  }

                  // Password rules
                  const strongPassword =
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

                  if (!strongPassword.test(changePasswordData.newPassword)) {
                    return toast({
                      title: "Weak Password",
                      description:
                        "Password must include uppercase, number, and special character.",
                      variant: "destructive",
                    });
                  }

                  setIsSubmitting(true);
                  try {
                    const token = localStorage.getItem("auth-token");

                    const response = await fetch(
                      `${BASE_URL}/auth/change-password`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                        },
                        credentials: "include",
                        body: JSON.stringify({
                          currentPassword: changePasswordData.currentPassword,
                          newPassword: changePasswordData.newPassword,
                        }),
                      }
                    );

                    if (!response.ok) {
                      const err = await response.json();
                      throw new Error(err.error || "Failed to change password");
                    }

                    toast({
                      title: "Success!",
                      description: "Your password has been updated.",
                    });

                    // Reset fields
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    }));

                    setIsEditing(false);
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.message,
                      variant: "destructive",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? "Saving..." : "Save Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Need Help?
                  </p>
                  <p className="text-xs text-blue-700 mb-2">
                    Contact support for profile or payment issues
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700"
                  >
                    <a href="mailto:support@Seltra.com">Contact Support</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
