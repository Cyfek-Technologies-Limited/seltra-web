"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileCheck,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Roller } from "@/components/ui/ReusableComponents";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingClaim {
  id: string;
  amount: number;
  views: number;
  proofImages?: string[];
  proofUrls?: string[];
  claimedAt: string;
  extractedViews?: number;
  approvedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  publisher: {
    user: {
      email: string;
      username?: string;
      createdAt: string;
    };
    account?: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      isVerified?: boolean;
    } | null;
    strikes: Array<{
      id: string;
    }>;
  };
  campaign: {
    id: string;
    title: string;
    platform: string;
    views: number;
    targetViews: number;
    user: {
      email: string;
      username?: string;
    };
  };
}

interface Props {
  initialClaims: PendingClaim[];
  user: any;
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

type ClaimStatusFilter = "PENDING" | "APPROVED" | "REJECTED";

const ITEMS_PER_PAGE = 50;

export default function ClientClaimsComponent({
  initialClaims,
  initialPagination,
}: Props) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [claims, setClaims] = useState<PendingClaim[]>(initialClaims || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<PendingClaim | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [statusFilter, setStatusFilter] =
    useState<ClaimStatusFilter>("PENDING");

  const [pagination, setPagination] = useState(
    initialPagination || {
      page: 1,
      limit: ITEMS_PER_PAGE,
      total: initialClaims?.length || 0,
      pages: 1,
    }
  );

  const loadClaims = async (page = pagination.page, status = statusFilter) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        status,
      });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${BASE_URL}/admin/claims?${params.toString()}`,
        {
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load claims");
      }

      const data = await response.json();

      setClaims(data.data.claims || []);
      setPagination(
        data.data.pagination || {
          page,
          limit: ITEMS_PER_PAGE,
          total: 0,
          pages: 1,
        }
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed",
        description: "Failed to load claims",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims(1, statusFilter);
  }, [statusFilter]);

  const handleApproveClaim = async (claimId: string) => {
    try {
      setIsProcessing(claimId);

      const response = await fetch(
        `${BASE_URL}/admin/claims/${claimId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ notes: "Approved by admin" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Successful",
          description: "Claim approved and payment initiated!",
        });

        setShowDetailsDialog(false);
        setSelectedClaim(null);
        await loadClaims(pagination.page, statusFilter);
      } else {
        const error = await response.json();
        toast({
          title: "Failed",
          description: error.error || "Failed to approve claim",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed",
        description: "Failed to approve claim",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    const rejectionReason = prompt("Enter rejection reason:");
    if (!rejectionReason) return;

    try {
      setIsProcessing(claimId);

      const response = await fetch(
        `${BASE_URL}/admin/claims/${claimId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ claimId, rejectionReason }),
        }
      );

      if (response.ok) {
        toast({
          title: "Successful",
          description: "Claim rejected successfully",
        });

        setShowDetailsDialog(false);
        setSelectedClaim(null);
        await loadClaims(pagination.page, statusFilter);
      } else {
        const error = await response.json();
        toast({
          title: "Failed",
          description: error.error || "Failed to reject claim",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed",
        description: "Failed to reject claim",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredClaims = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return claims;

    return claims.filter((claim) => {
      return (
        claim.campaign.title.toLowerCase().includes(q) ||
        claim.publisher.user.email.toLowerCase().includes(q) ||
        (claim.publisher.user.username || "").toLowerCase().includes(q)
      );
    });
  }, [claims, searchQuery]);

  const openClaim = (claim: PendingClaim) => {
    setSelectedClaim(claim);
    setShowDetailsDialog(true);
  };

  const getBadgeVariant = (status: PendingClaim["status"]) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Claims Review
            </h1>
            <p className="text-muted-foreground">
              View claims at a glance, filter by status, and click any row to
              see full details.
            </p>
          </div>

          <Badge variant="outline" className="text-sm px-3 py-1">
            {pagination.total} Total
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by campaign or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => loadClaims(pagination.page, statusFilter)}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["PENDING", "APPROVED", "REJECTED"] as ClaimStatusFilter[]).map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status.toLowerCase()}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Roller />
        </div>
      ) : filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg font-medium mb-2">
              No Claims Found
            </CardTitle>
            <p className="text-muted-foreground">
              No claims match this filter or search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Claims Table</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 font-medium">
                        Campaign
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Publisher
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Claimed Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr
                        key={claim.id}
                        onClick={() => openClaim(claim)}
                        className="border-b hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {claim.campaign.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {claim.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>{claim.publisher.user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {claim.publisher.user.username || "No username"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant={getBadgeVariant(claim.status)}
                            className="capitalize"
                          >
                            {claim?.status?.toLowerCase()}
                          </Badge>
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(claim.claimedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      loadClaims(pagination.page - 1, statusFilter)
                    }
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() =>
                      loadClaims(pagination.page + 1, statusFilter)
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedClaim && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedClaim.campaign.title}</DialogTitle>
                    <DialogDescription>
                      Full claim details and moderation actions
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-5 space-y-3">
                          <h3 className="font-semibold text-base">
                            Claim Summary
                          </h3>
                          <Separator />
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">
                                {formatCurrency(selectedClaim.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Views</p>
                              <p className="font-medium">
                                {selectedClaim.views} /{" "}
                                {selectedClaim.campaign.targetViews}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <Badge
                                variant={getBadgeVariant(selectedClaim.status)}
                              >
                                {selectedClaim.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Claimed At
                              </p>
                              <p className="font-medium">
                                {formatDate(selectedClaim.claimedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Approved At
                              </p>
                              <p className="font-medium">
                                {formatDate(selectedClaim.approvedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Paid At</p>
                              <p className="font-medium">
                                {formatDate(selectedClaim.paidAt)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-5 space-y-3">
                          <h3 className="font-semibold text-base">Publisher</h3>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="font-medium">
                                {selectedClaim.publisher.user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Username</p>
                              <p className="font-medium">
                                {selectedClaim.publisher.user.username || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Strikes</p>
                              <p className="font-medium">
                                {selectedClaim.publisher.strikes.length}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-5 space-y-3">
                          <h3 className="font-semibold text-base">
                            Campaign Details
                          </h3>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Campaign</p>
                              <p className="font-medium">
                                {selectedClaim.campaign.title}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Platform</p>
                              <p className="font-medium">
                                {selectedClaim.campaign.platform}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Advertiser
                              </p>
                              <p className="font-medium">
                                {selectedClaim.campaign.user.email}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-5 space-y-3">
                          <h3 className="font-semibold text-base">
                            Bank Details
                          </h3>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Bank Name</p>
                              <p className="font-medium">
                                {selectedClaim.publisher.account?.bankName ||
                                  "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Account Number
                              </p>
                              <p className="font-medium">
                                {selectedClaim.publisher.account
                                  ?.accountNumber || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Account Name
                              </p>
                              <p className="font-medium">
                                {selectedClaim.publisher.account?.accountName ||
                                  "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Verified</p>
                              <p className="font-medium">
                                {selectedClaim.publisher.account?.isVerified
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {!!selectedClaim.proofImages?.length && (
                      <Card>
                        <CardContent className="p-5 space-y-3">
                          <h3 className="font-semibold text-base">
                            Proof Image
                          </h3>
                          <Separator />
                          <Image
                            src={selectedClaim.proofImages[0]}
                            alt="Proof"
                            width={800}
                            height={500}
                            className="rounded-lg border w-full max-w-2xl object-cover"
                          />
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      <Button variant="outline" asChild>
                        <Link
                          href={`/dashboard/admin/claims/${selectedClaim.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>

                      {selectedClaim.status === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectClaim(selectedClaim.id)}
                            disabled={isProcessing === selectedClaim.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>

                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveClaim(selectedClaim.id)}
                            disabled={isProcessing === selectedClaim.id}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
