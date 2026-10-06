// components/admin/admin-leaderboard.tsx - UPDATED
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Users, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  email: string;
  totalReferrals: number;
  rank: number;
  prizeAmount?: number;
  joinDate: string;
}

export function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/v1/leaderboard");
      const result = await response.json();

      if (result.status === 200) {
        setLeaderboard(result.data.fullLeaderboard || []);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const exportToCSV = () => {
    const headers = ["Rank", "Username", "Email", "Referrals", "Join Date"];
    const csvData = leaderboard.map((entry) => [
      entry.rank,
      entry.username,
      entry.email,
      entry.totalReferrals,
      new Date(entry.joinDate).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral-leaderboard-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-amber-100 border-amber-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Referral Leaderboard (Admin)
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshLeaderboard}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 ${getRankColor(
                entry.rank
              )}`}
            >
              <div className="flex-shrink-0">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    entry.rank === 1
                      ? "bg-yellow-500 text-white"
                      : entry.rank === 2
                      ? "bg-gray-500 text-white"
                      : entry.rank === 3
                      ? "bg-amber-600 text-white"
                      : "bg-blue-500 text-white"
                  } font-bold text-lg`}
                >
                  {entry.rank}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{entry.username}</p>
                  {entry.rank === 1 && (
                    <Badge className="bg-green-100 text-green-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Leader
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{entry.email}</p>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {entry.totalReferrals} referrals
                  </span>
                  <span>
                    Joined: {new Date(entry.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {entry.rank === 1 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ₦100,000
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Potential Prize
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No referral data available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
