// Update the CampaignCard component to include claim functionality AND VIDEO THUMBNAIL
"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/hooks/useCampaigns";
import { toast } from "sonner";
import { ClaimRewardDialog } from "../claim-reward-dialog";
import { submitProof } from "@/lib/functions/publishers/claim";
import Link from "next/link";
import { Play, Video } from "lucide-react";

interface CampaignCardProps {
  campaign: any;
  progress: number;
}

const CampaignCard = ({ campaign, progress }: CampaignCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { isLoading } = useCampaigns();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Map database status to display status
  const getDisplayStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "running";
      case "PAUSED":
        return "paused";
      case "COMPLETED":
        return "completed";
      case "PENDING":
        return "pending";
      default:
        return status.toLowerCase();
    }
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = getDisplayStatus(status);

    switch (displayStatus) {
      case "running":
        return <Badge className="bg-green-100 text-green-800">Running</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideoFile(campaign.adCreative?.fileUrl)) {
      setIsVideoPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    } else {
      // If it's an image or other file, navigate to campaign details
      router.push(`/dashboard/advertiser/campaigns/${campaign.id}`);
    }
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const isVideoFile = (url?: string): boolean => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".mov", ".webm", ".avi", ".mkv"];
    const isVideoByExtension = videoExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );
    const isVideoByUrl =
      url.toLowerCase().includes("/videos/") ||
      url.toLowerCase().includes("/video/") ||
      url.toLowerCase().includes(".mp4") ||
      url.toLowerCase().includes(".mov");
    return isVideoByExtension || isVideoByUrl;
  };

  const isImageFile = (url?: string): boolean => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  const getFileType = (url?: string): "image" | "video" | "unknown" => {
    if (isVideoFile(url)) return "video";
    if (isImageFile(url)) return "image";
    return "unknown";
  };

  const fileType = getFileType(campaign.adCreative?.fileUrl);
  const hasMedia = !!campaign.adCreative?.fileUrl;

  const calculatedProgress =
    progress !== undefined
      ? progress
      : campaign.targetViews > 0
      ? Math.round((campaign.views / campaign.targetViews) * 100)
      : 0;

  const handleCardClick = () => {
    router.push(`/dashboard/advertiser/campaigns/${campaign.id}`);
  };

  const handleClaimClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.isPublisher) {
      toast.error("You need to be a publisher to claim rewards");
      return;
    }
    setShowClaimDialog(true);
  };

  const handleCloseClaimDialog = () => {
    setShowClaimDialog(false);
  };

  return (
    <>
      <Card className="shadow-md shadow-black/40 hover:shadow-md max-w-[400px] transition cursor-pointer">
        <CardHeader className="flex -my-3 flex-row items-center justify-between">
          <CardTitle className="text-lg capitalize line-clamp-1">
            {campaign?.title}
          </CardTitle>
          {getStatusBadge(campaign?.status)}
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Description */}
          <p className="line-clamp-2 text-sm h-10 mb-2 text-black">
            {campaign.description || "No description provided"}
          </p>

          {/* Ad Creative Media - UPDATED WITH VIDEO SUPPORT */}
          {hasMedia ? (
            <div className="h-[200px] w-full rounded-md overflow-hidden bg-muted relative">
              {fileType === "image" && (
                <img
                  src={campaign.adCreative.fileUrl}
                  alt={`Ad creative for ${campaign.title}`}
                  className="w-full h-full object-cover"
                  onClick={handleThumbnailClick}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              {fileType === "video" && (
                <div className="relative w-full h-full">
                  {/* Video thumbnail/preview */}
                  {!isVideoPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/5"
                      onClick={handleThumbnailClick}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center mb-2 mx-auto hover:bg-primary transition-colors">
                          <Play className="h-6 w-6 text-white ml-1" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Click to preview
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Video player */}
                  <video
                    ref={videoRef}
                    src={campaign.adCreative.fileUrl}
                    className={`w-full h-full object-cover ${
                      isVideoPlaying ? "block" : "hidden"
                    }`}
                    controls={isVideoPlaying}
                    onEnded={handleVideoEnd}
                    onPause={handleVideoPause}
                    preload="metadata"
                    muted
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Video type badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 text-xs bg-black/70 text-white border-none"
                  >
                    <Video className="h-3 w-3 mr-1" />
                    VIDEO
                  </Badge>
                </div>
              )}

              {fileType === "unknown" && (
                <div
                  className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer"
                  onClick={handleThumbnailClick}
                >
                  <div className="text-center">
                    <Video className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Media Preview</p>
                    <p className="text-xs">Click to view</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="h-[200px] w-full bg-muted flex items-center justify-center rounded-md cursor-pointer"
              onClick={handleThumbnailClick}
            >
              <div className="text-center">
                <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  No media available
                </span>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Views</span>
              <span className="font-medium text-black">
                {campaign.views?.toLocaleString()} /{" "}
                {campaign.targetViews?.toLocaleString()}
              </span>
            </div>
            <Progress value={calculatedProgress} />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(calculatedProgress)}% complete
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            {campaign.status === "ACTIVE" && (
              <>
                <Button size="sm" className="h-[30px] cursor-pointer">
                  <Link href={`/dashboard/advertiser/campaigns/${campaign.id}`}>
                    View Analytics
                  </Link>
                </Button>
              </>
            )}
            {campaign.status === "PENDING" && (
              <Button size="sm" variant="outline">
                Edit
              </Button>
            )}
            {campaign.status === "COMPLETED" && (
              <Button size="sm" variant="outline">
                View Report
              </Button>
            )}
            {campaign.status === "PAUSED" && (
              <>
                <Button size="sm" variant="outline">
                  Resume
                </Button>
                <Button size="sm">View Analytics</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CampaignCard;
