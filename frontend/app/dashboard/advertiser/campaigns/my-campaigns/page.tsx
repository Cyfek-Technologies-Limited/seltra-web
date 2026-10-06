// app/dashboard/my-campaigns/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/hooks/useCampaigns";
import { PublisherCampaignCard } from "@/components/publisher-campaign-card";
import { CampaignStatusFilter } from "@/components/campaign-status-filter";

import { Button } from "@/components/ui/button";

import { AdvertiserCampaignCard } from "@/components/advertiser-campaign-card";
import { EmptyState, Roller } from "@/components/ui/ReusableComponents";
import { useRouter } from "next/navigation";

export default function MyCampaignsPage() {
  const { user, userLoading } = useAuth();
  const { isLoading, campaigns, campaignLoading } = useCampaigns();
  const filteredCampaigns = campaigns?.filter(
    (item) => item.user.id === user?.id
  );
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"advertiser" | "publisher">(
    "advertiser"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container  px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Please log in to view campaigns
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-4 py-8 max-w-7xl">
      <div className="flex justify-between">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Campaigns
          </h1>
          <p className="text-muted-foreground">
            {user?.isAdvertiser && user?.isPublisher
              ? "Manage your advertising campaigns and track your publishing activities."
              : user?.isAdvertiser
              ? "Manage and track your advertising campaigns."
              : "Track your accepted campaigns, upload proof, and monitor your progress."}
          </p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/advertiser/campaigns/create")}
          className="bg-gradient-to-r from-primary to-accent lg:ml-4 mt-5 lg:mt-0"
        >
          Create New Campaign
        </Button>
      </div>

      {/* Create Campaign Button for Advertisers */}
      {user.isAdvertiser && (
        <div className="mb-6 lg:flex  justify-between items-center"></div>
      )}

      {/* Campaign List */}
      <div className="space-y-6">
        {campaignLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse border rounded-lg shadow-sm overflow-hidden bg-white"
              >
                {/* Header */}
                <div className="p-4 border-b space-y-3">
                  <div className="h-5 w-3/5 bg-gray-200 rounded-md" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded-md" />
                </div>

                {/* Image Placeholder */}
                <div className="h-[220px] bg-gray-200" />

                {/* Stats / Info */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-1/2 bg-gray-200 rounded-md" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded-md" />
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="h-3 w-16 bg-gray-200 rounded-md" />
                      <div className="h-3 w-10 bg-gray-200 rounded-md" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full w-full" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-24 bg-gray-200 rounded-md"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCampaigns?.length === 0 ? (
          <EmptyState
            title="Campaigns"
            text={
              user.isPublisher
                ? "You haven`t accepted any campaigns yet. Browse available campaigns to get started."
                : "You haven't created any campaigns yet. Start your first campaign to reach your audience."
            }
          />
        ) : (
          <div className="lg:grid grid-cols-2 gap-6">
            {filteredCampaigns?.map((campaign) => (
              <AdvertiserCampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
