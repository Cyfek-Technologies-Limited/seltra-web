"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

interface OnboardingData {
  age: string;
  gender: string;
  location: string;
  occupation: string;
}

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

const stepContent = {
  1: {
    eyebrow: "Step 1 of 4",
    title: "Welcome to Seltra",
    description:
      "   Hey 👋, welcome to Seltra. We just want to get a couple more details to make your experience better.",
    sideEmoji: "👋",
    sideTitle: "A better start",
    sideText:
      "A short onboarding flow helps us tailor Seltra to each new user from day one.",
  },
  2: {
    eyebrow: "Step 2 of 4",
    title: "Tell us about yourself",
    description:
      "A few personal details help us shape recommendations and messaging for you.",
    sideEmoji: "🧑",
    sideTitle: "Personalized setup",
    sideText:
      "We use these basics to make the product feel more relevant and less generic.",
  },
  3: {
    eyebrow: "Step 3 of 4",
    title: "Where are you based?",
    description:
      "Enter your Location Below. You can enter city, state, or country in the format that feels natural to you",
    sideEmoji: "📍",
    sideTitle: "Context matters",
    sideText:
      "Location can improve onboarding, regional recommendations, and communication.",
  },
  4: {
    eyebrow: "Step 4 of 4",
    title: "What do you do for a living?",
    description: "Type in your occupation or select from the options below",
    sideEmoji: "💼",
    sideTitle: "Relevant from day one",
    sideText:
      "Knowing what users do helps shape onboarding paths, tips, and suggested actions.",
  },
} as const;

const Onboarding = () => {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    age: "",
    gender: "",
    location: "",
    occupation: "",
  });

  const totalSteps = 4;

  const ageError = useMemo(() => {
    if (!data.age) return "";
    const age = Number(data.age);
    if (!Number.isFinite(age) || age < 13 || age > 120) {
      return "Please enter a valid age between 13 and 120.";
    }
    return "";
  }, [data.age]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return data.age.trim() !== "" && !ageError && data.gender !== "";
      case 3:
        return data.location.trim().length > 1;
      case 4:
        return data.occupation.trim().length > 1;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps && canProceed()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        age: Number(data.age),
        gender: data.gender,
        location: data.location.trim(),
        occupation: data.occupation.trim(),
      };

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/publisher/onboarding`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 200) {
        router.push("/dashboard/publisher");
        return;
      }

      throw new Error(result.error || "Failed to update publisher profile");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  index <= step - 1 ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <p className="text-sm text-primary font-medium mb-2">
                      {stepContent[1].eyebrow}
                    </p>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {stepContent[1].title}
                    </h1>
                    <p className="text-muted-foreground">
                      {stepContent[1].description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* <div className="rounded-2xl border border-border bg-muted/40 p-5">
                      <p className="text-sm text-muted-foreground mb-2">
                        Welcome message
                      </p>
                      <p className="text-base font-medium text-foreground leading-7">
                        Hey, welcome to Seltra. We just want to get a couple
                        more details to make your experience better.
                      </p>
                    </div> */}

                    {/* <div className="rounded-2xl border border-border p-4 bg-background">
                      <p className="text-sm text-muted-foreground">
                        This will only take a minute.
                      </p>
                    </div> */}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <p className="text-sm text-primary font-medium mb-2">
                      {stepContent[2].eyebrow}
                    </p>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {stepContent[2].title}
                    </h1>
                    <p className="text-muted-foreground">
                      {stepContent[2].description}
                    </p>
                  </div>

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
                        <p className="text-sm text-destructive mt-2">
                          {ageError}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-3 block">Gender</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {genderOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setData({ ...data, gender: option.id })
                            }
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
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <p className="text-sm text-primary font-medium mb-2">
                      {stepContent[3].eyebrow}
                    </p>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {stepContent[3].title}
                    </h1>
                    <p className="text-muted-foreground">
                      {stepContent[3].description}
                    </p>
                  </div>

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

                    {/* <div className="rounded-2xl border border-border p-4 bg-background">
                      <p className="text-sm text-muted-foreground">
                        Tip: You can enter city, state, or country in the format
                        that feels natural to you.
                      </p>
                    </div> */}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <p className="text-sm text-primary font-medium mb-2">
                      {stepContent[4].eyebrow}
                    </p>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {stepContent[4].title}
                    </h1>
                    <p className="text-muted-foreground">
                      {stepContent[4].description}
                    </p>
                  </div>

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
                      <p className="text-sm text-muted-foreground mb-3">
                        Quick picks
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {occupationSuggestions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              setData({ ...data, occupation: item })
                            }
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
                          <span className="font-medium text-foreground">
                            Age:
                          </span>{" "}
                          {data.age || "—"}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Gender:
                          </span>{" "}
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {step < totalSteps ? (
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
                  onClick={handleSubmit}
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
            key={step}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-6xl mb-6">
              {stepContent[step as 1 | 2 | 3 | 4].sideEmoji}
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {stepContent[step as 1 | 2 | 3 | 4].sideTitle}
            </h2>
            <p className="text-primary-foreground/80 leading-7">
              {stepContent[step as 1 | 2 | 3 | 4].sideText}
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

export default Onboarding;
