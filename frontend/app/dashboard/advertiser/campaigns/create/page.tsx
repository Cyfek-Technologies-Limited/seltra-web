"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Zap,
  Eye,
  DollarSign,
  Target,
  Users,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Video,
  X,
  Info,
  AlertTriangle,
  Compass,
  CheckCircle,
  Wand2,
  Copy,
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAIDescription } from "@/hooks/useAIDescription";
import { Roller, Spinner } from "@/components/ui/ReusableComponents";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { FileCompressor } from "@/lib/file-compression";
import { VideoGenerator } from "@/components/campaign/VideoGenerator";

// Add this to your form state

const categories = [
  "Technology & Gadgets",
  "Fashion & Beauty",
  "Food & Restaurants",
  "Health & Fitness",
  "Education & Courses",
  "Real Estate",
  "Finance & Insurance",
  "Entertainment",
  "Travel & Tourism",
  "Business Services",
];

// Platform options with pricing
const platformOptions = [
  { value: "whatsapp", label: "WhatsApp/Telegram", rate: 6 },
  { value: "instagram", label: "Instagram", rate: 9 },
  { value: "twitter", label: "Twitter", rate: 9 },
  { value: "facebook", label: "Facebook", rate: 9 },
  { value: "ticktok", label: "Ticktok", rate: 9 },
  { value: "all", label: "All Platforms", rate: 12 },
];

