// components/campaign-details-modal.tsx - UPDATED (if you have this component)
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users, View, CheckCircle2 } from "lucide-react";
import Progressbar from "./ui/Progressbar";

interface CampaignDetailsModalProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  isAccepting: boolean;
  isAccepted?: boolean; // Add this prop
}

export function CampaignDetailsModal({
  campaign,
  open,
  onOpenChange,
  onAccept,
  isAccepting,
  isAccepted = false,
}: CampaignDetailsModalProps) {
  const publisherEarnings = campaign.amountPaid * 0.3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-screen overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaign.title}
            {isAccepted && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Accepted
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Campaign by: {campaign.user.username}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campaign Image */}
          <div className="rounded-lg overflow-hidden bg-muted">
            <img
              src={campaign.adCreative?.fileUrl || "/placeholder.svg"}
              alt={campaign.title}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Progress Section */}
          <Progressbar campaign={campaign} />

          {/* Campaign Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {campaign.description}
            </p>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium capitalize">
                  {campaign.platform}
                </div>
                <div className="text-xs text-muted-foreground">Platform</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={onAccept}
              disabled={
                isAccepted || isAccepting || campaign.status !== "ACTIVE"
              }
              className={`flex-1 ${
                isAccepted
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-100"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isAccepted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Already Accepted
                </>
              ) : isAccepting ? (
                "Accepting..."
              ) : campaign.status === "ACTIVE" ? (
                "Accept Campaign"
              ) : (
                "Not Available"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
