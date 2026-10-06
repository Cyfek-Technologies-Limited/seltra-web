"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CampaignFiltersProps {
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Fashion", label: "Fashion" },
  { value: "Technology", label: "Technology" },
  { value: "Health & Fitness", label: "Health & Fitness" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Travel & Tourism", label: "Travel & Tourism" },
  { value: "Travel", label: "Travel" },
  { value: "Education & Courses", label: "Education & Courses" },
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
];

export function CampaignFilters({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}: CampaignFiltersProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <RadioGroupItem value={category.value} id={category.value} />
                <Label
                  htmlFor={category.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
