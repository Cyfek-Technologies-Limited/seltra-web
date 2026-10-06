// app/dashboard/advertiser/campaigns/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Share2,
  Download,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import { toast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  platform: string;
  targetViews: number;
  views: number;
  amountPaid: number;
  createdAt: string;
  completedAt: string | null;
  paymentStatus: string;
  adCreative: {
    fileUrl: string;
    text: string;
  } | null;
  category: string;
}

interface PublisherEarning {
  id: string;
  publisher: {
    user: {
      email: string;
      username: string | null;
    };
    verified: boolean;
  };
  views: number;
  amount: number;
  status: string;
  claimedAt: string;
  approvedAt: string | null;
  proofImages: string[];
  proofUrls: string[];
}

interface CampaignAnalytics {
  totalPublishers: number;
  totalViews: number;
  totalSpent: number;
  completionRate: number;
  averageViewsPerPublisher: number;
  publishersByStatus: {
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
  };
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userLoading } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [publishers, setPublishers] = useState<PublisherEarning[]>([]);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activePublisher, setActivePublisher] = useState(null);

  const campaignId = params.id as string;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  useEffect(() => {
    loadCampaignDetails();
  }, [user, campaignId]);

  const loadCampaignDetails = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // 🔥 IPHONE FIX: Add Authorization header from localStorage if available
      const localStorageToken = localStorage.getItem("auth-token");
      if (localStorageToken) {
        console.log("📱 Using localStorage token for iPhone");
        headers["Authorization"] = `Bearer ${localStorageToken}`;
      }

      const response = await fetch(
        `${BASE_URL}/publisher/campaigns/${campaignId}`, // Note: Confirm if path should be /campaigns/${campaignId} instead—see note below
        {
          method: "GET",
          headers,
          credentials: "include", // Keep for cookie fallback
        }
      );
      console.log("response", response);

      if (response.ok) {
        const data = await response.json();
        console.log("campaign data", data);
        setCampaign(data.data.campaign);
        setPublishers(data.data.publishers);
        setAnalytics(data.data.analytics);
        setIsLoading(false);
      } else {
        toast({
          title: "Task Failed",
          description: "Failed to load campaign details",
          variant: "destructive",
        });
        setIsLoading(false);
        router.push("/dashboard/advertiser/campaigns/my-campaigns");
      }
    } catch (error) {
      console.error("Failed to load campaign details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load campaign details",
        variant: "destructive",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
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
      PENDING: { variant: "secondary" as const, label: "Pending" },
      ACTIVE: { variant: "default" as const, label: "Active" },
      COMPLETED: { variant: "success" as const, label: "Completed" },
      PAUSED: { variant: "outline" as const, label: "Paused" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant="default">{config.label}</Badge>;
  };

  const getClaimStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending", icon: Clock },
      APPROVED: {
        variant: "default" as const,
        label: "Approved",
        icon: CheckCircle,
      },
      PAID: { variant: "success" as const, label: "Paid", icon: CheckCircle },
      REJECTED: {
        variant: "destructive" as const,
        label: "Rejected",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
  }

  if (!user?.roles.includes("advertiser")) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Advertiser Access Required
          </h3>
          <p className="text-muted-foreground">
            You need to be an advertiser to view campaign details.
          </p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container lg:px-4 py-8 ">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Campaign Not Found
          </h3>
          <Button
            onClick={() =>
              router.push("/dashboard/advertiser/campaigns/my-campaigns")
            }
          >
            Back to My Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() =>
            router.push("/dashboard/advertiser/campaigns/my-campaigns")
          }
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Campaigns
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl Capitalize font-bold text-foreground">
                {campaign.title}
              </h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2 w-[65%]">
              {campaign.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full lg:grid-cols-4 grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="publishers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Publishers
            {analytics && (
              <Badge variant="secondary" className="ml-2">
                {analytics.totalPublishers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.views.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {campaign.targetViews.toLocaleString()} target
                </p>
                <div className="mt-2 w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (campaign.views / campaign.targetViews) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Publishers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalPublishers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.publishersByStatus.approved || 0} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Amount Spent
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(campaign?.amountPaid || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(campaign.amountPaid)} total paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.completionRate
                    ? `${analytics.completionRate}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Campaign progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Publishers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Publishers
              </CardTitle>
              <CardDescription>
                Publishers who have recently claimed this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publishers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No publishers have claimed this campaign yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishers.slice(0, 5).map((publisher) => (
                    <div
                      key={publisher.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium">
                            {publisher.publisher.user.username ||
                              publisher.publisher.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {publisher.views.toLocaleString()} views{" "}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getClaimStatusBadge(publisher.status)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(publisher.claimedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {publishers.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("publishers")}
                    >
                      View All Publishers ({publishers.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publishers Tab */}
        <TabsContent value="publishers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Publishers
              </CardTitle>
              <CardDescription>
                Complete list of publishers who have claimed this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publishers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Publishers Yet</p>
                  <p>
                    Publishers will appear here once they start claiming your
                    campaign
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics?.publishersByStatus.pending || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pending Review
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics?.publishersByStatus.approved || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Approved
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Paid</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {publishers.map((publisher) => (
                      <div
                        key={publisher.id}
                        className="lg:flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="lg:flex items-center gap-4 flex-1">
                          <div className="lg:flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {publisher.publisher.user.username ||
                                publisher.publisher.user.email}
                            </p>
                            {publisher.publisher.verified && (
                              <Badge variant="outline" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {publisher.views.toLocaleString()} views
                            </span>
                            {/* <span>{formatCurrency(publisher.amount)}</span> */}
                            <span>
                              Claimed {formatDate(publisher.claimedAt)}
                            </span>
                          </div>
                          {publisher.proofUrls?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {publisher.proofUrls.map((url, index) => (
                                <Button
                                  key={index}
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => window.open(url, "_blank")}
                                >
                                  View Proof {index + 1}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {getClaimStatusBadge(publisher.status)}
                          {publisher.proofImages?.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActivePublisher(publisher)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Post
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Detailed performance metrics and insights for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Views Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Views</span>
                        <span className="font-medium">
                          {campaign.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target Views</span>
                        <span className="font-medium">
                          {campaign.targetViews.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-medium">
                          {Math.min(
                            (campaign.views / campaign.targetViews) * 100,
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Publisher Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Publishers</span>
                        <span className="font-medium">
                          {analytics?.totalPublishers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Views/Publisher</span>
                        <span className="font-medium">
                          {analytics?.averageViewsPerPublisher?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-medium">
                          {analytics?.completionRate || 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Analysis */}
              {/* <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Budget</span>
                      <span className="font-medium">
                        {formatCurrency(campaign.amountPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amount Spent</span>
                      <span className="font-medium">
                        {formatCurrency(analytics?.totalSpent || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Remaining Balance</span>
                      <span className="font-medium">
                        {formatCurrency(
                          campaign.amountPaid - (analytics?.totalSpent || 0)
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cost Per View</span>
                      <span className="font-medium">
                        {campaign.views > 0
                          ? formatCurrency(
                              (analytics?.totalSpent || 0) / campaign.views
                            )
                          : formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Publisher Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics &&
                      Object.entries(analytics.publishersByStatus).map(
                        ([status, count]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm capitalize">{status}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{count}</span>
                              <div className="w-20 bg-secondary rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (count / analytics.totalPublishers) * 100
                                    }%`,
                                    backgroundColor:
                                      status === "approved"
                                        ? "#10b981"
                                        : status === "paid"
                                        ? "#8b5cf6"
                                        : status === "pending"
                                        ? "#f59e0b"
                                        : "#ef4444",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <p>{getStatusBadge(campaign.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Platform
                    </p>
                    <p className="capitalize">{campaign.platform}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p>{campaign.category || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </p>
                    <Badge variant="secondary">{campaign.paymentStatus}</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </p>
                  <p>{campaign.description}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Created
                    </p>
                  </div>
                  <p>{formatDate(campaign.createdAt)}</p>
                  {campaign.completedAt && (
                    <>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Completed
                        </p>
                      </div>
                      <p>{formatDate(campaign.completedAt)}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Ad Creative
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.adCreative ? (
                  <div className="space-y-4">
                    {campaign.adCreative.fileUrl && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Creative
                        </p>
                        <img
                          src={campaign.adCreative.fileUrl}
                          alt="Ad creative"
                          className="max-w-full rounded-lg border max-h-64 object-contain"
                        />
                      </div>
                    )}
                    {campaign.adCreative.text && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Ad Text
                        </p>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {campaign.adCreative.text}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ad creative available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {activePublisher && (
        <Dialog
          open={!!activePublisher}
          onOpenChange={() => setActivePublisher(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Proof Submissions</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Screenshots */}
              {activePublisher.proofImages?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Screenshots</h3>

                  <div className="grid grid-cols-2 gap-3">
                    {activePublisher.proofImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Proof ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer border"
                        onClick={() => window.open(img, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* URLs / Post Links */}
              {activePublisher.proofUrls?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Post Links</h3>

                  <div className="flex flex-col gap-2">
                    {activePublisher.proofUrls.map((url, i) => (
                      <Button
                        key={i}
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => window.open(url, "_blank")}
                      >
                        View Post {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setActivePublisher(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
