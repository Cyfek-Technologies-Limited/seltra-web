"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, Calendar, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface CampaignCardProps {
  campaign: Campaign;
  onAccept?: () => void;
  showAcceptButton?: boolean;
  isAccepted?: boolean;
  isStateAccepted?: boolean;
}

export function CampaignCard({
  campaign,
  onAccept,
  showAcceptButton = false,
  isAccepted = false,
  isStateAccepted = false,
}: CampaignCardProps) {
  const [open, setOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const accepted = isAccepted || isStateAccepted;
  const isFull =
    campaign.status === "COMPLETED" ||
    (campaign.targetViews > 0 && campaign.views >= campaign.targetViews);

  const progress =
    campaign.targetViews && campaign.views
      ? Math.min((campaign.views / campaign.targetViews) * 100, 100)
      : 0;

  const handleViewDetails = () => {
    if (!user || !user.isPublisher) {
      setShowAuthPrompt(true);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {/* Campaign Card */}
      <Card className="overflow-hidden w-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <Badge variant="secondary" className="text-xs">
              {campaign.category || "General"}
            </Badge>
            <Badge
              variant={
                campaign.status === "ACTIVE"
                  ? "default"
                  : campaign.status === "COMPLETED"
                  ? "secondary"
                  : "outline"
              }
              className="text-xs"
            >
              {campaign.status}
            </Badge>
          </div>

          {/* Title + Description */}
          <div className="mb-4 flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">
              {campaign.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {campaign.description}
            </p>
          </div>

          {/* Thumbnail */}
          {campaign?.adCreative?.fileUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              {/\.(mp4|mov|webm|avi)$/i.test(campaign.adCreative.fileUrl) ? (
                <video
                  src={campaign.adCreative.fileUrl}
                  className="w-full h-40 object-cover bg-black"
                  preload="metadata"
                  muted
                />
              ) : (
                <img
                  src={campaign.adCreative.fileUrl}
                  alt={campaign.title}
                  className="w-full h-40 object-cover"
                />
              )}
            </div>
          )}

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>Target Views:</span>
              </div>
              <span className="font-medium">
                {campaign.targetViews?.toLocaleString()}
              </span>
            </div>

            <div className="mt-3">
              <Progress value={progress} className="w-full" />
              <p className="text-xs mt-1 text-muted-foreground text-right">
                {campaign.views?.toLocaleString()} /{" "}
                {campaign.targetViews?.toLocaleString()} views
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Platform:</span>
              </div>
              <span className="font-medium capitalize">
                {campaign.platform}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <CardFooter className="p-0 mt-auto">
            {showAcceptButton ? (
              <div className="w-full space-y-2">
                {isFull ? (
                  <Button
                    disabled
                    className="w-full bg-gray-400 cursor-not-allowed"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                ) : accepted ? (
                  <Button
                    disabled
                    className="w-full bg-green-600 hover:bg-green-600 cursor-not-allowed"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accepted
                  </Button>
                ) : (
                  <Button
                    onClick={onAccept}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Accept Campaign
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
            )}
          </CardFooter>
        </CardContent>
      </Card>

      {/* Auth Prompt Dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Lock className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Publisher Access Required
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
              You need a publisher account to view campaign details and earn
              money by promoting ads. Join thousands of publishers already
              earning on Seltra.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 rounded-lg p-4 my-2 space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Access exclusive ad campaigns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Earn money by sharing ads on your social media</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Get paid directly to your bank account</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowAuthPrompt(false);
                router.push("/auth/signup");
              }}
            >
              Create Publisher Account
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAuthPrompt(false);
                router.push("/auth/login");
              }}
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowAuthPrompt(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>{campaign.title}</DialogTitle>
            <DialogDescription>
              Full details of this campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {campaign.adCreative?.fileUrl &&
              (/\.(mp4|mov|webm|avi)$/i.test(campaign.adCreative.fileUrl) ? (
                <video
                  src={campaign.adCreative.fileUrl}
                  className="w-full rounded-lg bg-black"
                  controls
                  preload="metadata"
                />
              ) : (
                <img
                  src={campaign.adCreative.fileUrl}
                  alt="creative"
                  className="w-full rounded-lg object-cover"
                />
              ))}

            {campaign.description && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-1">Progress</h3>
              <Progress value={progress} className="w-full" />
              <p className="text-xs mt-1 text-muted-foreground">
                {progress.toFixed(1)}% — {campaign.views?.toLocaleString()} /{" "}
                {campaign.targetViews?.toLocaleString()} views
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>
                <strong>Category:</strong> {campaign.category}
              </p>
              <p>
                <strong>Status:</strong> {campaign.status}
              </p>
              <p className="capitalize">
                <strong>Platform:</strong> {campaign.platform}
              </p>
              {campaign.createdAt && (
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
