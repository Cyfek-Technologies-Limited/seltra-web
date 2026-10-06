import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onSubmitProof: (campaignId: string, proofData: {
    screenshot: File;
    viewCount: number;
  }) => void;
}

export default function ProofUploadModal({
  isOpen,
  onClose,
  campaign,
  onSubmitProof,
}: ProofUploadModalProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [viewCount, setViewCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setScreenshot(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      toast({
        title: "Screenshot Required",
        description: "Please upload a screenshot of your WhatsApp status views.",
        variant: "destructive",
      });
      return;
    }

    if (!viewCount || parseInt(viewCount) < 1) {
      toast({
        title: "View Count Required",
        description: "Please enter a valid view count from your screenshot.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitProof(campaign._id, {
        screenshot,
        viewCount: parseInt(viewCount),
      });
      
      toast({
        title: "Proof Submitted Successfully!",
        description: "Your proof has been submitted for verification. Payment will be processed soon.",
      });
      
      // Reset form
      setScreenshot(null);
      setViewCount("");
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit proof. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Proof
          </DialogTitle>
          <DialogDescription>
            Upload your WhatsApp status screenshot and enter the view count for campaign: {campaign?.campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium">{campaign?.campaignName}</h4>
            <p className="text-sm text-muted-foreground">
              Expected earnings: ₦{campaign?.price?.toLocaleString()} per 1000 views
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label htmlFor="screenshot">WhatsApp Status Screenshot *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="max-h-32 mx-auto rounded border"
                  />
                  <p className="text-sm text-muted-foreground">
                    {screenshot?.name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScreenshot(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Change Screenshot
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <label htmlFor="screenshot" className="cursor-pointer">
                      <span className="text-sm text-primary hover:text-primary/80">
                        Click to upload
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}or drag and drop
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* View Count Input */}
          <div className="space-y-3">
            <Label htmlFor="viewCount" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Number of Views from Screenshot *
            </Label>
            <Input
              id="viewCount"
              type="number"
              placeholder="e.g. 1247"
              value={viewCount}
              onChange={(e) => setViewCount(e.target.value)}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Enter the exact number of views shown in your screenshot
            </p>
          </div>

          {/* Guidelines */}
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-warning">Verification Guidelines:</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Screenshot must clearly show the view count</li>
                  <li>• View count should match what you enter below</li>
                  <li>• Fraudulent submissions will result in account suspension</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !screenshot || !viewCount}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Proof"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}