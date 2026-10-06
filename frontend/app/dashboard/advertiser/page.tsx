"use client";

import Icon from "@/components/ui/Icon";
import { CardContent, CardTitle } from "@/components/ui/card";
import {
  Card,
  EmptyState,
  Roller,
  Spinner,
  StatsCard,
} from "@/components/ui/ReusableComponents";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PromptCards from "@/components/dashboard/PromptCards";
import CampaignCard from "@/components/dashboard/CampaignCard";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import { useCampaigns } from "@/hooks/useCampaigns";

const page = () => {
  const [isActive, setIsActive] = useState("stat");
  const { user, userLoading } = useAuth();
  const { campaigns, campaignLoading } = useCampaigns();
  const filteredCampaigns = campaigns?.filter(
    (item) => item.user.id === user?.id
  );

  const heroContent = {
    title: user?.isAdvertiser
      ? "Boost Your Reach With Targeted Ads"
      : "Earn from social media",
    subtitle: user?.isAdvertiser
      ? "Create ads, monitor performance, and pay only for verified views."
      : "Make money by posting ads on your WhatsApp status",
    cta: user?.isAdvertiser ? "Create Campaign" : "Explore Campaigns",
    icon: Plus,
    Crdient: "bg-gradient-to-r from-secondary  to-primary-hover ",
  };

  // Use actual user stats if available, otherwise fallback to mock data
  const advertiserStats = [
    {
      title: "Active Campaigns",
      subtitle: "Currently running campaigns",
      icon: "/dash/business/pie-chart.svg",
      value: `${user?.stats?.activeCampaigns || "..."}`,
    },
    {
      title: "Total Views",
      subtitle: "All-time campaign Views",
      icon: "/dash/business/task-complete.svg",
      value: `${(user?.stats?.totalViews || "...").toLocaleString()}`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: "/dashboard/advertiser/analytics",
      description: "Track audience reach and engagement",
    },
    {
      title: "Total Campaigns",
      subtitle: "View campaign history",
      route: "/dashboard/advertiser/campaigns/my-campaigns",
      icon: "/dash/business/sub-progress.svg",
      value: `${user?.stats?.totalCampaigns || "..."}`,
    },
    {
      title: "Tutorials",
      subtitle: "Learn how to use Seltra",
      route: "/demo",
      icon: "/dash/student/self-service.svg ",
      value: `${user?.transactions?.length || "..."}`,
    },

    {
      title: "Active Publishers",
      subtitle: "Currently promoting your ads",
      icon: "/dash/business/tools/5.svg",
      value: `${user?.stats?.averagePublishersPerCampaign || "..."}`,
    },
  ];

  return (
    <div className="">
      {/* top - welcome, stats */}
      <div className="mb-[30px] ">
        {/* Hero Banner + Profile */}
        <div className="grid lg:grid-cols-3 gap-7 mb-10">
          {/* Hero Banner */}
          <div className="lg:col-span-2">
            {userLoading ? (
              // 🔹 Loading State
              <Card className="bg-primary min-h-[182px] border-0 animate-pulse rounded-2xl relative overflow-hidden">
                <CardContent className="px-8 py-6">
                  <div className="space-y-4">
                    {/* Animated shimmer lines */}
                    <div className="h-6 w-2/3 bg-gray-300 rounded-md" />
                    <div className="h-4 w-3/4 bg-gray-300 rounded-md" />
                    <div className="h-10 w-40 bg-gray-300 rounded-full mt-4" />
                  </div>

                  {/* Decorative animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10 blur-2xl animate-gradient-x opacity-60" />
                </CardContent>
              </Card>
            ) : (
              // 🔹 Loaded State
              <Card
                className={`bg-primary min-h-[182px] text-primary-foreground border-0 relative overflow-hidden rounded-2xl`}
              >
                <CardContent className="px-8 py-4 relative z-10">
                  <h2 className="text-2xl font-bold mb-2">
                    Boost Your Reach With Targeted Ads
                  </h2>
                  <p className="text-primary-foreground/90 mb-6">
                    Create ads, monitor performance, and pay per view.
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    <Link
                      href={"/dashboard/advertiser/campaigns/create"}
                      className="flex items-center gap-2"
                    >
                      {(() => {
                        const IconComponent = heroContent.icon;
                        return <IconComponent className="w-4 h-4" />;
                      })()}
                      {heroContent.cta}
                    </Link>
                  </Button>
                </CardContent>

                {/* Subtle gradient animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 via-primary/50 to-secondary/30 opacity-40 animate-gradient-x" />
              </Card>
            )}
          </div>

          {/* profile - right Section */}
          <Card className="bg-sidebar hidden lg:block lg:bg-gradient-to-b from-accent to-primary h-[181px]">
            <div className="flex  justify-center py-3 flex-col items-center">
              {/* profile image */}
              <div className="rounded-full  w-[90px] h-[90px] border-[1px] border-accent flex justify-center items-center">
                <Avatar className="h-8 w-8 w-[70px] h-[70px]">
                  <AvatarImage
                    src="/dashboard/avatar.jpg"
                    alt={user?.username || "User"}
                  />
                  <AvatarFallback className="bg-gradient-hero text-3xl text-primary-foreground">
                    {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* welcome & info */}
              <div className="">
                <span className="text-lg font-bold text-black lg:text-sidebar">
                  Welcome{" "}
                  <span className="capitalize text-[14px] font-[500] text-warning">
                    {user?.username || user?.username || "User"}
                  </span>
                </span>
                <p className="text-center text-[14px] font-[500] text-black lg:text-sidebar">
                  {user?.email}
                </p>
                <p className="text-center text-[12px] font-[400] text-black/70 lg:text-sidebar mt-1">
                  {user?.roles?.join(", ")}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* stats */}
        <div className="grid lg:grid-cols-5 grid-cols-2 w-full gap-[12px]">
          {/* stats - card */}
          {advertiserStats.map((item, index) => (
            <StatsCard key={index} item={item} />
          ))}
        </div>
      </div>

      {/* bottom -  */}

      <div className="space-y-[35px]">
        {/* Ongoing campaigns */}
        <div className="space-y-[20px]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-accent">
              Ongoing Campaigns
            </h3>
            <Icon
              style="cursor-pointer hover:rotate-180 transition-transform duration-500"
              src="/dash/business/refresh.svg"
            />
          </div>

          {campaignLoading ? (
            // 🔹 Modern Loading State
            <Card className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-gray-200 p-4 shadow-sm bg-white/60 backdrop-blur-sm"
                  >
                    <div className="h-5 w-2/3 bg-gray-200 rounded-md mb-3" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded-md mb-5" />
                    <div className="h-[160px] w-full bg-gray-200 rounded-md mb-4" />

                    <div className="h-3 w-3/4 bg-gray-200 rounded-md mb-2" />
                    <div className="h-2 w-full bg-gray-200 rounded-md" />
                    <div className="h-2 w-1/2 bg-gray-200 rounded-md mt-2" />

                    <div className="flex justify-between mt-4">
                      <div className="h-8 w-24 bg-gray-200 rounded-md" />
                      <div className="h-8 w-24 bg-gray-200 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtle shimmer gradient animation overlay */}
              {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] rounded-xl" /> */}
            </Card>
          ) : filteredCampaigns?.length === 0 ? (
            <EmptyState
              title="No Campaigns Yet"
              text={
                user?.isAdvertiser
                  ? "You haven’t launched any campaigns yet. Start by creating one now."
                  : "You haven’t accepted any campaigns yet. Start by joining one now."
              }
            />
          ) : (
            <>
              <Card className="p-6">
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all`}
                >
                  {filteredCampaigns?.slice(0, 3).map((campaign, index) => {
                    const progress =
                      (campaign.views / campaign.targetViews) * 100 > 100
                        ? 100
                        : (campaign.views / campaign.targetViews) * 100;

                    return (
                      <CampaignCard
                        key={index}
                        campaign={campaign}
                        progress={progress}
                      />
                    );
                  })}
                </div>
              </Card>

              {filteredCampaigns?.length !== 0 && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="mt-4 w-[200px] font-medium text-white bg-gradient-to-r from-accent to-primary hover:opacity-90 transition"
                  >
                    <Link href="/dashboard/advertiser/campaigns/my-campaigns">
                      View All Campaigns
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contact Support  */}
        <Card className="px-6 mt-10 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center py-3 justify-between gap-6">
            {/* Text Content */}
            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-xl font-semibold text-accent">Need Help?</h3>
              <p className="text-muted-foreground lg:w-[70%]">
                Our support team is always ready to assist you. Whether you’re
                facing an issue, need technical help, or just have a question —
                we’ve got you covered.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-white hover:opacity-90"
                >
                  <a href="mailto:support@Seltra.app">Email Support</a>
                </Button>

                {/* WhatsApp Chat */}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="hover:bg-green-50 border-green-600 text-green-600"
                >
                  <a
                    href="https://wa.me/09165165583"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Icon / Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-green-100 p-6 rounded-full animate-bounce-slow">
                <MessageCircle className="w-20 h-20 text-green-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default page;
