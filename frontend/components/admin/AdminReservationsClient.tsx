// components/admin/AdminReservationsClient.tsx (new file)
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface ExpiredReservation {
  id: string;
  reservationId: string;
  title: string;
  description?: string;
  targetViews: number;
  platform: string;
  amountPaid: number;
  expiresAt: string;
  createdAt: string;
  user: {
    email: string;
    username?: string;
  };
}

export default function AdminReservationsClient() {
  const BASE_URL = "http://localhost:3001/api/v1";
  const { user, userLoading } = useAuth();
  const [reservations, setReservations] = useState<ExpiredReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (user?.roles?.includes("admin")) {
      loadExpiredReservations();
    }
  }, [user]);

  const loadExpiredReservations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/admin/reservations/expired`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.data.reservations);
      }
    } catch (error) {
      console.error("Failed to load expired reservations:", error);
      toast({
        title: "Missing Information",
        description: "Failed to load expired reservations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReservation = (reservationId: string) => {
    setSelectedReservations((prev) =>
      prev.includes(reservationId)
        ? prev.filter((id) => id !== reservationId)
        : [...prev, reservationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReservations.length === reservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(reservations.map((r) => r.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReservations.length === 0) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${BASE_URL}/admin/reservations/expired`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reservationIds: selectedReservations }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Sucessfull",
          description: `Deleted ${data.data.deletedCount} expired reservations`,
        });
        setSelectedReservations([]);
        await loadExpiredReservations();
      } else {
        const error = await response.json();
        toast({
          title: "Missing Information",
          description: "Failed to delete reservations",
          variant: "destructive",
        });
        const data = await response.json();
        toast({
          title: "Missing Information",
          description: `Deleted ${data.data.deletedCount} expired reservations`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Missing Information",
        description: "Failed to delete reservations",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getHoursAgo = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  };

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
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

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Expired Reservations
            </h1>
            <p className="text-muted-foreground">
              Clean up expired campaign reservations to free up system
              resources.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {reservations.length} Expired
            </Badge>
            {selectedReservations.length > 0 && (
              <Button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                variant="destructive"
                className="flex items-center gap-2 text-white"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected ({selectedReservations.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {reservations.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={
                    selectedReservations.length === reservations.length &&
                    reservations.length > 0
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Select all {reservations.length} reservations
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedReservations.length} of {reservations.length} selected
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservations List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Roller />
        </div>
      ) : reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg font-medium mb-2">
              No Expired Reservations
            </CardTitle>
            <p className="text-muted-foreground">
              All reservations are currently active or have been processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card
              key={reservation.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedReservations.includes(reservation.id)}
                    onChange={() => handleSelectReservation(reservation.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                  />

                  {/* Reservation Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {reservation.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reservation.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {reservation.platform}
                        </Badge>
                        <Badge variant="destructive">Expired</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(reservation.amountPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Views</p>
                        <p className="font-medium">
                          {reservation.targetViews.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expired</p>
                        <div className="flex items-center gap-1 font-medium text-red-600">
                          <Clock className="h-4 w-4" />
                          {getHoursAgo(reservation.expiresAt)}h ago
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Advertiser</p>
                        <div className="flex items-center gap-1 font-medium">
                          <User className="h-4 w-4" />
                          {reservation.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            Reservation Expired
                          </p>
                          <p className="text-sm text-amber-700">
                            Created {formatDate(reservation.createdAt)} •
                            Expired {formatDate(reservation.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
