// components/claim-reward-dialog.tsx - UPDATED WITH MULTIPLE URLS
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Link,
  Eye,
  AlertTriangle,
  X,
  Plus,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Progressbar from "./ui/Progressbar";
import imageCompression from "browser-image-compression";
import { Badge } from "@/components/ui/badge";

interface ClaimRewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmit: (data: {
    proofImages: File[];
    proofUrls: string[]; // Changed from proofUrl to proofUrls (array)
    views: number;
    notes?: string;
  }) => Promise<void>;
  campaign: any;
  isLoading?: boolean;
  maxViews?: number;
}

interface ProofImage {
  file: File;
  previewUrl: string;
  id: string;
}

export function ClaimRewardDialog({
  isOpen,
  onClose,
  onClaimSubmit,
  campaign,
  isLoading = false,
}: ClaimRewardDialogProps) {
  // Add near the top of the component
  const isAllPlatforms = campaign?.platform?.toLowerCase() === "all";
  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState(""); // Temporary input for new URL
  const [views, setViews] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const maxViews = campaign?.targetViews - campaign?.views;
  const MAX_IMAGES = 5;
  const MAX_URLS = 3; // Maximum number of URLs allowed

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      handleRemoveAllImages();
      setProofUrls([]);
      setNewUrl("");
      setViews("");
      setNotes("");
    }
  }, [isOpen]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (proofImages.length + files.length > MAX_IMAGES) {
      toast({
        title: "Too Many Images",
        description: `You can only upload up to ${MAX_IMAGES} screenshots`,
        variant: "destructive",
      });
      return;
    }

    const newProofImages: ProofImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not a valid image file`,
          variant: "destructive",
        });
        continue;
      }

      let finalFile: File = file;

      try {
        finalFile = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      } catch (error) {
        console.error("Compression failed", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          error,
        });

        toast({
          title: "Compression Skipped",
          description: `${file.name} could not be compressed, using original image`,
        });
      }

      if (finalFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 5MB limit`,
          variant: "destructive",
        });
        continue;
      }

      const previewUrl = URL.createObjectURL(finalFile);

      newProofImages.push({
        file: finalFile,
        previewUrl,
        id: crypto.randomUUID(),
      });
    }

    if (newProofImages.length > 0) {
      setProofImages((prev) => [...prev, ...newProofImages]);
      toast({
        title: "Images Added",
        description: `Added ${newProofImages.length} screenshot(s)`,
      });
    }

    event.target.value = "";
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description:
          "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    if (proofUrls.length >= MAX_URLS) {
      toast({
        title: "Too Many URLs",
        description: `You can only add up to ${MAX_URLS} URLs`,
        variant: "destructive",
      });
      return;
    }

    if (proofUrls.includes(newUrl)) {
      toast({
        title: "Duplicate URL",
        description: "This URL has already been added",
        variant: "destructive",
      });
      return;
    }

    setProofUrls((prev) => [...prev, newUrl.trim()]);
    setNewUrl("");
    toast({
      title: "URL Added",
      description: "Post URL added successfully",
    });
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setProofUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleRemoveImage = (imageId: string) => {
    setProofImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const handleRemoveAllImages = () => {
    proofImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setProofImages([]);
  };

  const handleViewsChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (maxViews && numericValue) {
      const viewsNum = parseInt(numericValue);
      if (viewsNum > maxViews) {
        toast({
          title: "Views Exceed Limit",
          description: `You can only claim up to ${maxViews.toLocaleString()} views for this campaign`,
          variant: "destructive",
        });
        return;
      }
    }

    setViews(numericValue);
  };

  const handleSubmit = async () => {
    if (proofImages.length === 0) {
      toast({
        title: "Proof Required",
        description: "Please upload at least one screenshot as proof",
        variant: "destructive",
      });
      return;
    }

    // if (proofUrls.length === 0) {
    //   toast({
    //     title: "Post URLs Required",
    //     description: "Please add at least one post URL",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (!views || parseInt(views) === 0) {
      toast({
        title: "Views Required",
        description: "Please enter the number of views you received",
        variant: "destructive",
      });
      return;
    }

    const viewsCount = parseInt(views);

    if (viewsCount > campaign.targetViews) {
      toast({
        title: "Too Many Views",
        description: `Claimed views (${viewsCount}) cannot exceed campaign target (${campaign.targetViews})`,
        variant: "destructive",
      });
      return;
    }

    if (maxViews && viewsCount > maxViews) {
      toast({
        title: "Views Exceed Available Limit",
        description: `You can only claim up to ${maxViews.toLocaleString()} views. ${viewsCount} views requested.`,
        variant: "destructive",
      });
      return;
    }

    // Add inside handleSubmit, before the try block:
    if (isAllPlatforms) {
      if (proofImages.length < 3) {
        toast({
          title: "More Screenshots Required",
          description:
            "This campaign requires at least 3 screenshots from 3 different social media platforms.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const proofFiles = proofImages.map((img) => img.file);

      await onClaimSubmit({
        proofImages: proofFiles,
        proofUrls: proofUrls, // Send array of URLs
        views: viewsCount,
        notes: notes.trim() || undefined,
      });

      // Reset form on successful submission
      handleRemoveAllImages();
      setProofUrls([]);
      setNewUrl("");
      setViews("");
      setNotes("");
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    onClose();
  };

  const remainingViews =
    maxViews ?? campaign?.targetViews - (campaign?.views || 0);
  const isNearLimit = remainingViews < 1000;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <DialogTitle>Claim Reward</DialogTitle>
          </div>
          <DialogDescription>
            Submit proof of views to claim your reward for this campaign.
          </DialogDescription>
        </DialogHeader>

        {campaign && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">{campaign.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {campaign.description}
            </p>
            <div className="flex justify-between text-xs">
              <span>
                Target: {campaign.targetViews?.toLocaleString()} views
              </span>
              <span>Platform: {campaign.platform}</span>
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${
                isNearLimit
                  ? "text-amber-600 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {isNearLimit && <AlertTriangle className="h-3 w-3" />}
              <span>
                Remaining: {remainingViews.toLocaleString()} views available
              </span>
            </div>

            <Progressbar campaign={campaign} />
          </div>
        )}

        <div className="space-y-4">
          {/* Multiple Post URLs */}
          {/* <div className="space-y-2">
            <Label htmlFor="proofUrls" className="text-sm font-medium">
              Post URLs *
            </Label>

          
            {proofUrls.length > 0 && (
              <div className="space-y-2">
                {proofUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" title={url}>
                        {url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUrl(url)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {proofUrls.length < MAX_URLS && (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="url"
                    placeholder={`https://${campaign?.platform}.com/your-post-url`}
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleAddUrl}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Add links to your {campaign?.platform} posts showing the views (
              {proofUrls.length}/{MAX_URLS})
            </p>
          </div> */}

          {/* Views Count */}
          <div className="space-y-2">
            <Label htmlFor="views" className="text-sm font-medium">
              Views Received *
            </Label>
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="views"
                type="text"
                placeholder={`e.g., ${Math.min(
                  1500,
                  remainingViews
                ).toLocaleString()}`}
                value={views}
                onChange={(e) => handleViewsChange(e.target.value)}
                className="pl-10 text-lg font-medium"
                max={maxViews}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Number of views shown on your post (max:{" "}
              {remainingViews.toLocaleString()} available)
            </p>

            {maxViews && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((parseInt(views) || 0) / maxViews) * 100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Multiple Screenshot Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="proofImages" className="text-sm font-medium">
                Screenshot Proof
              </Label>
              {proofImages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAllImages}
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove All
                </Button>
              )}
            </div>

            {/* Image Grid */}
            {proofImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {proofImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.previewUrl}
                      alt="Proof preview"
                      className="w-full h-32 object-cover rounded-lg border shadow-sm"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {(image.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {proofImages.length < MAX_IMAGES && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {proofImages.length === 0
                        ? "Upload screenshots"
                        : "Add more screenshots"}
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proofImages"
                    multiple
                  />
                  <Label htmlFor="proofImages">
                    <div className="flex bg-primary text-white justify-center py-2 px-4 rounded-lg mx-auto items-center cursor-pointer hover:bg-primary/90 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </div>
                  </Label>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Upload multiple screenshots showing different angles or details of
              your {campaign?.platform} posts
            </p>
          </div>

          {/* Requirements List */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  Proof Requirements
                </p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Provide URLs to your {campaign?.platform} posts</li>
                  <li>• Enter the total view count across all posts</li>
                  <li>• Upload clear screenshots showing the view counts</li>
                  <li>• Screenshots should be from the last 24 hours</li>
                  <li>
                    • Campaign content should be recognizable in screenshots
                  </li>
                  {maxViews && (
                    <li>
                      • Maximum claimable: {maxViews.toLocaleString()} views
                    </li>
                  )}
                  {isAllPlatforms && (
                    <>
                      <li>
                        • <strong>Minimum 3 screenshots required</strong> — one
                        per platform
                      </li>
                      <li>
                        • Screenshots must be from 3 different platforms (e.g.
                        WhatsApp + Facebook + Instagram)
                      </li>
                      <li>
                        • You cannot submit 3 screenshots from the same platform
                      </li>
                      <li>• Total views across all platforms will be summed</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              proofImages.length === 0 ||
              !views ||
              remainingViews <= 0
            }
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Submit Claim ({proofImages.length}{" "}
                {proofImages.length === 1 ? "screenshot" : "screenshots"},{" "}
                {proofUrls.length} {proofUrls.length === 1 ? "URL" : "URLs"})
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
