// PublisherDashCard.tsx
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  ImageIcon,
  XCircle,
} from "lucide-react";
import React from "react";
import { Card, CardContent } from "./ui/card";
import {
  getStatusBadge,
  getStatusIcon,
} from "@/lib/functions/publishers/campaign";
import Progressbar from "./ui/Progressbar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  handleClaimClick,
  handleDownloadMaterial,
} from "@/lib/functions/publishers/claim";
import { Badge } from "@/components/ui/badge";

const PublisherDashCard = ({
  campaign,
  setSelectedCampaign,
  setShowClaimDialog,
  remainingViews,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Top: Image full width on mobile */}
          <div className="w-full h-48 lg:hidden flex-shrink-0">
            {campaign.adCreative?.fileUrl ? (
              /\.(mp4|mov|webm|avi)$/i.test(campaign.adCreative.fileUrl) ? (
                <video
                  src={campaign.imageUrl}
                  className="w-full h-full object-cover bg-black"
                  preload="metadata"
                  muted
                />
              ) : (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 p-4 lg:p-6">
            {/* Desktop only: sidebar image */}
            <div className="hidden lg:block lg:w-48 flex-shrink-0">
              {campaign.adCreative?.fileUrl ? (
                /\.(mp4|mov|webm|avi)$/i.test(campaign.adCreative.fileUrl) ? (
                  <video
                    src={campaign.imageUrl}
                    className="w-full h-32 object-cover rounded-lg bg-black"
                    preload="metadata"
                    muted
                  />
                ) : (
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Campaign Details */}
            <div className="flex-1 space-y-3">
              {/* Title + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold leading-tight line-clamp-2">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {campaign.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getStatusIcon(campaign.status)}
                  {getStatusBadge(campaign.status)}
                </div>
              </div>

              {/* Stats Grid — 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="font-medium capitalize text-sm">
                    {campaign.platform}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Target Views</p>
                  <p className="font-medium text-sm">
                    {campaign.targetViews.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Your Views</p>
                  <p className="font-medium text-sm">
                    {campaign.pubViews.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Earnings</p>
                  <p className="font-medium text-sm text-green-600">
                    {formatCurrency(campaign.amount)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <Progressbar campaign={campaign} />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Download this advert button  */}
                {/* <Button
                  variant="outline"
                  className="w-[35%] justify-start"
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
                  {/\.(mp4|mov|webm|avi)$/i.test(
                    campaign.adCreative?.fileUrl
                  ) ? (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Advert (Video)
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Download Advert
                    </>
                  )}
                </Button> */}

                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/dashboard/publisher/campaigns/${campaign.campaignId}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </Button>

                {campaign.status === "ACTIVE" ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleClaimClick(
                        campaign,
                        setSelectedCampaign,
                        setShowClaimDialog,
                        remainingViews
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Submit Proof
                  </Button>
                ) : campaign.status === "PENDING" ? (
                  <Button
                    size="sm"
                    disabled
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 cursor-not-allowed border-yellow-200"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Under Review
                  </Button>
                ) : campaign.status === "APPROVED" ? (
                  <Button
                    size="sm"
                    disabled
                    variant="outline"
                    className="bg-green-50 text-green-700 cursor-not-allowed border-green-200"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approved
                  </Button>
                ) : campaign.status === "PAID" ? (
                  <Button
                    size="sm"
                    disabled
                    variant="outline"
                    className="bg-blue-50 text-blue-700 cursor-not-allowed border-blue-200"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Paid
                  </Button>
                ) : campaign.status === "REJECTED" ? (
                  <Button
                    size="sm"
                    disabled
                    variant="outline"
                    className="bg-red-50 text-red-700 cursor-not-allowed border-red-200"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejected
                  </Button>
                ) : null}

                {campaign.status === "APPROVED" && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 text-xs"
                  >
                    Ready for Payment
                  </Badge>
                )}

                {campaign.status === "PAID" && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 text-xs"
                  >
                    Payment Completed
                  </Badge>
                )}

                {/* Date — moves to new line on mobile naturally */}
                <div className="text-xs text-muted-foreground ml-auto">
                  {campaign.status === "ACTIVE"
                    ? `Accepted ${formatDate(campaign.claimedAt)}`
                    : `Submitted ${formatDate(campaign.claimedAt)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublisherDashCard;
