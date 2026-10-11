"use client";

import { Suspense, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  MapPin,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AudienceStep,
  BusinessStep,
  DetailsStep,
  GoalsStep,
  OnboardingRole,
  RoleStep,
  isValidPhone,
} from "@/components/onboarding/GoogleOnboardingSteps";

interface OnboardingData {
  age: string;
  gender: string;
  location: string;
  occupation: string;
}

interface GoogleSignupData {
  role: OnboardingRole | null;
  agreeToTerms: boolean;
  fullName: string;
  phone: string;
  companyName: string;
  industry: string;
  targetAudience: string[];
  audienceNotes: string;
  campaignGoal: string;
  monthlyBudget: string;
  targetLocations: string;
}

type StepKey =
  | "welcome"
  | "role"
  | "details"
  | "personal"
  | "location"
  | "occupation"
  | "business"
  | "audience"
  | "goals";

const genderOptions = [
  { id: "female", label: "Female", emoji: "👩" },
  { id: "male", label: "Male", emoji: "👨" },
  { id: "non-binary", label: "Non-binary", emoji: "🌈" },
  { id: "prefer-not-to-say", label: "Prefer not to say", emoji: "🤝" },
];

const occupationSuggestions = [
  "Student",
  "Founder",
  "Freelancer",
  "Designer",
  "Software Developer",
  "Marketer",
  "Sales",
  "Retailer",
  "Business Owner",
  "Content Creator",
  "Real Estate Agent",
  "Other",
];

const stepContent: Record<
  StepKey,
  {
    title: string;
    description: string;
    sideEmoji: string;
    sideTitle: string;
    sideText: string;
  }
> = {
  welcome: {
    title: "Welcome to Seltra",
    description:
      "   Hey 👋, welcome to Seltra. We just want to get a couple more details to make your experience better.",
    sideEmoji: "👋",
    sideTitle: "A better start",
    sideText:
      "A short onboarding flow helps us tailor Seltra to each new user from day one.",
  },
  role: {
    title: "How do you want to use Seltra?",
    description:
      "Hey 👋, welcome to Seltra. Choose your account type to get started.",
    sideEmoji: "👋",
    sideTitle: "A better start",
    sideText:
      "Publishers earn by sharing ads on their social media. Advertisers get their business seen by thousands.",
  },
  details: {
    title: "Your contact details",
    description: "Tell us your name and the WhatsApp number we can reach you on.",
    sideEmoji: "🪪",
    sideTitle: "Stay in the loop",
    sideText:
      "We use your WhatsApp line for payouts, campaign updates, and important account notices.",
  },
  personal: {
    title: "Tell us about yourself",
    description:
      "A few personal details help us shape recommendations and messaging for you.",
    sideEmoji: "🧑",
    sideTitle: "Personalized setup",
    sideText:
      "We use these basics to make the product feel more relevant and less generic.",
  },
  location: {
    title: "Where are you based?",
    description:
      "Enter your Location Below. You can enter city, state, or country in the format that feels natural to you",
    sideEmoji: "📍",
    sideTitle: "Context matters",
    sideText:
      "Location can improve onboarding, regional recommendations, and communication.",
  },
  occupation: {
    title: "What do you do for a living?",
    description: "Type in your occupation or select from the options below",
    sideEmoji: "💼",
    sideTitle: "Relevant from day one",
    sideText:
      "Knowing what users do helps shape onboarding paths, tips, and suggested actions.",
  },
  business: {
    title: "Tell us about your business",
    description: "Let us know which brand you are advertising and its industry.",
    sideEmoji: "🏢",
    sideTitle: "Your brand, amplified",
    sideText:
      "Knowing your business helps us match your campaigns with the right publishers.",
  },
  audience: {
    title: "Who is your target audience?",
    description: "Select the kinds of people you want your ads to reach.",
    sideEmoji: "🎯",
    sideTitle: "Reach the right people",
    sideText:
      "Your audience helps us put your campaigns in front of people most likely to care.",
  },
  goals: {
    title: "What are you hoping to achieve?",
    description: "A few quick questions so we can plan the right campaigns for you.",
    sideEmoji: "🚀",
    sideTitle: "Campaigns that fit",
    sideText:
      "Your goals and budget help us recommend campaign sizes and publishers that deliver results.",
  },
};

const PUBLISHER_STEPS: StepKey[] = ["details", "personal", "location", "occupation"];
const ADVERTISER_STEPS: StepKey[] = ["details", "business", "audience", "goals"];

const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.25 },
};

const Onboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow");
  const isGoogleFlow = flow === "google";
  const isEmailFlow = flow === "email";
  const needsRoleSelection = isGoogleFlow || isEmailFlow;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    age: "",
    gender: "",
    location: "",
    occupation: "",
  });
  const [googleData, setGoogleData] = useState<GoogleSignupData>({
    role: null,
    agreeToTerms: false,
    fullName: "",
    phone: "",
    companyName: "",
    industry: "",
    targetAudience: [],
    audienceNotes: "",
    campaignGoal: "",
    monthlyBudget: "",
    targetLocations: "",
  });

  const steps = useMemo<StepKey[]>(() => {
    // Existing publishers without a flow param only fill in their profile.
    if (!needsRoleSelection) {
      return ["welcome", "personal", "location", "occupation"];
    }
    const roleSteps =
      googleData.role === "advertiser"
        ? ADVERTISER_STEPS
        : googleData.role === "publisher"
        ? PUBLISHER_STEPS
        : [];
    return ["role", ...roleSteps];
  }, [needsRoleSelection, googleData.role]);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex] ?? steps[0];
  const isLastStep = stepIndex === totalSteps - 1 && currentStep !== "role";

  const ageError = useMemo(() => {
    if (!data.age) return "";
    const age = Number(data.age);
    if (!Number.isFinite(age) || age < 13 || age > 120) {
      return "Please enter a valid age between 13 and 120.";
    }
    return "";
  }, [data.age]);

  const canProceed = () => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "role":
        return googleData.role !== null && googleData.agreeToTerms;
      case "details":
        return (
          googleData.fullName.trim().length >= 2 &&
          isValidPhone(googleData.phone)
        );
      case "personal":
        return data.age.trim() !== "" && !ageError && data.gender !== "";
      case "location":
        return data.location.trim().length > 1;
      case "occupation":
        return data.occupation.trim().length > 1;
      case "business":
        return (
          googleData.companyName.trim().length > 1 &&
          googleData.industry.trim().length > 1
        );
      case "audience":
        return googleData.targetAudience.length > 0;
      case "goals":
        return googleData.campaignGoal !== "" && googleData.monthlyBudget !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed() || isLastStep) return;

    if (currentStep === "role" && !googleData.fullName) {
      const suggested = sessionStorage.getItem("google_onboarding_username");
      if (suggested) {
        setGoogleData((prev) => ({ ...prev, fullName: suggested }));
      }
    }
    setStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth token from localStorage for iPhone compatibility
    const token = localStorage.getItem("auth-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const submitPublisherOnboarding = async () => {
    const payload = {
      age: Number(data.age),
      gender: data.gender,
      location: data.location.trim(),
      occupation: data.occupation.trim(),
    };

    const response = await fetch(`${BASE_URL}/publisher/onboarding`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.status !== 200) {
      throw new Error(result.error || "Failed to update publisher profile");
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);

    try {
      await submitPublisherOnboarding();
      router.push("/dashboard/publisher");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSignupSubmit = async () => {
    if (!canProceed() || !googleData.role) return;

    setIsSubmitting(true);

    try {
      const referralCode = isGoogleFlow
        ? sessionStorage.getItem("pending_referral_code")
        : null;

      const completeResponse = await fetch(
        isGoogleFlow
          ? `${BASE_URL}/auth/google/complete-signup`
          : `${BASE_URL}/auth/complete-signup`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({
            role: googleData.role,
            acceptedTerms: googleData.agreeToTerms,
            username: googleData.fullName.trim(),
            phone: googleData.phone.trim(),
            ...(referralCode ? { referralCode } : {}),
          }),
        }
      );
      const completeResult = await completeResponse.json();

      if (completeResponse.status !== 200) {
        throw new Error(
          completeResult.error || "Failed to complete your account setup"
        );
      }

      // Role changed, so pick up the refreshed token if one was issued.
      if (completeResult.token) {
        localStorage.setItem("auth-token", completeResult.token);
      }
      localStorage.removeItem("cached_user");

      if (googleData.role === "publisher") {
        await submitPublisherOnboarding();
      } else {
        const advertiserResponse = await fetch(
          `${BASE_URL}/advertiser/onboarding`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify({
              companyName: googleData.companyName.trim(),
              industry: googleData.industry.trim(),
              targetAudience: googleData.targetAudience,
              audienceNotes: googleData.audienceNotes.trim(),
              campaignGoal: googleData.campaignGoal,
              monthlyBudget: googleData.monthlyBudget,
              targetLocations: googleData.targetLocations.trim(),
            }),
          }
        );
        const advertiserResult = await advertiserResponse.json();

        if (advertiserResponse.status !== 200) {
          throw new Error(
            advertiserResult.error || "Failed to update advertiser profile"
          );
        }
      }

      sessionStorage.removeItem("pending_referral_code");
      sessionStorage.removeItem("google_onboarding_username");

      window.location.href =
        googleData.role === "publisher"
          ? "/dashboard/publisher"
          : "/dashboard/advertiser";
    } catch (error) {
      console.error("Onboarding error:", error);
      alert((error as Error).message);
      setIsSubmitting(false);
    }
  };

  const renderStepBody = () => {
    switch (currentStep) {
      case "welcome":
        return <div className="space-y-4" />;

      case "role":
        return (
          <RoleStep
            role={googleData.role}
            onRoleChange={(role) =>
              setGoogleData((prev) => ({ ...prev, role }))
            }
            agreeToTerms={googleData.agreeToTerms}
            onAgreeToTermsChange={(agreeToTerms) =>
              setGoogleData((prev) => ({ ...prev, agreeToTerms }))
            }
          />
        );

      case "details":
        return (
          <DetailsStep
            fullName={googleData.fullName}
            phone={googleData.phone}
            onChange={(field, value) =>
              setGoogleData((prev) => ({ ...prev, [field]: value }))
            }
          />
        );

      case "personal":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                inputMode="numeric"
                placeholder="e.g 28"
                value={data.age}
                onChange={(e) =>
                  setData({
                    ...data,
                    age: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                className="mt-1.5 h-12"
              />
              {ageError && (
                <p className="text-sm text-destructive mt-2">{ageError}</p>
              )}
            </div>

            <div>
              <Label className="mb-3 block">Gender</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {genderOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setData({ ...data, gender: option.id })}
                    className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      data.gender === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-medium text-foreground">
                      {option.label}
                    </span>
                    {data.gender === option.id && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative mt-1.5">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g Chevron, Lekki Lagos, Nigeria"
                  value={data.location}
                  onChange={(e) =>
                    setData({ ...data, location: e.target.value })
                  }
                  className="h-12 pl-10"
                />
              </div>
            </div>
          </div>
        );

      case "occupation":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <div className="relative mt-1.5">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="occupation"
                  type="text"
                  placeholder="e.g I work in oil and gas"
                  value={data.occupation}
                  onChange={(e) =>
                    setData({ ...data, occupation: e.target.value })
                  }
                  className="h-12 pl-10"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Quick picks</p>
              <div className="flex flex-wrap gap-2">
                {occupationSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setData({ ...data, occupation: item })}
                    className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                      data.occupation === item
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground font-medium">
                Collected data preview
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Age:</span>{" "}
                  {data.age || "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Gender:</span>{" "}
                  {data.gender || "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Location:
                  </span>{" "}
                  {data.location || "—"}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium text-foreground">
                    Occupation:
                  </span>{" "}
                  {data.occupation || "—"}
                </div>
              </div>
            </div>
          </div>
        );

      case "business":
        return (
          <BusinessStep
            companyName={googleData.companyName}
            industry={googleData.industry}
            onChange={(field, value) =>
              setGoogleData((prev) => ({ ...prev, [field]: value }))
            }
          />
        );

      case "audience":
        return (
          <AudienceStep
            targetAudience={googleData.targetAudience}
            audienceNotes={googleData.audienceNotes}
            onToggleAudience={(value) =>
              setGoogleData((prev) => ({
                ...prev,
                targetAudience: prev.targetAudience.includes(value)
                  ? prev.targetAudience.filter((item) => item !== value)
                  : [...prev.targetAudience, value],
              }))
            }
            onNotesChange={(audienceNotes) =>
              setGoogleData((prev) => ({ ...prev, audienceNotes }))
            }
          />
        );

      case "goals":
        return (
          <GoalsStep
            campaignGoal={googleData.campaignGoal}
            monthlyBudget={googleData.monthlyBudget}
            targetLocations={googleData.targetLocations}
            onChange={(field, value) =>
              setGoogleData((prev) => ({ ...prev, [field]: value }))
            }
          />
        );

      default:
        return null;
    }
  };

  const content = stepContent[currentStep];

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col">
        <header className="p-6 flex items-center justify-between border-b border-border">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-semibold text-lg text-foreground">
              Seltra
            </span>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= stepIndex ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} {...stepMotion}>
                <div className="mb-8">
                  <p className="text-sm text-primary font-medium mb-2">
                    {needsRoleSelection && !googleData.role
                      ? "Getting started"
                      : `Step ${stepIndex + 1} of ${totalSteps}`}
                  </p>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {content.title}
                  </h1>
                  <p className="text-muted-foreground">{content.description}</p>
                </div>

                {renderStepBody()}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={stepIndex === 0 || isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={
                    needsRoleSelection ? handleRoleSignupSubmit : handleSubmit
                  }
                  disabled={!canProceed() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Finish onboarding
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-[44%] bg-gradient-to-br from-primary to-primary/70 text-primary-foreground items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-16 right-10 w-56 h-56 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-6xl mb-6">{content.sideEmoji}</div>
            <h2 className="text-2xl font-bold mb-4">{content.sideTitle}</h2>
            <p className="text-primary-foreground/80 leading-7">
              {content.sideText}
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3 text-left">
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <User className="w-5 h-5 mb-2" />
                <p className="text-sm text-primary-foreground/80">Identity</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <MapPin className="w-5 h-5 mb-2" />
                <p className="text-sm text-primary-foreground/80">Location</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <Users className="w-5 h-5 mb-2" />
                <p className="text-sm text-primary-foreground/80">Persona</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Onboarding />
    </Suspense>
  );
}
