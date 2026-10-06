"use client";

import type { Notification } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  // Map database types to display types
  const getDisplayType = (
    type: string
  ): "deadline" | "approval" | "campaign" | "general" => {
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

  const getTypeIcon = (type: string) => {
    const displayType = getDisplayType(type);
    switch (displayType) {
      case "deadline":
        return <AlertTriangle className="h-4 w-4" />;
      case "approval":
        return <CheckCircle className="h-4 w-4" />;
      case "campaign":
        return <Bell className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const displayType = getDisplayType(type);
    switch (displayType) {
      case "deadline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "approval":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "campaign":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleCardClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const displayType = getDisplayType(notification.type);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border-l-4",
        getPriorityColor(notification.priority),
        !notification.read && "bg-blue-50/30 dark:bg-blue-950/20"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon and Type Badge */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className={cn(
                  "p-1.5 rounded-full",
                  getTypeColor(notification.type)
                    .replace("text-", "bg-")
                    .replace("800", "200")
                    .replace("200", "100")
                )}
              >
                {getTypeIcon(notification.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                  {displayType}
                </Badge>
                {notification.priority === "high" && (
                  <Badge variant="destructive" className="text-xs">
                    High Priority
                  </Badge>
                )}
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>

              <h4
                className={cn(
                  "font-medium text-sm mb-1",
                  !notification.read && "font-semibold"
                )}
              >
                {notification.title}
              </h4>

              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                {notification.message}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(notification.created_at)}
                </div>

                {notification.action_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
