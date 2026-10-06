// components/advertiser-campaign-card.tsx - UPDATED WITH VIDEO THUMBNAIL
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Target,
  Calendar,
  Users,
  BarChart3,
  Edit,
  Pause,
  Play,
  Video,
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useState, useRef } from "react";
import Link from "next/link";

interface AdvertiserCampaignCardProps {
  campaign: any;
}

export function AdvertiserCampaignCard({
  campaign,
}: AdvertiserCampaignCardProps) {
  const { updateCampaign, isLoading } = useCampaigns();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Play className="w-4 h-4" />;
      case "PAUSED":
        return <Pause className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const handleStatusToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      await updateCampaign(campaign.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update campaign status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThumbnailClick = () => {
    if (isVideoFile(campaign.adCreative?.fileUrl)) {
      setIsVideoPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
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
    const videoMimeTypes = ["video/mp4", "video/quicktime", "video/webm"];

    // Check file extension
    const isVideoByExtension = videoExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );

    // Check if URL contains video indicators
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

  const progress =
    campaign.targetViews > 0
      ? (campaign.views / campaign.targetViews) * 100
      : 0;

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl capitalize flex items-center gap-2 line-clamp-1">
              {campaign.title}
              <Badge className={getStatusColor(campaign.status)}>
                {getStatusIcon(campaign.status)}
                {campaign.status}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2 w-[83%] text-black">
              {campaign.description || "No description provided"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Media Display Area */}
        <div className="h-[300px] w-full mb-4 rounded-md overflow-hidden bg-muted relative">
          {hasMedia ? (
            <>
              {fileType === "image" && (
                <img
                  src={campaign.adCreative.fileUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
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
                        <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center mb-2 mx-auto hover:bg-primary transition-colors">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Click to preview video
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
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm font-medium">Media Preview</p>
                    <p className="text-xs">Unsupported file type</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Fallback when no media is available
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm font-medium">No Media</p>
                <p className="text-xs">Ad creative not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {campaign.targetViews.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Target Views</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {campaign.views.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium capitalize">{campaign.platform}</div>
              <div className="text-xs text-muted-foreground">Platform</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">Created</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full border-[0.5px] border-black/50 bg-sidebar rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: "red",
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <Link href={`/dashboard/advertiser/campaigns/${campaign?.id}`}>
              Analytics
            </Link>
          </Button>

          {(campaign.status === "ACTIVE" || campaign.status === "PAUSED") && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleStatusToggle}
              disabled={isUpdating || isLoading}
            >
              {campaign.status === "ACTIVE" ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {campaign.status === "ACTIVE" ? "Pause" : "Resume"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
