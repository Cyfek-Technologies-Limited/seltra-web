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
  Upload,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useState } from "react";
import { submitProof } from "@/lib/functions/publishers/claim";

interface PublisherCampaignCardProps {
  publisherCampaign: any;
}

export function PublisherCampaignCard({
  publisherCampaign,
}: PublisherCampaignCardProps) {
  const { isLoading } = useCampaigns();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Add null checks for all data access
  const campaign = publisherCampaign?.campaign || {};
  const status = publisherCampaign?.status || "unknown";
  const views = publisherCampaign?.views || 0;
  const earnings = publisherCampaign?.earnings || 0;
  const acceptedAt = publisherCampaign?.acceptedAt || new Date().toISOString();
  const targetViews = campaign?.targetViews || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "proof_pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="w-4 h-4" />;
      case "proof_pending":
        return <Upload className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const handleProofSubmit = async () => {
    if (!proofFile || isSubmitting || !publisherCampaign?.id) return;

    setIsSubmitting(true);
    try {
      const success = await submitProof(
        publisherCampaign.id,
        proofFile,
        "",
        views,
        setIsSubmitting,
        ""
      );

      if (success) {
        setProofFile(null);
      }
    } catch (error) {
      console.error("Failed to submit proof:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = targetViews > 0 ? (views / targetViews) * 100 : 0;

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {campaign?.title || "Untitled Campaign"}
              <Badge className={getStatusColor(status)}>
                {getStatusIcon(status)}
                {status.replace("_", " ")}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {campaign?.description || "No description provided"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Campaign Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{targetViews.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Target Views</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{views.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Your Views</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">₦{earnings.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Earnings</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {new Date(acceptedAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">Accepted</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Your Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Proof Submission */}
        {status === "active" && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4" />
              <span className="font-medium">Submit Proof</span>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={handleProofSubmit}
                disabled={!proofFile || isSubmitting || isLoading}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {isSubmitting ? "Uploading..." : "Submit Proof"}
              </Button>
            </div>
            {proofFile && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {proofFile.name}
              </p>
            )}
          </div>
        )}

        {/* Proof Status */}
        {status === "proof_pending" && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                Proof Under Review
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your proof has been submitted and is awaiting admin approval.
            </p>
          </div>
        )}

        {/* Completed Status */}
        {status === "completed" && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">
                Campaign Completed
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This campaign has been successfully completed and earnings have
              been recorded.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
