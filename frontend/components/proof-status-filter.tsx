"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProofStatusFilterProps {
  selectedStatus: string
  onStatusChange: (status: string) => void
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

const statusOptions = [
  { value: "all", label: "All", key: "total" },
  { value: "pending", label: "Pending", key: "pending" },
  { value: "approved", label: "Approved", key: "approved" },
  { value: "rejected", label: "Rejected", key: "rejected" },
] as const

export function ProofStatusFilter({ selectedStatus, onStatusChange, stats }: ProofStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => {
        const count = stats[option.key]
        const isSelected = selectedStatus === option.value

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(option.value)}
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
  )
}
