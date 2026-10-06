import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  variant?: "default" | "active" | "pending" | "completed";
}

export function DashboardStats({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: DashboardStatsProps) {
  const variantStyles = {
    default: "border-border",
    active:
      "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50",
    pending:
      "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50",
    completed:
      "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    active: "text-blue-600 dark:text-blue-400",
    pending: "text-yellow-600 dark:text-yellow-400",
    completed: "text-green-600 dark:text-green-400",
  };

  return (
    <Card className={cn("transition-colors", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <Icon className={cn("h-8 w-8", iconStyles[variant])} />
        </div>
      </CardContent>
    </Card>
  );
}
