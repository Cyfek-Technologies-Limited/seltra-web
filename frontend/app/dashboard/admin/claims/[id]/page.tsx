// app/dashboard/admin/claims/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Eye,
  Users,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Shield,
  Banknote,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import { toast } from "@/hooks/use-toast";

export default function ClaimDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userLoading } = useAuth();
  const [claim, setClaim] = useState<ClaimDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const claimId = params.id as string;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    if (user?.roles?.includes("admin")) {
      loadClaimDetails();
    }
  }, [user, claimId]);

  const loadClaimDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/admin/claims/${claimId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Claim", data);
        setClaim(data.data.claim);
      } else {
        toast({
          title: "Failed to load claim details",
          description: "Please try again later",
          variant: "destructive",
        });
        router.push("/dashboard/admin/claims");
      }
    } catch (error) {
      console.error("Failed to load claim details:", error);
      toast({
        title: "Failed to load claim details",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClaim = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${BASE_URL}/admin/claims/${claimId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ notes: "Approved via claim details page" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Claim Approved",
          description: "Claim approved and payment initiated successfully",
        });
        await loadClaimDetails(); // Refresh data
        router.push("/dashboard/admin/claims");
      } else {
        const error = await response.json();
        toast({
          title: "Approval Failed",
          description: error.error || "Failed to approve claim",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve claim",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClaim = async () => {
    const reason = prompt("Enter rejection reason:");
    console.log("rejection reason:", reason);
    if (!reason) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        `${BASE_URL}/admin/claims/${claimId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ claimId, reason }),
        }
      );

      if (response.ok) {
        toast({
          title: "Claim Rejected",
          description: "Claim has been rejected successfully",
        });
        await loadClaimDetails(); // Refresh data
        router.push("/dashboard/admin/claims");
      } else {
        const error = await response.json();
        toast({
          title: "Rejection Failed",
          description: error.error || "Failed to reject claim",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject claim",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending Review" },
      APPROVED: { variant: "default" as const, label: "Approved" },
      PAID: { variant: "success" as const, label: "Paid" },
      REJECTED: { variant: "destructive" as const, label: "Rejected" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant="outline">{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      WARNING: { variant: "outline" as const, label: "Warning" },
      STRIKE: { variant: "destructive" as const, label: "Strike" },
      SUSPENSION: { variant: "destructive" as const, label: "Suspension" },
    };

    const config =
      severityConfig[severity as keyof typeof severityConfig] ||
      severityConfig.WARNING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
  }

  if (!user?.roles?.includes("admin")) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Admin Access Required
          </h3>
          <p className="text-muted-foreground">
            You need admin privileges to view claim details.
          </p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Claim Not Found
          </h3>
          <Button onClick={() => router.push("/dashboard/admin/claims")}>
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/claims")}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pending Claims
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                Claim Details
              </h1>
              {getStatusBadge(claim.status)}
            </div>
            <p className="text-muted-foreground text-lg">
              Comprehensive analytics and information for claim review
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleApproveClaim}
              disabled={isProcessing || claim.status !== "PENDING"}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve & Pay
                </div>
              )}
            </Button>

            <Button
              onClick={handleRejectClaim}
              disabled={isProcessing || claim.status !== "PENDING"}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="publisher" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Publisher
          </TabsTrigger>
          <TabsTrigger value="campaign" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaign
          </TabsTrigger>
          <TabsTrigger value="proof" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Proof & Evidence
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Claim Amount
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(claim.amount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  30% of campaign amount
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Reported Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {claim.views.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {claim.extractedViews &&
                    `Extracted: ${claim.extractedViews.toLocaleString()}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Publisher Strikes
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {claim.publisher.strikes.filter((s) => !s.resolvedAt).length}
                </div>
                <p className="text-xs text-muted-foreground">Active strikes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Claim Date
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(claim.claimedAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted for review
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Campaign Target
                  </span>
                  <span className="font-medium">
                    {claim.campaign.targetViews.toLocaleString()} views
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Campaign Progress
                  </span>
                  <span className="font-medium">
                    {Math.min(
                      (claim.campaign.views / claim.campaign.targetViews) * 100,
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Publisher Contribution
                  </span>
                  <span className="font-medium">
                    {((claim.views / claim.campaign.targetViews) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Campaign Amount
                  </span>
                  <span className="font-medium">
                    {formatCurrency(claim.campaign.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Publisher Share (30%)
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(claim.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Publisher Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Earnings
                  </span>
                  <span className="font-medium">
                    {formatCurrency(claim.publisher.earnings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Available Balance
                  </span>
                  <span className="font-medium">
                    {formatCurrency(claim.publisher.account.availableBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Account Verified
                  </span>
                  <Badge variant="secondary">
                    {claim.publisher.account.isVerified
                      ? "Verified"
                      : "Pending"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Publisher Since
                  </span>
                  <span className="font-medium">
                    {new Date(
                      claim.publisher.user.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Publisher Tab */}
        <TabsContent value="publisher" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Publisher Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="font-medium">{claim.publisher.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Username
                  </p>
                  <p className="font-medium">
                    {claim.publisher.user.username || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {claim.publisher.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge
                      variant={
                        claim.publisher.strikes.length >= 3
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {claim.publisher.strikes.length >= 3
                        ? "Suspended"
                        : "Active"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="font-medium">
                    {formatDate(claim.publisher.user.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {claim.publisher.account.bankName ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Bank Name
                      </p>
                      <p className="font-medium">
                        {claim.publisher.account.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Account Number
                      </p>
                      <p className="font-medium">
                        {claim.publisher.account.accountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Account Name
                      </p>
                      <p className="font-medium">
                        {claim.publisher.account.accountName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Verification Status
                      </p>
                      <Badge variant="secondary">
                        {claim.publisher.account.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bank details provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Strike History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Strike History
                <Badge variant="outline" className="ml-2">
                  {claim.publisher.strikes.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claim.publisher.strikes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No strikes recorded</p>
                  <p className="text-sm">This publisher has a clean record</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claim.publisher.strikes.map((strike) => (
                    <div
                      key={strike.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getSeverityBadge(strike.severity)}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(strike.issuedAt)}
                          </span>
                          {strike.resolvedAt && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700"
                            >
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{strike.reason}</p>
                        {strike.evidence && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Evidence: {JSON.stringify(strike.evidence)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Tab */}
        <TabsContent value="campaign" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Title
                  </p>
                  <p className="font-medium">{claim.campaign.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{claim.campaign.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Platform
                    </p>
                    <p className="font-medium capitalize">
                      {claim.campaign.platform}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge variant="outline">{claim.campaign.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Target Views
                    </p>
                    <p className="font-medium">
                      {claim.campaign.targetViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Views
                    </p>
                    <p className="font-medium">
                      {claim.campaign.views.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Advertiser
                  </p>
                  <p className="font-medium">
                    {claim.campaign.user.email} (
                    {claim.campaign.user.username || "No username"})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p className="font-medium">
                    {formatDate(claim.campaign.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Campaign Budget
                  </span>
                  <span className="font-medium">
                    {formatCurrency(claim.campaign.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Publisher Share (30%)
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(claim.amount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Platform Revenue (70%)
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(claim.campaign.amountPaid - claim.amount)}
                  </span>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Revenue Breakdown</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Publisher Earnings</span>
                      <span className="text-green-600">30%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform Revenue</span>
                      <span className="text-blue-600">70%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Creative */}
          {claim.campaign.adCreative && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Ad Creative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.campaign.adCreative.fileUrl && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Creative Image
                      </p>
                      <img
                        src={claim.stampedCreativeUrl}
                        alt="Ad creative"
                        className="max-w-full rounded-lg border max-h-64 object-contain"
                      />
                    </div>
                  )}
                  {claim.campaign.adCreative.text && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Ad Text
                      </p>
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        {claim.campaign.adCreative.text}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Proof & Evidence Tab */}
        <TabsContent value="proof" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Submitted Proof Images ({claim.proofImages?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claim.proofImages?.map((imageUrl, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                          onClick={() => window.open(imageUrl, "_blank")}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(imageUrl, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = imageUrl;
                            link.download = `proof-${claim.id}-${
                              index + 1
                            }.jpg`;
                            link.click();
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {(!claim.proofImages || claim.proofImages.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No proof images submitted</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Social Media Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claim.proofUrl ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Post URL
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-blue-600 w-[90%] overflow-scroll scrollbar-hide bg-gray-200"
                        onClick={() => window.open(claim.proofUrl, "_blank")}
                      >
                        {claim.proofUrl}
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">
                        Verification Checklist
                      </p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Verify the post URL is accessible</li>
                        <li>• Check if the post contains campaign content</li>
                        <li>• Confirm view count matches claimed amount</li>
                        <li>• Ensure post is from the correct platform</li>
                        <li>• Verify post date is within campaign period</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No post URL provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* View Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                View Count Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {claim.views.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Claimed Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {claim.extractedViews
                      ? claim.extractedViews.toLocaleString()
                      : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Extracted Views
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {claim.extractedViews
                      ? Math.abs(
                          claim.views - claim.extractedViews
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    View Discrepancy
                  </p>
                </div>
              </div>
              {claim.extractedViews && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Discrepancy Notice
                      </p>
                      <p className="text-sm text-amber-700">
                        There is a{" "}
                        {Math.abs(
                          claim.views - claim.extractedViews
                        ).toLocaleString()}{" "}
                        view difference between claimed and extracted counts.
                        {Math.abs(claim.views - claim.extractedViews) >
                          claim.views * 0.2 &&
                          " This exceeds the 20% allowed variance."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
