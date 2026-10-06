"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Shield,
  Eye,
  Download,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import Link from "next/link";
import { getPublisherDashboard } from "@/lib/functions/publishers/earnings";
import { toast } from "@/hooks/use-toast";
import { PublisherDashboardSkeleton } from "@/components/skeletons/PublisherDashboardSkeleton";
import { VerifyPhoneModal } from "@/components/VerifyPhoneModal";

interface PublisherDashboardData {
  profile: {
    verified: boolean;
    platforms: any;
    userId: string;
    memberSince: Date;
    phone: string;
  };
  account: {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    isVerified: boolean;
  };
  stats: {
    totalCampaigns: number;
    availableCampaigns: number;
    totalEarnings: number;
    approvedEarnings: number;
    pendingEarnings: number;
    strikes: number;
    completionRate: number;
  };
  recentEarnings: Array<{
    id: string;
    amount: number;
    views: number;
    status: string;
    claimedAt: Date;
    campaignTitle: string;
    platform: string;
  }>;
  strikes: Array<{
    reason: string;
    severity: string;
    issuedAt: Date;
  }>;
  warnings: string | null;
}

export default function PublisherDashboard() {
  const { user, userLoading } = useAuth();
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [openVerify, setOpenVerify] = useState(false);
  // const { isLoading } = useCampaigns();
  const [dashboardData, setDashboardData] =
    useState<PublisherDashboardData | null>(null);

  useEffect(() => {
    if (user?.isPublisher) {
      loadDashboardData();
    } else if (!userLoading && !user?.isPublisher) {
      // If user is loaded but not a publisher, stop loading
      setLoadingDashboardData(false);
    }
  }, [user, userLoading]);

  const loadDashboardData = async () => {
    try {
      setLoadingDashboardData(true);
      const data = await getPublisherDashboard();
      setDashboardData(data);
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Fetch Failed",
        description: error?.message || "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingDashboardData(false);
    }
  };

  // 🔥 IPHONE FIX: Add safe data access functions
  const getSafeStats = () => {
    return (
      dashboardData?.stats || {
        totalCampaigns: 0,
        availableCampaigns: 0,
        totalEarnings: 0,
        approvedEarnings: 0,
        pendingEarnings: 0,
        strikes: 0,
        completionRate: 0,
      }
    );
  };

  const getSafeAccount = () => {
    return (
      dashboardData?.account || {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        isVerified: false,
      }
    );
  };

  const getSafeProfile = () => {
    return (
      dashboardData?.profile || {
        verified: false,
        platforms: {},
        userId: "unknown",
        memberSince: new Date(),
        phone: "+234",
      }
    );
  };

  const getSafeRecentEarnings = () => {
    return dashboardData?.recentEarnings || [];
  };

  const getSafeStrikes = () => {
    return dashboardData?.strikes || [];
  };

  const getSafeWarnings = () => {
    return dashboardData?.warnings || null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "PAID":
        return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loadingDashboardData) {
    return <PublisherDashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Please log in to view dashboard
          </h3>
        </div>
      </div>
    );
  }

  if (!user.isPublisher) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Publisher Access Required
          </h3>
          <p className="text-muted-foreground mb-4">
            You need to be a publisher to access this dashboard.
          </p>
          <Button asChild>
            <Link href="/campaigns">Explore Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Failed to load dashboard data
          </h3>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  // Use safe data access
  const stats = getSafeStats();
  const account = getSafeAccount();
  const profile = getSafeProfile();
  const recentEarnings = getSafeRecentEarnings();
  const strikes = getSafeStrikes();
  const warnings = getSafeWarnings();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl capitalize font-bold text-foreground mb-2">
          Welcome {user?.username}
        </h1>
        <p className="text-muted-foreground">
          Manage your campaigns, track earnings, and monitor your performance.
        </p>

        {!profile.verified && (
          <p className="text-red-400 text-sm">
            Note:You can only withdraw your earnings when you
            <span
              onClick={() => setOpenVerify(true)}
              className="underline cursor-pointer text-red-500 ml-1"
            >
              Verify your account
            </span>
            <VerifyPhoneModal
              open={openVerify}
              onClose={() => setOpenVerify(false)}
              phone={profile.phone}
            />
          </p>
        )}
      </div>

      {/* Warnings */}
      {warnings && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800 font-medium">{warnings}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Available Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account.availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        {/* Pending Balance */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Balance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account.pendingBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card> */}

        {/* Available Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableCampaigns}</div>
            <p className="text-xs text-muted-foreground">Ready to accept</p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Approved claims</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity & Strikes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild className="h-auto py-3">
                  <Link
                    href="/explore"
                    className="flex flex-col items-center gap-2"
                  >
                    <Target className="h-6 w-6" />
                    <span>Explore Campaigns</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.availableCampaigns} available
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-3">
                  <Link
                    href="/dashboard/publisher/campaigns/my-campaigns"
                    className="flex flex-col items-center gap-2"
                  >
                    <Eye className="h-6 w-6" />
                    <span>My Campaigns</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.totalCampaigns} total
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-3">
                  <Link
                    href="/dashboard/publisher/withdraw"
                    className="flex flex-col items-center gap-2"
                  >
                    <Download className="h-6 w-6" />
                    <span>Withdraw Funds</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(account.availableBalance)} available
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-3">
                  <Link
                    href="/dashboard/publisher/profile"
                    className="flex flex-col items-center gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span>Profile Settings</span>
                    <span className="text-sm text-muted-foreground">
                      {profile.verified ? "Verified" : "Not verified"}
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Earnings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/publisher/earnings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentEarnings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No earnings yet</p>
                  <p className="text-sm">Start by accepting campaigns</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEarnings.map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {earning.campaignTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {earning.views} views • {earning.platform}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(earning.amount)}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(earning.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(earning.claimedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile & Strikes */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email</span>

                {user.email}
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Member Since
                </span>
                <span className="text-sm font-medium">
                  {formatDate(profile.memberSince)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Earnings
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(stats.totalEarnings)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Phone Number
                </span>
                <span className="text-sm font-medium">
                  {profile.phone === "234" ? "No phone Number" : profile.phone}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Active Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.platforms || {}).map(
                    ([platform, active]) =>
                      active && (
                        <Badge
                          key={platform}
                          variant="outline"
                          className="capitalize"
                        >
                          {platform}
                        </Badge>
                      )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Strikes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
                {stats.strikes > 0 && (
                  <Badge variant="destructive">{stats.strikes}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.verified ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Profile Verified
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h1 className="text-center font-bold text-2xl">
                    Not Verified
                  </h1>
                  <p> Verify Your Phone Number via whatsapp</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Approval Rate</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                  <p className="text-xs text-muted-foreground">
                    Total Campaigns
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approvedEarnings}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
