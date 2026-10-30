"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Mail, Save, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";
import { toast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const CAMPAIGN_GOALS = [
  "Brand awareness",
  "More sales",
  "Website or app visits",
  "Walk-in customers",
  "Promote an event",
  "Grow social followers",
];
const MONTHLY_BUDGETS = [
  "Under ₦50,000",
  "₦50,000 - ₦200,000",
  "₦200,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "Over ₦1,000,000",
  "Not sure yet",
];

type Profile = {
  email: string;
  username: string | null;
  phone: string | null;
  createdAt: string;
  advertiserProfile: {
    companyName: string;
    industry: string;
    targetAudience: string[];
    audienceNotes: string | null;
    campaignGoal: string;
    monthlyBudget: string;
    targetLocations: string | null;
  } | null;
};

type ProfileForm = {
  username: string;
  phone: string;
  companyName: string;
  industry: string;
  targetAudience: string;
  audienceNotes: string;
  campaignGoal: string;
  monthlyBudget: string;
  targetLocations: string;
};

const emptyForm: ProfileForm = {
  username: "",
  phone: "",
  companyName: "",
  industry: "",
  targetAudience: "",
  audienceNotes: "",
  campaignGoal: "",
  monthlyBudget: "",
  targetLocations: "",
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdvertiserProfilePage() {
  const { user, userLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userLoading && user?.isAdvertiser) void loadProfile();
    else if (!userLoading) setLoading(false);
  }, [user, userLoading]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/advertiser/profile`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load profile");
      const data: Profile = result.data;
      setProfile(data);
      setForm({
        username: data.username || "",
        phone: data.phone === "No Phone Number" ? "" : data.phone || "",
        companyName: data.advertiserProfile?.companyName || "",
        industry: data.advertiserProfile?.industry || "",
        targetAudience: data.advertiserProfile?.targetAudience.join(", ") || "",
        audienceNotes: data.advertiserProfile?.audienceNotes || "",
        campaignGoal: data.advertiserProfile?.campaignGoal || "",
        monthlyBudget: data.advertiserProfile?.monthlyBudget || "",
        targetLocations: data.advertiserProfile?.targetLocations || "",
      });
    } catch (error) {
      toast({
        title: "Profile unavailable",
        description: error instanceof Error ? error.message : "Could not load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/advertiser/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: form.username.trim() || null,
          phone: form.phone.trim() || null,
          ...(profile?.advertiserProfile
            ? {
                companyName: form.companyName,
                industry: form.industry,
                targetAudience: form.targetAudience
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                audienceNotes: form.audienceNotes || null,
                campaignGoal: form.campaignGoal,
                monthlyBudget: form.monthlyBudget,
                targetLocations: form.targetLocations || null,
              }
            : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save profile");
      setProfile(result.data);
      toast({ title: "Profile saved", description: "Your profile details were updated." });
    } catch (error) {
      toast({
        title: "Could not save profile",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || userLoading) {
    return <div className="p-8 text-slate-600">Loading profile…</div>;
  }

  if (!user?.isAdvertiser) {
    return <div className="p-8 text-slate-600">Advertiser access required.</div>;
  }

  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
  const budgetOptions = [
    ...(form.monthlyBudget && !MONTHLY_BUDGETS.includes(form.monthlyBudget)
      ? [form.monthlyBudget]
      : []),
    ...MONTHLY_BUDGETS,
  ];

  return (
    <main className="mx-auto max-w-4xl p-4 text-slate-900 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your account and business details.</p>
      </div>

      <form onSubmit={saveProfile} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold"><UserRound size={18} /> Personal information</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Username</span>
              <input className={inputClass} value={form.username} onChange={(e) => updateField("username", e.target.value)} maxLength={50} />
            </label>
            <label>
              <span className={labelClass}>Phone number</span>
              <input className={inputClass} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} maxLength={30} />
            </label>
            <div>
              <span className={labelClass}>Email address</span>
              <div className={`${inputClass} flex items-center gap-2 bg-slate-50 text-slate-500`}><Mail size={16} />{profile?.email || user.email}</div>
              <p className="mt-1 text-xs text-slate-500">Email address cannot be changed.</p>
            </div>
            <div>
              <span className={labelClass}>Member since</span>
              <div className={`${inputClass} flex items-center gap-2 bg-slate-50 text-slate-500`}><CalendarDays size={16} />{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</div>
            </div>
          </div>
        </section>

        {profile?.advertiserProfile ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 font-semibold">Business and campaign preferences</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label><span className={labelClass}>Company name</span><input required className={inputClass} value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} maxLength={100} /></label>
              <label><span className={labelClass}>Industry</span><input required className={inputClass} value={form.industry} onChange={(e) => updateField("industry", e.target.value)} maxLength={100} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>Target audience <span className="font-normal text-slate-500">(separate with commas)</span></span><input className={inputClass} value={form.targetAudience} onChange={(e) => updateField("targetAudience", e.target.value)} /></label>
              <label><span className={labelClass}>Campaign goal</span><select required className={inputClass} value={form.campaignGoal} onChange={(e) => updateField("campaignGoal", e.target.value)}><option value="">Select a goal</option>{CAMPAIGN_GOALS.map((goal) => <option key={goal} value={goal} className="bg-white text-slate-900">{goal}</option>)}</select></label>
              <label><span className={labelClass}>Monthly budget</span><select required className={inputClass} value={form.monthlyBudget} onChange={(e) => updateField("monthlyBudget", e.target.value)}><option value="">Select a budget</option>{budgetOptions.map((budget) => <option key={budget} value={budget} className="bg-white text-slate-900">{budget}</option>)}</select></label>
              <label><span className={labelClass}>Target locations</span><input className={inputClass} value={form.targetLocations} onChange={(e) => updateField("targetLocations", e.target.value)} maxLength={200} /></label>
              <label><span className={labelClass}>Audience notes</span><input className={inputClass} value={form.audienceNotes} onChange={(e) => updateField("audienceNotes", e.target.value)} maxLength={500} /></label>
            </div>
          </section>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Business details are not available yet. Complete advertiser onboarding to add them here.</p>
        )}

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600 disabled:opacity-60">
          <Save size={17} />{saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <DeleteAccountSection />
    </main>
  );
}
