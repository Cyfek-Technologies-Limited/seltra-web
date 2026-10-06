// app/dashboard/publisher/my-campaigns/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  Search,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  BarChart3,
  Plus,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import { Input } from "@/components/ui/input";
import { ClaimRewardDialog } from "@/components/claim-reward-dialog";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import {
  handleClaimClick,
  submitProof,
} from "@/lib/functions/publishers/claim";
import { loadCampaigns } from "@/lib/functions/publishers/campaign";
import { formatCurrency, formatDate } from "@/lib/utils";
import Progressbar from "@/components/ui/Progressbar";
import PublisherDashCard from "@/components/PublisherDashCard";

export default function PublisherMyCampaignsPage() {
  const { user, userLoading } = useAuth();
  const { isLoading, campaignLoading, setIsLoading } = useCampaigns();
  const [campaigns, setCampaigns] = useState<AcceptedCampaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCampaign, setSelectedCampaign] =
    useState<AcceptedCampaign | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  useEffect(() => {
    if (user?.isPublisher) {
      loadCampaigns(statusFilter, setCampaigns, setStats);
    }
    console.log("campaigns", campaigns);
  }, [user, statusFilter]);

  const handleClaimSubmit = async (data: {
    proofImages: File[];
    proofUrls: string[]; // Updated to accept array
    views: number;
    notes?: string;
  }) => {
    if (!selectedCampaign) return;

    try {
      const success = await submitProof(
        selectedCampaign.campaignId,
        data.proofImages,
        data.proofUrls, // Pass array of URLs
        data.views,
        setIsLoading,
        data.notes
      );
      if (success) {
        setShowClaimDialog(false);
        setSelectedCampaign(null);
        await loadCampaigns(statusFilter, setCampaigns, setStats);
      }
    } catch (error) {
      // Error handling is done in the submitProof function
    }
  };

  // Filter campaigns by search query
  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log("filteredCampaigns", filteredCampaigns);

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
  }

  if (!user?.isPublisher) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Publisher Access Required
          </h3>
          <p className="text-muted-foreground mb-4">
            You need to be a publisher to view accepted campaigns.
          </p>
          <Button asChild>
            <Link href="/campaigns">Explore Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Campaigns
            </h1>
            <p className="text-muted-foreground">
              Track your accepted campaigns, submit proof, and monitor earnings.
            </p>
          </div>

          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/explore" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Accept New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.paid}
              </div>
              <p className="text-xs text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-3 lg:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {formatCurrency(stats.totalEarnings)}
              </div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>

              <Button variant="outline" onClick={() => loadCampaigns}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      {campaignLoading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white"
            >
              <div className="p-6 flex flex-col lg:flex-row gap-6">
                {/* Image Placeholder */}
                <div className="lg:w-48 flex-shrink-0">
                  <div className="h-32 w-full bg-gray-200 rounded-lg" />
                </div>

                {/* Text and Content */}
                <div className="flex-1 space-y-4">
                  {/* Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-2" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded-md" />
                    </div>
                    <div className="h-6 w-24 bg-gray-200 rounded-md" />
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i}>
                        <div className="h-3 w-1/2 bg-gray-200 rounded-md mb-2" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded-md" />
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full w-full" />
                    <div className="flex justify-between">
                      <div className="h-3 w-12 bg-gray-200 rounded-md" />
                      <div className="h-3 w-10 bg-gray-200 rounded-md" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <div className="h-8 w-28 bg-gray-200 rounded-md" />
                    <div className="h-8 w-28 bg-gray-200 rounded-md" />
                    <div className="h-6 w-24 bg-gray-200 rounded-md ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCampaigns.length !== 0 ? (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => {
            const remainingViews = campaign.targetViews - campaign.views;

            // Only allow claiming if there are remaining views
            // if (remainingViews <= 0) {
            //   toast({
            //     title: "No Views Available",
            //     description:
            //       "This campaign has already reached its target views.",
            //     variant: "destructive",
            //   });
            //   return;
            // }

            return (
              <PublisherDashCard
                campaign={campaign}
                setSelectedCampaign={setSelectedCampaign}
                setShowClaimDialog={setShowClaimDialog}
                remainingViews={remainingViews}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <BarChart3 className="mx-auto h-12 w-12" />
            </div>
            <CardTitle className="text-lg font-medium mb-2">
              No campaigns found
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              {statusFilter === "all"
                ? "You haven't accepted any campaigns yet. Start by exploring available campaigns."
                : `No campaigns with status "${statusFilter}" found.`}
            </p>
            <Button asChild>
              <Link href="/explore">Explore Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Claim Reward Dialog */}
      <ClaimRewardDialog
        isOpen={showClaimDialog}
        onClose={() => {
          setShowClaimDialog(false);
          setSelectedCampaign(null);
        }}
        onClaimSubmit={handleClaimSubmit}
        campaign={selectedCampaign}
        isLoading={isLoading}
      />
    </div>
  );
}
