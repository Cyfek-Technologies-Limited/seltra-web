// app/campaigns/page.tsx - UPDATED (minor optimization)
"use client";

import { useState, useEffect } from "react";
import { CampaignList } from "@/components/campaign-list";
import { CampaignFilters } from "@/components/campaign-filters";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAuth } from "@/hooks/useAuth";
import { getPublisherCampaigns } from "@/lib/functions/publishers/campaign";

export default function CampaignsPage() {
  const { campaigns, isLoading } = useCampaigns();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [acceptedCampaignIds, setAcceptedCampaignIds] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch accepted campaign IDs when user is a publisher
  useEffect(() => {
    const fetchAcceptedCampaigns = async () => {
      if (user?.isPublisher) {
        try {
          const acceptedCampaigns = await getPublisherCampaigns();
          const acceptedIds = acceptedCampaigns.map(
            (campaign: any) => campaign.campaignId
          );
          setAcceptedCampaignIds(acceptedIds);
        } catch (error) {
          console.error("Failed to fetch accepted campaigns:", error);
        }
      }
    };

    fetchAcceptedCampaigns();
  }, [user]);

  const filteredCampaigns = Array.isArray(campaigns)
    ? campaigns.filter((campaign) => {
        const matchesSearch =
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || campaign.category === selectedCategory;
        const matchesStatus =
          selectedStatus === "all" || campaign.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
    : [];

  return (
    <div className=" mt-[5rem]  px-5 py-8 ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Explore Campaigns
        </h1>
        <p className="text-muted-foreground">
          Discover and accept advertising campaigns that match your audience and
          interests.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <div className="sticky top-4">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <CampaignFilters
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              onCategoryChange={setSelectedCategory}
              onStatusChange={setSelectedStatus}
            />
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="ml-3"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Animated Dropdown */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-4 bg-card rounded-xl shadow-md p-4 border"
              >
                <CampaignFilters
                  selectedCategory={selectedCategory}
                  selectedStatus={selectedStatus}
                  onCategoryChange={(category) => {
                    setSelectedCategory(category);
                    setShowMobileFilters(false);
                  }}
                  onStatusChange={(status) => {
                    setSelectedStatus(status);
                    setShowMobileFilters(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Campaign List */}
        <div className="flex-1">
          {/* <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCampaigns.length} campaigns found
            </p>
          </div> */}

          <CampaignList
            campaigns={filteredCampaigns}
            acceptedCampaignIds={acceptedCampaignIds}
          />
        </div>
      </div>
    </div>
  );
}
