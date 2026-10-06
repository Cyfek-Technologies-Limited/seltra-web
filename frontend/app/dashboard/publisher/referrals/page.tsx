"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, Share2, Calendar, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

interface ReferralStats {
  code: string | null;
  totalUses: number;
  totalEarnings: number;
  recentReferrals: Array<{
    id: string;
    referredUser: {
      email: string;
      username: string | null;
      createdAt: string;
    };
    publisherEarned: number;
    userBonus: number;
    createdAt: string;
  }>;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const localStorageToken = localStorage.getItem("auth-token");
      if (localStorageToken) {
        headers["Authorization"] = `Bearer ${localStorageToken}`;
      }

      const response = await fetch(`${BASE_URL}/publisher/referrals`, {
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[referal data response]:", data);

      if (data.data) {
        setReferralCode(data.data.referral.code || "");
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to load referral data:", error);
      toast({
        title: "Login Failed",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      setGenerating(true);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const localStorageToken = localStorage.getItem("auth-token");
      if (localStorageToken) {
        headers["Authorization"] = `Bearer ${localStorageToken}`;
      }
      const response = await fetch(`${BASE_URL}/publisher/referrals/generate`, {
        method: "POST",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setReferralCode(data.data.code);
      await loadReferralData(); // Reload to get updated stats
      toast({
        title: "Copied!",
        description: "Referral code generated successfully!",
      });
    } catch (error: any) {
      console.error("Failed to generate referral code:", error);
      toast({
        title: "Copied!",
        description: "Failed to generate referral code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) return;

    const link = `https://seltra.app/auth/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard!",
    });
  };

  const shareReferral = () => {
    if (!referralCode) return;

    const text = `Join Seltra and earn money from your social media! Use my referral code ${referralCode} to get ₦300 bonus when you sign up! 🚀`;
    const link = `https://seltra.app/auth/signup?ref=${referralCode}`;

    if (navigator.share) {
      navigator.share({
        title: "Join Seltra - Earn Money from Social Media",
        text: text,
        url: link,
      });
    } else {
      copyReferralLink();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Loading referral data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto  py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground">
          Invite friends and earn ₦500 for each successful referral
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Referral Code Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share your code to earn ₦500 for every friend who joins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {referralCode ? (
              <>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold bg-primary/10 py-6 rounded-lg border-2 border-primary/20">
                    {referralCode}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share this code and earn ₦500 when someone signs up
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={copyReferralLink}
                    className="flex-1"
                    size="lg"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={shareReferral}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Your Referral Link:
                  </p>
                  <p className="text-sm text-blue-700 break-all">
                    https://seltra.app/auth/signup?ref={referralCode}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="bg-muted rounded-lg p-6">
                  <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Referral Code Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate your unique referral code to start earning ₦500 per
                    referral
                  </p>
                  <Button
                    onClick={generateReferralCode}
                    size="lg"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Generating...
                      </>
                    ) : (
                      "Generate Referral Code"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Total Referrals</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                {stats?.totalUses || 0}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Total Earned</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                ₦{stats?.totalEarnings || 0}
              </Badge>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-green-800 mb-2">
                Earnings Potential
              </p>
              <p className="text-xs text-green-700 space-y-1">
                <div>5 referrals = ₦2,500</div>
                <div>10 referrals = ₦5,000</div>
                <div>20 referrals = ₦10,000</div>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>
              People who signed up using your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
              <div className="space-y-3">
                {stats.recentReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {referral.referredUser.email}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(referral.referredUser.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        +₦{referral.publisherEarned}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet</p>
                <p className="text-sm">
                  Start sharing your code to see referrals here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How The Referral Program Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Share Your Code</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code with friends, family, or on
                social media
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                New users get ₦300 welcome bonus when they sign up with your
                code
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">You Earn ₦500</h3>
              <p className="text-sm text-muted-foreground">
                Instantly receive ₦500 in your available balance for each
                referral
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
