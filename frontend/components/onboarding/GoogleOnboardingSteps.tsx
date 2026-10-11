"use client";

import Link from "next/link";
import { Building2, Check, MapPin, Megaphone, Phone, User, Users } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type OnboardingRole = "publisher" | "advertiser";

const roleOptions: {
  id: OnboardingRole;
  title: string;
  description: string;
  icon: typeof Users;
  iconWrapClass: string;
  iconClass: string;
}[] = [
  {
    id: "publisher",
    title: "Become a Publisher",
    description:
      "Earn money by displaying ads on your social media. Perfect for content creators and all social media users.",
    icon: Users,
    iconWrapClass: "bg-blue-100",
    iconClass: "text-blue-600",
  },
  {
    id: "advertiser",
    title: "Become an Advertiser",
    description:
      "Upload your business flyer or video, and thousands of Nigerians share it on their personal social media accounts.",
    icon: Megaphone,
    iconWrapClass: "bg-green-100",
    iconClass: "text-green-600",
  },
];

export function RoleStep({
  role,
  onRoleChange,
  agreeToTerms,
  onAgreeToTermsChange,
}: {
  role: OnboardingRole | null;
  onRoleChange: (role: OnboardingRole) => void;
  agreeToTerms: boolean;
  onAgreeToTermsChange: (value: boolean) => void;
}) {
  const termsLink =
    role === "advertiser" ? "/legal/terms-advertiser" : "/legal/terms-publisher";

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label="Account type" className="flex flex-col gap-3">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const selected = role === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onRoleChange(option.id)}
              className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <span className={`shrink-0 rounded-lg p-3 ${option.iconWrapClass}`}>
                <Icon className={`h-5 w-5 ${option.iconClass}`} />
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <span className="font-semibold text-foreground">{option.title}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {selected && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {role && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => onAgreeToTermsChange(checked === true)}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-5">
            I agree to the{" "}
            <Link href={termsLink} className="font-medium text-primary underline" target="_blank">
              {role === "publisher" ? "Publisher" : "Advertiser"} Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="font-medium text-primary underline" target="_blank">
              Privacy Policy
            </Link>
          </Label>
        </div>
      )}
    </div>
  );
}

export const isValidPhone = (phone: string) =>
  phone.replace(/[^0-9]/g, "").length >= 10;

export function DetailsStep({
  fullName,
  phone,
  onChange,
}: {
  fullName: string;
  phone: string;
  onChange: (field: "fullName" | "phone", value: string) => void;
}) {
  const showPhoneError = phone.trim() !== "" && !isValidPhone(phone);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <div className="relative mt-1.5">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Adaeze Okafor"
            maxLength={80}
            value={fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            className="h-12 pl-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">WhatsApp phone number</Label>
        <div className="relative mt-1.5">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 0803 123 4567"
            maxLength={20}
            value={phone}
            onChange={(e) =>
              onChange("phone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
            aria-invalid={showPhoneError}
            aria-describedby="phone-hint"
            className="h-12 pl-10"
          />
        </div>
        <p
          id="phone-hint"
          className={`mt-2 text-xs ${showPhoneError ? "text-destructive" : "text-muted-foreground"}`}
        >
          {showPhoneError
            ? "Please enter a valid phone number (at least 10 digits)."
            : "Must be a WhatsApp line. We use it for important account updates."}
        </p>
      </div>
    </div>
  );
}

export const industryOptions = [
  "Fashion & Beauty",
  "Food & Drinks",
  "Real Estate",
  "Tech & Software",
  "Education",
  "Health & Fitness",
  "Finance",
  "Events & Entertainment",
  "Retail & E-commerce",
  "Services",
  "Other",
];

export function BusinessStep({
  companyName,
  industry,
  onChange,
}: {
  companyName: string;
  industry: string;
  onChange: (field: "companyName" | "industry", value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="companyName">Company / Brand name</Label>
        <div className="relative mt-1.5">
          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="companyName"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Mama Put Kitchen"
            maxLength={100}
            value={companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
            className="h-12 pl-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          type="text"
          placeholder="Type your industry or pick one below"
          maxLength={100}
          value={industry}
          onChange={(e) => onChange("industry", e.target.value)}
          className="mt-1.5 h-12"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {industryOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange("industry", item)}
              className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                industry === item
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const audienceOptions = [
  "Students",
  "Young professionals",
  "Parents",
  "Business owners",
  "Tech enthusiasts",
  "Fashion & beauty lovers",
  "Foodies",
  "Sports fans",
  "Everyone",
];

export function AudienceStep({
  targetAudience,
  audienceNotes,
  onToggleAudience,
  onNotesChange,
}: {
  targetAudience: string[];
  audienceNotes: string;
  onToggleAudience: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Who are you trying to reach? <span className="text-muted-foreground">(pick at least one)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {audienceOptions.map((item) => {
            const selected = targetAudience.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleAudience(item)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="audienceNotes">Anything else about your audience? (optional)</Label>
        <Textarea
          id="audienceNotes"
          placeholder="e.g. Women aged 20-35 in Lagos and Abuja who love affordable fashion"
          maxLength={500}
          value={audienceNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="mt-1.5 min-h-24"
        />
      </div>
    </div>
  );
}

export const campaignGoalOptions = [
  "Brand awareness",
  "More sales",
  "Website or app visits",
  "Walk-in customers",
  "Promote an event",
  "Grow social followers",
];

export const budgetOptions = [
  "Under ₦50,000",
  "₦50,000 - ₦200,000",
  "₦200,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "Over ₦1,000,000",
  "Not sure yet",
];

function ChoiceChips({
  options,
  value,
  onSelect,
  label,
}: {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((item) => {
        const selected = value === item;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(item)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors ${
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {selected && <Check className="h-3.5 w-3.5" />}
            {item}
          </button>
        );
      })}
    </div>
  );
}

export function GoalsStep({
  campaignGoal,
  monthlyBudget,
  targetLocations,
  onChange,
}: {
  campaignGoal: string;
  monthlyBudget: string;
  targetLocations: string;
  onChange: (
    field: "campaignGoal" | "monthlyBudget" | "targetLocations",
    value: string
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          What is your main goal for advertising?
        </p>
        <ChoiceChips
          label="Main advertising goal"
          options={campaignGoalOptions}
          value={campaignGoal}
          onSelect={(value) => onChange("campaignGoal", value)}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Roughly how much do you plan to spend per month?
        </p>
        <ChoiceChips
          label="Monthly advertising budget"
          options={budgetOptions}
          value={monthlyBudget}
          onSelect={(value) => onChange("monthlyBudget", value)}
        />
      </div>

      <div>
        <Label htmlFor="targetLocations">
          Where are your customers? (optional)
        </Label>
        <div className="relative mt-1.5">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="targetLocations"
            type="text"
            placeholder="e.g. Lagos, Abuja, or nationwide"
            maxLength={200}
            value={targetLocations}
            onChange={(e) => onChange("targetLocations", e.target.value)}
            className="h-12 pl-10"
          />
        </div>
      </div>
    </div>
  );
}
