import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminStatsProps {
  title: string
  value: number
  icon: LucideIcon
  description: string
  variant?: "default" | "pending" | "approved" | "rejected"
}

export function AdminStats({ title, value, icon: Icon, description, variant = "default" }: AdminStatsProps) {
  const variantStyles = {
    default: "border-border",
    pending: "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50",
    approved: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50",
    rejected: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50",
  }

  const iconStyles = {
    default: "text-muted-foreground",
    pending: "text-yellow-600 dark:text-yellow-400",
    approved: "text-green-600 dark:text-green-400",
    rejected: "text-red-600 dark:text-red-400",
  }

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
  )
}
