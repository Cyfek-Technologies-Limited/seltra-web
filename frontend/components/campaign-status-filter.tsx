"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CampaignStatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  // stats: {
  //   total: number;
  //   active: number;
  //   pending: number;
  //   completed: number;
  // };
}

const statusOptions = [
  { value: "all", label: "All", key: "total" },
  { value: "active", label: "Active", key: "active" },
  { value: "proof_pending", label: "Pending Review", key: "pending" },
  { value: "completed", label: "Completed", key: "completed" },
] as const;

export function CampaignStatusFilter({
  selectedStatus,
  onStatusChange,
}: CampaignStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => {
        // const count = stats[option.key]
        const isSelected = selectedStatus === option.value;

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(option.value)}
            className={cn("flex items-center gap-2", isSelected && "shadow-sm")}
          >
            {option.label}
            <Badge
              variant={isSelected ? "secondary" : "outline"}
              className="text-xs px-1.5 py-0.5"
            >
              count
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