// File size constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 35 * 1024 * 1024; // 35MB

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    campaignName: "",
    adText: "",
    category: "",
    targetViews: "",
    platform: "whatsapp",
    amountPaid: 0,
  });

  const [aiGeneratedVideo, setAiGeneratedVideo] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string>("");
  const [compressionInfo, setCompressionInfo] = useState<{
    needsCompression: boolean;
    currentSize: string;
    targetSize: string;
    type: "image" | "video" | "other";
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploadingToR2, setIsUploadingToR2] = useState(false);

  // AI Description Generation States
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [selectedAIDescription, setSelectedAIDescription] =
    useState<string>("");

  const { isLoading, createCampaign } = useCampaigns();
  const {
    generateDescription,
    generatedDescriptions,
    isGenerating,
    clearDescriptions,
  } = useAIDescription();

  // Calculate pricing based on platform and file type
  const pricingInfo = useMemo(() => {
    const basePlatform = platformOptions.find(
      (p) => p.value === formData.platform
    );

    let ratePerView = basePlatform?.rate || 6;

    if (fileType === "video") {
      if (formData.platform === "whatsapp") {
        ratePerView = 8;
      } else if (formData.platform === "all") {
        ratePerView = 16;
      } else {
        ratePerView = 12;
      }
    } else {
      if (formData.platform === "whatsapp") {
        ratePerView = 6;
      } else if (formData.platform === "all") {
        ratePerView = 12;
      } else {
        ratePerView = 9;
      }
    }

    const views = parseInt(formData.targetViews) || 0;
    const totalAmount = Math.round(views * ratePerView);

    return {
      ratePerView,
      views,
      totalAmount,
      platformName: basePlatform?.label || "WhatsApp/Telegram",
    };
  }, [formData.platform, formData.targetViews, fileType]);

  // Sync amount paid with pricing
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amountPaid: pricingInfo.totalAmount,
    }));
  }, [pricingInfo.totalAmount]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "targetViews" || name === "platform") {
        updated.amountPaid = pricingInfo.totalAmount;
      }
      return updated;
    });
  };

  const handlePlatformChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: value,
      amountPaid: pricingInfo.totalAmount,
    }));
  };

  // AI Description Generation Functions
  const handleAIGenerate = async () => {
    if (!formData.campaignName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both campaign name and a short description",
        variant: "destructive",
      });
      return;
    }

    await generateDescription({
      campaignName: formData.campaignName,
      shortDescription: shortDescription,
      platform: formData.platform,
      targetAudience: "Nigerian social media users",
    });
  };

  const handleUseAIDescription = (description: string) => {
    setFormData((prev) => ({ ...prev, adText: description }));
    setSelectedAIDescription(description);
    toast({
      title: "Description Applied!",
      description: "AI-generated description has been added to your campaign",
    });
  };

  const handleAIGeneratorToggle = () => {
    setShowAIGenerator(!showAIGenerator);
    if (showAIGenerator) {
      clearDescriptions();
      setShortDescription("");
      setSelectedAIDescription("");
    }
  };

  // File Upload Functions
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileSizeError("");
    setUploadError("");
    setCompressionInfo(null);
    setIsCompressing(false);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast({
        title: "Upload Failed",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }

    const detectedFileType = isImage ? "image" : "video";
    setFileType(detectedFileType);

    const compInfo = FileCompressor.getCompressionInfo(file);
    setCompressionInfo(compInfo);

    try {
      let processedFile = file;

      const maxSize =
        detectedFileType === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / 1024 / 1024;
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        throw new Error(
          `${
            detectedFileType === "image" ? "Image" : "Video"
          } size (${fileSizeMB}MB) exceeds maximum ${maxSizeMB}MB limit`
        );
      }

      if (compInfo.needsCompression && detectedFileType === "image") {
        setIsCompressing(true);
        processedFile = await FileCompressor.compressImage(file);
        setIsCompressing(false);
      }

      setUploadedFile(processedFile);
      const url = URL.createObjectURL(processedFile);
      setPreviewUrl(url);

      const finalCompInfo = FileCompressor.getCompressionInfo(processedFile);
      setCompressionInfo(finalCompInfo);

      toast({
        title: "File ready",
        description: `${
          detectedFileType === "image" ? "Image" : "Video"
        } is ready for campaign creation`,
      });
    } catch (error: any) {
      console.error("File processing error:", error);
      setFileSizeError(error.message);
      toast({
        title: "File Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    setFileType(null);
    setFileSizeError("");
    setUploadError("");
    setCompressionInfo(null);
    setUploadProgress(0);

    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    setFormData((prev) => ({
      ...prev,
      amountPaid: pricingInfo.totalAmount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campaignName.trim()) {
      toast({
        title: "Failed",
        description: "Please enter a campaign name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.targetViews || parseInt(formData.targetViews) < 50) {
      toast({
        title: "Failed",
        description: "Please enter at least 50 target views",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedFile) {
      toast({
        title: "Failed",
        description: "Please upload an ad creative",
        variant: "destructive",
      });
      return;
    }

    const finalValidation = FileCompressor.getCompressionInfo(uploadedFile);
    if (finalValidation.needsCompression) {
      toast({
        title: "File Too Large",
        description: `Please compress your ${finalValidation.type} to under ${finalValidation.targetSize}`,
        variant: "destructive",
      });
      return;
    }

    console.log("🟡 [CreateCampaign] Form submitted:", formData);

    setIsUploadingToR2(true);
    setUploadProgress(0);

    try {
      await createCampaign(formData, uploadedFile, (progress) => {
        setUploadProgress(progress);
        console.log(`📊 R2 Upload Progress: ${progress}%`);
      });
    } catch (error) {
      console.error("Campaign creation error:", error);
    } finally {
      setIsUploadingToR2(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="lg:flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Design your ad campaign to reach real users
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Sparkles className="w-4 h-4 mr-1" />
          AI Generator Available
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:flex gap-10">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6 flex-[0.6]">
          {/* Campaign Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Campaign Details
              </CardTitle>
              <CardDescription className="text-black">
                Basic information about your advertising campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  name="campaignName"
                  placeholder="e.g., Summer Sale 2024"
                  value={formData.campaignName}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              {/* Ad Message with AI Generator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adText">Ad Message *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAIGeneratorToggle}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {showAIGenerator ? "Close AI" : "AI Generate"}
                  </Button>
                </div>

                <Textarea
                  id="adText"
                  name="adText"
                  placeholder="Write the text that will appear with your ad, or use AI to generate compelling copy..."
                  value={formData.adText}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                  maxLength={600}
                  required
                />

                <p className="text-xs text-muted-foreground">
                  {formData.adText.length}/600 characters
                </p>

                {/* AI Generator Panel */}
                {showAIGenerator && (
                  <div className="p-4 border rounded-lg bg-blue-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        AI Description Generator
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">
                        Tell us about your business/campaign
                      </Label>
                      <Textarea
                        id="shortDescription"
                        placeholder="e.g., 'We sell handmade leather bags targeting young professionals in Lagos'"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        The more details you provide, the better the AI can
                        generate compelling copy
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isGenerating || !shortDescription.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Marketing Copy
                        </>
                      )}
                    </Button>

                    {/* AI Generated Results */}
                    {generatedDescriptions.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-sm">
                          Choose a version:
                        </h5>
                        {generatedDescriptions.map((version, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedAIDescription === version.description
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-primary/50"
                            }`}
                            onClick={() =>
                              handleUseAIDescription(version.description)
                            }
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {version.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {version.tone}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {version.description}
                                </p>
                              </div>
                              {selectedAIDescription === version.description ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* select category  */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select ad category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Platform Selection */}
              <div>
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={handlePlatformChange}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{platform.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            ₦{platform.rate}/view
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {fileType === "video" ? (
                    <span>
                      Video rates: WhatsApp/Telegram - ₦8/view, Other platforms
                      - ₦12/view, All platforms - ₦16/view
                    </span>
                  ) : (
                    <span>
                      Image rates: WhatsApp/Telegram - ₦6/view, Other platforms
                      - ₦9/view, All platforms - ₦12/view
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Ad Creative */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Ad Creative *
              </CardTitle>
              <CardDescription>
                {fileType === "video"
                  ? "Upload your video ad (MP4, MOV - Max 50MB)"
                  : "Upload your image ad (JPG, PNG - Max 5MB)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Progress */}
              {isUploadingToR2 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadProgress < 100
                        ? "Uploading to Cloudflare..."
                        : "Processing..."}
                    </span>
                    <span className="font-bold text-blue-800">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress
                    value={uploadProgress}
                    className="h-3 bg-blue-100"
                  />
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>
                      {uploadProgress < 20 && "Starting upload..."}
                      {uploadProgress >= 20 &&
                        uploadProgress < 80 &&
                        "Uploading your file..."}
                      {uploadProgress >= 80 &&
                        uploadProgress < 100 &&
                        "Finalizing upload..."}
                      {uploadProgress === 100 &&
                        "Upload complete! Creating campaign..."}
                    </span>
                    <span>
                      {Math.round(
                        ((uploadProgress / 100) * (uploadedFile?.size || 0)) /
                          1024 /
                          1024
                      )}
                      MB / {Math.round((uploadedFile?.size || 0) / 1024 / 1024)}
                      MB
                    </span>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="text-xs text-blue-500 text-center">
                      Estimated time: {Math.round((100 - uploadProgress) / 10)}{" "}
                      seconds remaining
                    </div>
                  )}
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Upload failed
                    </p>
                    <p className="text-xs text-red-600">{uploadError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadError("");
                        const fileInput = document.getElementById(
                          "file-upload"
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="mt-2 h-7 text-xs"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Compression Status */}
              {isCompressing && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <Spinner />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Compressing your file...
                    </p>
                    <p className="text-xs text-blue-600">
                      Optimizing for better performance
                    </p>
                  </div>
                </div>
              )}

              {/* Compression Success */}
              {compressionInfo &&
                !compressionInfo.needsCompression &&
                uploadedFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        File optimized successfully
                      </p>
                      <p className="text-xs text-green-600">
                        Size: {compressionInfo.currentSize} • Ready to upload
                      </p>
                    </div>
                  </div>
                )}

              {/* File Size Error */}
              {fileSizeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      File processing failed
                    </p>
                    <p className="text-xs text-red-600">{fileSizeError}</p>
                  </div>
                </div>
              )}

              {/* Ai video generator */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Ad Creative *
                  </CardTitle>
                  <CardDescription>
                    {/* Upload your image/video  */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Video Generator
                  <VideoGenerator
                    productName={formData.campaignName}
                    productDescription={formData.adText}
                    onVideoGenerated={setAiGeneratedVideo}
                  /> */}
                  {/* Existing file upload code... File Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative">
                          {fileType === "image" ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm object-contain"
                            />
                          ) : (
                            <video
                              src={previewUrl}
                              controls
                              className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <Badge
                            variant="secondary"
                            className="absolute top-2 left-2"
                          >
                            {fileType === "image" ? "IMAGE" : "VIDEO"}
                          </Badge>
                          {compressionInfo && (
                            <Badge
                              variant="outline"
                              className={`absolute top-2 right-2 ${
                                compressionInfo.needsCompression
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <Compass className="w-3 h-3 mr-1" />
                              {compressionInfo.currentSize}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {uploadedFile?.name}
                          {compressionInfo && (
                            <span className="ml-2">
                              • {compressionInfo.currentSize}
                              {compressionInfo.needsCompression && (
                                <span className="text-amber-600">
                                  {" "}
                                  (needs compression)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearFile}
                          className="mx-auto"
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove {fileType === "image" ? "Image" : "Video"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Image</p>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              Max 5MB
                            </p>
                          </div>
                          <div className="text-center">
                            <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Video</p>
                            <p className="text-xs text-muted-foreground">
                              MP4, MOV
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              Max 50MB
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Images automatically compressed to 5MB • Videos
                            limited to 50MB
                          </p>
                        </div>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          required
                        />
                        <Label htmlFor="file-upload" className="mx-auto block">
                          <div className="flex bg-primary text-white justify-center py-3 px-4 lg:w-[30%] w-[50%] rounded-xl mx-auto items-center cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isCompressing || isUploading ? (
                              <Spinner />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            <p>
                              {isCompressing
                                ? "Compressing..."
                                : isUploading
                                ? "Uploading..."
                                : "Choose File"}
                            </p>
                          </div>
                        </Label>
                        {!previewUrl && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>• Large images are automatically compressed</p>
                            <p>• Videos up to 50MB are supported</p>
                            {/* <p>• All files optimized for mobile viewing</p> */}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Show AI generated video if available */}
                  {aiGeneratedVideo && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">AI Video Ready!</span>
                      </div>
                      <video
                        src={aiGeneratedVideo}
                        controls
                        className="w-full rounded-lg max-h-48 object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAiGeneratedVideo("")}
                        className="mt-2"
                      >
                        Remove AI Video
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="space-y-6 flex-[0.4]">
          {/* Campaign Price Calculator */}
          <Card className="shadow-card top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Campaign Price
                </div>
                <Link href="/pricing/advertiser">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Info className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetViews">Target Views *</Label>
                <Input
                  id="targetViews"
                  name="targetViews"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.targetViews}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="50"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Platform:</span>
                  <span className="font-medium">
                    {pricingInfo.platformName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ad Type:</span>
                  <span className="font-medium">
                    {fileType === "video" ? "Video Ad" : "Image Ad"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate per view:</span>
                  <span className="font-medium">
                    ₦{pricingInfo.ratePerView}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target views:</span>
                  <span>{pricingInfo.views.toLocaleString()}</span>
                </div>

                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Price:</span>
                  <span className="text-primary">
                    ₦{pricingInfo.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-2">
                <p>• You only pay for verified views</p>
                <p>• Ad runs till target views are reached</p>
                <p>• Payment required to activate campaign</p>
                {fileType === "video" && (
                  <>
                    <p className="text-blue-600 font-medium">
                      • Video ads get higher engagement
                    </p>
                    <p className="text-blue-600">
                      • WhatsApp/Telegram: ₦2/view • Other: ₦12/view • All:
                      ₦15/view
                    </p>
                  </>
                )}
                {fileType === "image" && (
                  <>
                    <p className="text-green-600 font-medium">
                      • Image ads are cost-effective
                    </p>
                    <p className="text-green-600">
                      • WhatsApp/Telegram: ₦5/view • Other: ₦7.5/view • All:
                      ₦10/view
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {formData.campaignName && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium text-sm">{formData.campaignName}</p>
                  {formData.adText && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-6">
                      {formData.adText}
                    </p>
                  )}
                  {previewUrl && fileType === "image" && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full mt-2 rounded border max-h-24 object-cover"
                    />
                  )}
                  {previewUrl && fileType === "video" && (
                    <div className="relative mt-2">
                      <video
                        src={previewUrl}
                        className="w-full rounded border max-h-24 object-cover"
                        muted
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-1">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="p-5">
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    isCompressing ||
                    isUploadingToR2 ||
                    !!fileSizeError ||
                    !uploadedFile ||
                    !formData.campaignName.trim() ||
                    !formData.targetViews ||
                    parseInt(formData.targetViews) < 50
                  }
                  className="bg-gradient-to-r flex w-full from-primary to-accent"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {isUploadingToR2 ? (
                    `Uploading... ${uploadProgress}%`
                  ) : !isLoading ? (
                    "Create Campaign & Upload"
                  ) : (
                    <Roller />
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  You'll be redirected to payment after campaign reservation
                </p>
              </div>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}
