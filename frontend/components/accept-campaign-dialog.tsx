// components/accept-campaign-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface AcceptCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaign: any;
  isLoading?: boolean;
}

export function AcceptCampaignDialog({
  isOpen,
  onClose,
  onConfirm,
  campaign,
  isLoading,
}: AcceptCampaignDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-in zoom-in-95 duration-200 flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle>Accept Campaign</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to accept this campaign? Once accepted, you'll
            promoting it on your social media, submit proof of views and get
            paid.
          </DialogDescription>
        </DialogHeader>

        {campaign && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 ">
            <h4 className="font-medium text-sm">{campaign.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 ">
              {campaign.description}
            </p>
            <div className="flex justify-between text-xs">
              <span>
                Target Views: {campaign.targetViews?.toLocaleString()}
              </span>
              <span>Platform: {campaign.platform}</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 "
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Accepting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Yes, Accept
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
