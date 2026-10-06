import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Clock,
  Upload,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PublishCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onAcceptCampaign: (campaignId: string) => void;
}

export default function PublishCampaignModal({
  isOpen,
  onClose,
  campaign,
  onAcceptCampaign,
}: PublishCampaignModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleDownloadFlyer = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(campaign.flyerUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${campaign.campaignName}-flyer.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Flyer Downloaded",
        description: "Campaign flyer has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the flyer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAcceptCampaign = async () => {
    setIsAccepting(true);
    try {
      await onAcceptCampaign(campaign._id);
      toast({
        title: "Campaign Accepted!",
        description: "Campaign is now running. You can upload proof in 24 hours.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const steps = [
    {
      icon: Download,
      title: "Download Flyer",
      description: "Download the campaign flyer to your device",
    },
    {
      icon: Share2,
      title: "Share on WhatsApp Status",
      description: "Post the flyer as your WhatsApp status",
    },
    {
      icon: Clock,
      title: "Wait 24 Hours",
      description: "Allow time for views to accumulate",
    },
    {
      icon: Upload,
      title: "Upload Proof Screenshot",
      description: "Take a screenshot of your status views and upload it",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Publish Campaign: {campaign?.campaignName}
          </DialogTitle>
          <DialogDescription>
            Follow these steps to earn money by sharing this campaign on your WhatsApp status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold">{campaign?.campaignName}</h3>
              <p className="text-sm text-muted-foreground">
                Earn ₦{campaign?.price?.toLocaleString()} per 1000 views
              </p>
            </div>
            <Badge className="bg-success text-success-foreground">
              Available
            </Badge>
          </div>

          {/* Flyer Preview */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Campaign Flyer
            </h4>
            <div className="flex gap-4">
              <div className="w-48 h-48 bg-muted rounded-lg overflow-hidden border">
                <img
                  src={campaign?.flyerUrl}
                  alt={campaign?.campaignName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {campaign?.adText}
                </p>
                <Button 
                  onClick={handleDownloadFlyer} 
                  disabled={isDownloading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Flyer"}
                </Button>
              </div>
            </div>
          </div>

          {/* Steps Guide */}
          <div className="space-y-4">
            <h4 className="font-semibold">How It Works</h4>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      <h5 className="font-medium">{step.title}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <h5 className="font-medium text-warning mb-2">Important Notes:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Keep your WhatsApp status visible for at least 24 hours</li>
              <li>• Take a clear screenshot showing the view count</li>
              <li>• Payment is processed after proof verification</li>
              <li>• You can only accept campaigns you can genuinely promote</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptCampaign} 
              disabled={isAccepting}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isAccepting ? "Accepting..." : "Accept Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}