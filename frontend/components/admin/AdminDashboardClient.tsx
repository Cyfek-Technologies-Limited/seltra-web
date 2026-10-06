"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileCheck,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Eye,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";

// Interfaces (copy from original page.tsx)
interface AdminStats {
  totalPublishers: number;
  totalAdvertisers: number;
  totalCampaigns: number;
  pendingClaims: number;
  approvedClaims: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  platformProfit: number;
  expiredReservations: number;
}

interface RecentAction {
  id: string;
  actionType: string;
  description: string;
  adminEmail: string;
  createdAt: string;
}

const AdminDashboardClient = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { user, userLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.roles?.includes("admin")) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/admin/dashboard`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("admin data", data);
        setStats(data.data.stats);
        setRecentActions(data.data.recentActions);
        console.log("loaded admin dashboard:", data);
      }
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
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

  if (userLoading || isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (!user?.roles?.includes("admin")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Admin Access Required
          </h3>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const sendPromotionalEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/admin/send-promotional-emails`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }
      );
      const data = await response.json();
      setResult(data);
      toast({
        title: "Email Sent",
        description: data.message,
      });
    } catch (error) {
      setResult({ error: "Failed to send emails" });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage publishers, claims, and platform analytics.
          </p>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Send Promotional Emails</h1>
          <button
            onClick={sendPromotionalEmails}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Emails"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Claims
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingClaims || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
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
              {stats?.totalPublishers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active publishers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.platformProfit
                ? formatCurrency(stats.platformProfit)
                : "₦0"}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expired Reservations
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.expiredReservations || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need cleanup</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild className="h-auto py-4">
                  <Link
                    href="/dashboard/admin/claims"
                    className="flex flex-col items-center gap-2"
                  >
                    <FileCheck className="h-6 w-6" />
                    <span>Review Claims</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.pendingClaims || 0} pending
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4">
                  <Link
                    href="/dashboard/admin/publishers"
                    className="flex flex-col items-center gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span>Manage Publishers</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.totalPublishers || 0} total
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4">
                  <Link
                    href="/dashboard/admin/publishers"
                    className="flex flex-col items-center gap-2"
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span>View Advertisers</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.totalAdvertisers || 0} total
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4">
                  <Link
                    href="/dashboard/admin/reservations"
                    className="flex flex-col items-center gap-2"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span>Clean Reservations</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.expiredReservations || 0} expired
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent actions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActions?.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {action.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By {action.adminEmail} •{" "}
                          {new Date(action.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {action.actionType.replace("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Paystack API</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Payments</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pending Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {stats?.pendingWithdrawals || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Withdrawal requests pending
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/dashboard/admin/withdrawals">
                    Manage Withdrawals
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Campaigns
                </span>
                <span className="font-medium">
                  {stats?.totalCampaigns || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Approved Claims
                </span>
                <span className="font-medium text-green-600">
                  {stats?.approvedClaims || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Advertisers
                </span>
                <span className="font-medium">
                  {stats?.totalAdvertisers || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardClient;
