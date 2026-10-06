// app/dashboard/advertiser/campaigns/completed/page.tsx
"use client";

import { mockPublisherCampaigns } from "@/lib/mock-data";
import { PublisherCampaignCard } from "@/components/publisher-campaign-card";
import { CheckCircle } from "lucide-react";

interface Campaign {
  id: string;
  status: string;
  title?: string;
  description?: string;
  campaign?: any;
  views?: number;
  earnings?: number;
  acceptedAt?: string;
}

export default function CompletedCampaignsPage() {
  // Add null checks and filtering
  const completedCampaigns = (mockPublisherCampaigns || [])
    .filter(
      (campaign: Campaign) =>
        campaign?.status === "completed" || campaign?.status === "COMPLETED"
    )
    .map((campaign: Campaign) => ({
      ...campaign,
      // Ensure all required properties exist
      campaign: campaign.campaign || {},
      views: campaign.views || 0,
      earnings: campaign.earnings || 0,
      acceptedAt: campaign.acceptedAt || new Date().toISOString(),
    }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
          Completed Campaigns
        </h1>
        <p className="text-muted-foreground">
          View your successfully completed campaigns and their performance.
        </p>
      </div>

      <div className="space-y-6">
        {completedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <CheckCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No completed campaigns yet
            </h3>
            <p className="text-muted-foreground">
              Complete your active campaigns to see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {completedCampaigns.map((publisherCampaign: Campaign) => (
              <PublisherCampaignCard
                key={publisherCampaign.id}
                publisherCampaign={publisherCampaign}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
