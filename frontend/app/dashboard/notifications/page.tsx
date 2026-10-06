"use client";

import { useState, useEffect } from "react";
import { NotificationCard } from "@/components/notification-card";
import { NotificationFilters } from "@/components/notification-filters";
import { Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

export default function NotificationsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [notifications, setNotifications] = useState<DatabaseNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: "GET",
        headers,
        credentials: "include", // This sends the HTTP-only cookie
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("notification response data", data);
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert database types to filter categories
  const getFilterCategory = (type: string): string => {
    switch (type) {
      case "PROOF_REMINDER":
      case "WITHDRAWAL_ELIGIBLE":
        return "deadline";
      case "EARNINGS_APPROVED":
      case "PROOF_SUBMITTED":
        return "approval";
      case "CAMPAIGN_CREATED":
      case "CAMPAIGN_ACCEPTED":
        return "campaign";
      case "WELCOME":
      case "SYSTEM_ALERT":
      default:
        return "general";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const filterCategory = getFilterCategory(notification.type);
    const matchesType = typeFilter === "all" || filterCategory === typeFilter;
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "read" && notification.isRead) ||
      (readFilter === "unread" && !notification.isRead);

    return matchesType && matchesRead;
  });

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch("/api/v1/notifications/read-all", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast({
          title: "All notifications marked as read",
          description: "Your notification list has been updated.",
        });
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Calculate stats based on filter categories
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    deadline: notifications.filter(
      (n) => getFilterCategory(n.type) === "deadline"
    ).length,
    approval: notifications.filter(
      (n) => getFilterCategory(n.type) === "approval"
    ).length,
    campaign: notifications.filter(
      (n) => getFilterCategory(n.type) === "campaign"
    ).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Notifications
              </h1>
              <p className="text-muted-foreground">
                Stay updated on your campaigns and deadlines
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <NotificationFilters
          selectedType={typeFilter}
          selectedRead={readFilter}
          onTypeChange={setTypeFilter}
          onReadChange={setReadFilter}
          stats={stats}
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Bell className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No notifications found
            </h3>
            <p className="text-muted-foreground">
              {typeFilter === "all" && readFilter === "all"
                ? "You're all caught up! No notifications to show."
                : "No notifications match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={{
                  id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  type: notification.type, // Pass the actual database type
                  priority: "medium", // You can calculate this based on type
                  read: notification.isRead,
                  created_at: notification.createdAt,
                  action_url: notification.actionUrl,
                }}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
