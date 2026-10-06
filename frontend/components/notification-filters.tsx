"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NotificationFiltersProps {
  selectedType: string
  selectedRead: string
  onTypeChange: (type: string) => void
  onReadChange: (read: string) => void
  stats: {
    total: number
    unread: number
    deadline: number
    approval: number
    campaign: number
  }
}

const typeOptions = [
  { value: "all", label: "All Types", key: "total" },
  { value: "deadline", label: "Deadlines", key: "deadline" },
  { value: "approval", label: "Approvals", key: "approval" },
  { value: "campaign", label: "Campaigns", key: "campaign" },
] as const

const readOptions = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
] as const

export function NotificationFilters({
  selectedType,
  selectedRead,
  onTypeChange,
  onReadChange,
  stats,
}: NotificationFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Type Filters */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Type</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => {
            const count = stats[option.key]
            const isSelected = selectedType === option.value

            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onTypeChange(option.value)}
                className={cn("flex items-center gap-2", isSelected && "shadow-sm")}
              >
                {option.label}
                <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs px-1.5 py-0.5">
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Read Status Filters */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Status</p>
        <div className="flex flex-wrap gap-2">
          {readOptions.map((option) => {
            const isSelected = selectedRead === option.value
            const count =
              option.value === "unread"
                ? stats.unread
                : option.value === "read"
                  ? stats.total - stats.unread
                  : stats.total

            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onReadChange(option.value)}
                className={cn("flex items-center gap-2", isSelected && "shadow-sm")}
              >
                {option.label}
                <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs px-1.5 py-0.5">
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
