// app/blog/[slug]/EditBlogButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";

interface EditBlogButtonProps {
  blog: {
    id: string;
    authorId: string;
    slug: string;
  };
}

export function EditBlogButton({ blog }: EditBlogButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      // Navigate to edit page - authentication will be checked there
      router.push(`/blog/${blog.slug}/edit`);
    } catch (error) {
      console.error("Error navigating to edit page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2"
      onClick={handleEdit}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Edit className="w-4 h-4" />
      )}
      Edit
    </Button>
  );
}
