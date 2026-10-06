// app/dashboard/campaigns/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Eye,
  Target,
  Calendar,
  Users,
  Share2,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import { ClaimRewardDialog } from "@/components/claim-reward-dialog";
import { toast } from "sonner";
import {
  handleClaimClick,
  handleDownloadMaterial,
  submitProof,
} from "@/lib/functions/publishers/claim";
import Link from "next/link";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getCampaign, isLoading } = useCampaigns();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const campaignId = params.id as string;

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const campaignData = await getCampaign(campaignId);
      console.log("user:", user);
      console.log("campaignData:", campaignData);
      setCampaign(campaignData);
    } catch (error) {
      console.error("Failed to load campaign:", error);
      toast.error("Failed to load campaign details");
    }
  };

  const handleClaimSubmit = async (data: {
    proofImages: File[];
    proofUrls: string[];
    views: number;
    notes?: string;
  }) => {
    try {
      const firstProofImage = data.proofImages[0];

      if (!firstProofImage) {
        toast.error("Please upload at least one proof image");
        return;
      }

      const success = await submitProof(
        campaignId,
        data.proofImages,
        data.proofUrls,
        data.views,
        setIsSubmitting,
        data.notes
      );

      if (success) {
        setShowClaimDialog(false);
        await loadCampaign();
      }
    } catch (error) {
      console.error("Claim submit failed:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "PAUSED":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "COMPLETED":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case "PENDING":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    return campaign.targetViews > 0
      ? Math.round((campaign.views / campaign.targetViews) * 100)
      : 0;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Campaign not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The campaign you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link
            className="cursor-pointer"
            href={"/dashboard/campaigns/my-campaigns"}
          >
            <Button>Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const isPublisher = user?.isPublisher;

  // FIX: Remove the publisher property access since it doesn't exist on User type
  // Use a different approach to check if user has accepted the campaign
  const hasAcceptedCampaign = campaign.earnings?.some(
    (earning: any) => earning.publisherId === user?.id // Use user.id instead of user.publisher.id
  );

  return (
    <div className="container mx-auto lg:px-4  ">
      {/* Header */}
      <div className="mb-6">
        {/* <Link href={"/dashboard/publisher/campaigns/my-campaigns"}>
          <Button variant="ghost" className="mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <a>Back to campaigns</a>
          </Button>
        </Link> */}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {campaign.title}
              </h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-muted-foreground text-lg line-clamp-2 w-[75%] text-sm">
              {campaign.description}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 pt-2">
              {/* <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/dashboard/publisher/campaigns/${campaign.campaignId}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button> */}

              {/* Submit Proof Button - Show different states based on status */}
              {campaign.status === "ACTIVE" ? (
                // Campaign is active and can accept proof
                <Button
                  size="sm"
                  onClick={() => setShowClaimDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Proof
                </Button>
              ) : campaign.status === "PENDING" ? (
                // Proof submitted and waiting for admin review
                <Button
                  size="sm"
                  disabled
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 cursor-not-allowed border-yellow-200"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Under Review
                </Button>
              ) : campaign.status === "APPROVED" ? (
                // Claim approved by admin
                <Button
                  size="sm"
                  disabled
                  variant="outline"
                  className="bg-green-50 text-green-700 cursor-not-allowed border-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approved
                </Button>
              ) : campaign.status === "PAID" ? (
                // Payment completed
                <Button
                  size="sm"
                  disabled
                  variant="outline"
                  className="bg-blue-50 text-blue-700 cursor-not-allowed border-blue-200"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Paid
                </Button>
              ) : campaign.status === "REJECTED" ? (
                // Claim rejected
                <Button
                  size="sm"
                  disabled
                  variant="outline"
                  className="bg-red-50 text-red-700 cursor-not-allowed border-red-200"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejected
                </Button>
              ) : null}

              {/* Status badges for additional context */}
              {campaign.status === "APPROVED" && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Ready for Payment
                </Badge>
              )}

              {campaign.status === "PAID" && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Payment Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Creative */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Campaign Creative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.adCreative?.fileUrl && (
                <div className="rounded-lg overflow-hidden border">
                  {/\.(mp4|mov|webm|avi)$/i.test(
                    campaign.adCreative.fileUrl
                  ) ? (
                    // Video — show with controls and preload thumbnail
                    <video
                      src={
                        campaign.currentPublisherEarning?.stampedCreativeUrl ||
                        campaign.adCreative.fileUrl
                      }
                      className="w-full max-h-96 object-contain bg-black"
                      controls
                      preload="metadata" // loads first frame as thumbnail
                      poster="" // browser uses first frame automatically
                    />
                  ) : (
                    // Image
                    <img
                      src={
                        campaign.currentPublisherEarning?.stampedCreativeUrl ||
                        campaign.adCreative.fileUrl
                      }
                      alt={campaign.title}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  )}
                </div>
              )}

              {campaign.adCreative?.text && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Caption</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-all overflow-hidden">
                    {campaign.adCreative.text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Target Views:</span>
                    <span>{campaign.targetViews?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Current Views:</span>
                    <span>{campaign.views?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Platform:</span>
                    <Badge variant="outline" className="capitalize">
                      {campaign.platform}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Created:</span>
                    <span>
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {campaign.category && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Category:</span>
                      <Badge variant="secondary">{campaign.category}</Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Campaign Progress
                  </span>
                  <span className="font-medium">{progress}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Download Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaign.adCreative?.fileUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    handleDownloadMaterial(
                      campaign.currentPublisherEarning.stampedCreativeUrl,
                      `ad-creative-${campaign.title}.jpg`
                    )
                  }
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Download This advert
                </Button>
              )}

              {campaign.adCreative?.text && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const textBlob = new Blob([campaign.adCreative.text], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(textBlob);
                    handleDownloadMaterial(
                      url,
                      `ad-text-${campaign.title}.txt`
                    );
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Ad Text
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const stampedUrl =
                    campaign.currentPublisherEarning?.stampedCreativeUrl;
                  const isVideo = /\.(mp4|mov|webm|avi)$/i.test(
                    campaign.adCreative.fileUrl
                  );
                  const ext = isVideo ? "mp4" : "jpg";
                  handleDownloadMaterial(
                    stampedUrl,
                    `ad-creative-${campaign.title}.${ext}`
                  );
                }}
              >
                {/\.(mp4|mov|webm|avi)$/i.test(campaign.adCreative?.fileUrl) ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download This advert (Video)
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Download This advert
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Campaign Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Posting Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Post the ad creative on {campaign.platform} social media
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Keep the post active for at least 24 hours</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use the provided ad text</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Take a clear screenshot showing the view count</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Submit proof through the claim form</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Progress
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Views Needed
                  </span>
                  <span className="font-medium">
                    {Math.max(
                      0,
                      campaign.targetViews - campaign.views
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Publishers
                  </span>
                  <span className="font-medium">
                    {campaign.earnings?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Claim Reward Dialog */}
      <ClaimRewardDialog
        isOpen={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        onClaimSubmit={handleClaimSubmit}
        campaign={campaign}
        isLoading={isSubmitting}
      />
    </div>
  );
}
