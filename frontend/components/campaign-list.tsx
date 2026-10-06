// components/campaign-list.tsx - UPDATED
"use client";

import { CampaignCard } from "@/components/campaign-card";
import { AcceptCampaignDialog } from "./accept-campaign-dialog";
import { useState, useEffect } from "react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { acceptCampaign } from "@/lib/functions/publishers/claim";

interface CampaignListProps {
  campaigns: Campaign[];
  acceptedCampaignIds?: string[];
}

export function CampaignList({
  campaigns,
  acceptedCampaignIds = [],
}: CampaignListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locallyAcceptedCampaigns, setLocallyAcceptedCampaigns] = useState<
    Set<string>
  >(new Set(acceptedCampaignIds));
  const { campaignLoading } = useCampaigns();
  const { user } = useAuth();

  // Update locally accepted campaigns when prop changes
  useEffect(() => {
    setLocallyAcceptedCampaigns(new Set(acceptedCampaignIds));
  }, [acceptedCampaignIds]);

  const handleAcceptClick = (campaign: any) => {
    if (!user?.isPublisher) {
      toast.error("You need to be a publisher to accept campaigns");
      return;
    }

    // Check if already accepted (either locally or from props)
    if (
      locallyAcceptedCampaigns.has(campaign.id) ||
      acceptedCampaignIds.includes(campaign.id)
    ) {
      toast.error("You have already accepted this campaign");
      return;
    }

    setSelectedCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedCampaign) return;
    setIsLoading(true);

    try {
      const success = await acceptCampaign(selectedCampaign.id);
      if (success) {
        // Add to locally accepted campaigns
        setLocallyAcceptedCampaigns(
          (prev) => new Set([...prev, selectedCampaign.id])
        );
        setIsDialogOpen(false);
        setSelectedCampaign(null);
        toast.success("Campaign accepted successfully!");
      }
    } catch (error) {
      console.error("Failed to accept campaign:", error);
      toast.error("Failed to accept campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCampaign(null);
  };

  // Check if a campaign is accepted
  const isCampaignAccepted = (campaignId: string) => {
    return (
      locallyAcceptedCampaigns.has(campaignId) ||
      acceptedCampaignIds.includes(campaignId)
    );
  };

  // ✅ Modern Loading Skeleton
  if (campaignLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2  xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden"
          >
            <div className="p-4 flex flex-col">
              {/* Category and Status */}
              <div className="flex justify-between mb-3">
                <div className="h-5 w-20 bg-gray-200 rounded-md" />
                <div className="h-5 w-16 bg-gray-200 rounded-md" />
              </div>

              {/* Title */}
              <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded-md mb-4" />

              {/* Image */}
              <div className="h-40 w-full bg-gray-200 rounded-md mb-4" />

              {/* Description */}
              <div className="h-3 w-full bg-gray-200 rounded-md mb-2" />
              <div className="h-3 w-5/6 bg-gray-200 rounded-md mb-4" />

              {/* Buttons */}
              <div className="flex gap-3 mt-auto">
                <div className="h-9 w-full bg-gray-200 rounded-md" />
                <div className="h-9 w-full bg-gray-200 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ✅ No Campaigns Found
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No campaigns found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find campaigns.
        </p>
      </div>
    );
  }

  // ✅ Display Campaigns
  return (
    <>
      <div className="lg:grid  flex flex-col justify-center items-center gap-6 md:grid-cols-2 xl:grid-cols-3 ">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onAccept={() => handleAcceptClick(campaign)}
            showAcceptButton={user?.isPublisher}
            isAccepted={isCampaignAccepted(campaign.id)}
          />
        ))}
      </div>

      <AcceptCampaignDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAccept}
        campaign={selectedCampaign}
        isLoading={isLoading}
      />
    </>
  );
}
