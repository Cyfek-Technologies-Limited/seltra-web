// components/admin/AdminUsersClient.tsx (new file)
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  Search,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Eye,
  Phone,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import Link from "next/link";
import { handleDelete, handleGet } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  phone: string;
  username?: string;
  createdAt: string;
  roles: string[];
  isPublisher: boolean;
  isAdvertiser: boolean;
  publisherStats?: {
    verified: boolean;
    totalEarnings: number;
    age: string;
    gender: string;
    location: string;
    occupation: string;
    activeStrikes: number;
    totalClaims: number;
    availableBalance?: number;
  } | null;
  advertiserStats?: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpent: number;
    completedCampaigns: number;
  } | null;
}

type UserRoleFilter = "all" | "publisher" | "advertiser";
type BalanceFilter = "all" | "3000plus";

export default function AdminUsersClient() {
  const { user, userLoading } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPublishers: 0,
    totalAdvertisers: 0,
    totalStriked: 0,
    highBalanceCount: 0,
    totalPayoutReady: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all");
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState({
    username: "",
    totalEarnings: 0,
    availableBalance: 0,
  });
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const pageSize = 50;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch users when page/filters change
  useEffect(() => {
    if (user?.roles?.includes("admin")) {
      fetchUsers();
    }
  }, [currentPage, roleFilter, debouncedSearch, balanceFilter, user]);

  // Update edit form
  useEffect(() => {
    if (selectedUser) {
      setEditingData({
        username: selectedUser.username || "",
        totalEarnings: selectedUser.publisherStats?.totalEarnings || 0,
        availableBalance: selectedUser.publisherStats?.availableBalance || 0,
      });
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      let url = `admin/users?page=${currentPage}&limit=${pageSize}`;
      if (roleFilter !== "all") url += `&role=${roleFilter}`;
      if (debouncedSearch)
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (balanceFilter === "3000plus") url += "&minBalance=3000";
      const data = await handleGet(url);
      console.log("FilteredUsers:", data.data?.users);
      setFilteredUsers(data.data?.users || []);
      setTotalPages(data.data?.pagination.pages || 1);
      setStats(data.data?.stats || stats);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    setIsEditing(true);
    try {
      const response = await fetch(
        `${BASE_URL}/admin/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingData),
          credentials: "include",
        }
      );
      if (response.ok) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const getRoleBadges = (user: User) => (
    <>
      {user.isPublisher && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <UserCheck className="h-3 w-3 mr-1" />
          Publisher
        </Badge>
      )}
      {user.isAdvertiser && (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          Advertiser
        </Badge>
      )}
    </>
  );

  const getPublisherStats = (user: User) => {
    if (!user.isPublisher) return null;
    const stats = user.publisherStats;
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
          <div>
            <p className="text-muted-foreground">Total Earnings</p>
            <p className="font-medium text-green-600 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(stats?.totalEarnings || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Available Balance</p>
            <p className="font-medium text-blue-600 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(stats?.availableBalance || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Claims</p>
            <p className="font-medium">{stats?.totalClaims || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant={stats?.verified ? "default" : "secondary"}>
              {stats?.verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>

        {/* publisher data  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{stats?.location || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p className="font-medium">{stats?.gender || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Age</p>
            <p className="font-medium">{stats?.age || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Occupation</p>
            <p className="font-medium">{stats?.occupation || 0}</p>
          </div>
        </div>
      </>
    );
  };

  const handleDeleteUser = async (id: string) => {
    if (!id) {
      toast({
        title: "No id",
        description: "Invalid id",
        variant: "destructive",
      });
      return;
    }
    const res = await handleDelete(`${BASE_URL}/admin/users/${id}`);
    console.log("Delete response", res);
    if (res.status === 200) {
      toast({
        title: "Deleted Successfully",
        description: "User has been deleted",
      });
      fetchUsers(); // Refetch after delete
    } else {
      toast({
        title: "Delete not Successful",
        description: "User could not be deleted",
        variant: "destructive",
      });
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <Roller />
      </div>
    );
  }

  if (!user?.roles?.includes("admin")) {
    return (
      <div className="container mx-auto px-4 py-8 text-center py-20">
        <h3 className="text-lg font-medium">Admin Access Required</h3>
        <p className="text-muted-foreground mt-2">
          You need admin privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage publishers and advertisers • Edit balances • Monitor
              payouts
            </p>
          </div>
          {/* Stats Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge
              variant="outline"
              className="text-lg px-4 py-1.5 bg-purple-50"
            >
              {stats.totalUsers} Total
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-1.5 bg-blue-50">
              {stats.totalPublishers} Publishers
            </Badge>
            <Badge
              variant="outline"
              className="text-lg px-4 py-1.5 bg-green-50"
            >
              {stats.totalAdvertisers} Advertisers
            </Badge>
            {stats.highBalanceCount > 0 && (
              <>
                <Badge
                  variant="outline"
                  className="text-lg px-4 py-1.5 bg-amber-50 text-amber-800 font-semibold"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  {stats.highBalanceCount} Users ≥ ₦3k
                </Badge>
                <Badge
                  variant="default"
                  className="text-lg px-5 py-2 bg-emerald-600 text-white font-bold"
                >
                  <DollarSign className="h-5 w-5 mr-1" />
                  {formatCurrency(stats.totalPayoutReady)} Ready for Payout
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by email or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRoleFilter)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Users</option>
              <option value="publisher">Publishers Only</option>
              <option value="advertiser">Advertisers Only</option>
            </select>
            <select
              value={balanceFilter}
              onChange={(e) =>
                setBalanceFilter(e.target.value as BalanceFilter)
              }
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Any Balance</option>
              <option value="3000plus">Available ≥ ₦3,000</option>
            </select>
            <Button variant="outline" onClick={fetchUsers} className="w-full">
              Refresh List
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Users Found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || roleFilter !== "all" || balanceFilter !== "all"
                ? "Try adjusting your filters"
                : "No users registered yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user.username || user.email}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Phone className="h-4 w-4 " />
                            {user.phone}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {getRoleBadges(user)}
                            {(user.publisherStats?.availableBalance || 0) >=
                              3000 && (
                              <Badge
                                variant="default"
                                className="bg-amber-100 text-amber-800"
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                ≥₦3k Balance
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                      {user.isPublisher && getPublisherStats(user)}
                      {user.publisherStats?.activeStrikes > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                          <p className="font-medium text-red-800 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {user.publisherStats.activeStrikes} Active Strike(s)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* admin action buttons */}
                    <div className="flex flex-col gap-2 lg:w-48 ">
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="outline"
                        size="sm"
                        className="w-full bg-red-500 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Delete User
                      </Button>
                      {user.isPublisher && (
                        <Button variant="outline" size="sm" className="w-full">
                          View Claims
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedUser(user)}
                      >
                        Edit Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      {/* Edit Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(o) => !o && setSelectedUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editingData.username}
                onChange={(e) =>
                  setEditingData((p) => ({ ...p, username: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            {selectedUser?.isPublisher && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalEarnings" className="text-right">
                    Total Earnings
                  </Label>
                  <Input
                    id="totalEarnings"
                    type="number"
                    value={editingData.totalEarnings}
                    onChange={(e) =>
                      setEditingData((p) => ({
                        ...p,
                        totalEarnings: Number(e.target.value) || 0,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="availableBalance" className="text-right">
                    Available Balance
                  </Label>
                  <Input
                    id="availableBalance"
                    type="number"
                    value={editingData.availableBalance}
                    onChange={(e) =>
                      setEditingData((p) => ({
                        ...p,
                        availableBalance: Number(e.target.value) || 0,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit} disabled={isEditing}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
