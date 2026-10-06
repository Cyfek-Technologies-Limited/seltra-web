// app/blog/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Eye,
  FileText,
  Image as ImageIcon,
  Tag,
  FolderOpen,
  Sparkles,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  "Advertising",
  "Monetization",
  "Social Media",
  "Business",
  "Technology",
  "Marketing",
  "Entrepreneurship",
  "Digital Strategy",
];

export default function CreateBlogPage() {
  const { user, userLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    published: false,
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!user) {
  //   router.push("/auth/login");
  //   return null;
  // }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "content") {
      setCharCount(value.length);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Upload Failed",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Upload Failed",
          description: "Please upload an image file (JPG, PNG, WebP)",
          variant: "destructive",
        });
        return;
      }

      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      toast({
        title: "Upload successful",
        description: "Cover image uploaded successfully",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Failed",
          description: "Please enter a blog title",
          variant: "destructive",
        });
        return;
      }

      if (!formData.content.trim() || formData.content.length < 100) {
        toast({
          title: "Failed",
          description: "Blog content must be at least 100 characters",
          variant: "destructive",
        });
        return;
      }

      if (!coverImage) {
        toast({
          title: "Failed",
          description: "Please upload a cover image",
          variant: "destructive",
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("tags", formData.tags);
      formDataToSend.append("published", formData.published.toString());
      formDataToSend.append("coverImage", coverImage);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token from localStorage for iPhone compatibility
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/blogs/create`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.status === 201) {
        toast({
          title: "Success!",
          description: result.message,
        });
        router.push(`/blog/${result.data.slug}`);
      } else {
        toast({
          title: "Failed",
          description: result.message || "Failed to create blog post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Blog Post
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Share your insights about digital advertising and monetization with
            the seltra community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:flex gap-8">
          {/* Left Column - Form */}
          <div className="lg:flex-[0.7] space-y-6">
            {/* Blog Details Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Blog Content
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Craft your blog post with engaging content
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base font-semibold">
                    Blog Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., How to Monetize Your WhatsApp Status in 2024"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-2 h-12 text-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-base font-semibold">
                    Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    placeholder="A brief summary of your blog post that will appear in listings..."
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="mt-2 min-h-[80px] resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.excerpt.length}/200 characters
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="content"
                      className="text-base font-semibold"
                    >
                      Blog Content *
                    </Label>
                    <span className="text-sm text-gray-500">
                      {charCount} characters
                    </span>
                  </div>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your amazing content here... Share insights, tips, and strategies about digital advertising and monetization."
                    value={formData.content}
                    onChange={handleInputChange}
                    className="mt-2 min-h-[300px] resize-none font-sans text-base leading-relaxed"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 100 characters required
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories & Tags Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Categories & Tags
                </CardTitle>
                <CardDescription>
                  Help readers discover your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="digital, advertising, monetization, africa"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:flex-[0.3] space-y-6">
            {/* Cover Image Upload */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Cover Image *
                </CardTitle>
                <CardDescription>
                  Upload an eye-catching cover image for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-white">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg shadow-sm mx-auto"
                      />
                      <div className="text-sm text-gray-600">
                        {coverImage?.name} (
                        {coverImage && coverImage.size / 1024 / 1024 < 1
                          ? `${Math.round(coverImage.size / 1024)}KB`
                          : `${(coverImage.size / 1024 / 1024).toFixed(1)}MB`}
                        )
                      </div>

                      <Label
                        htmlFor="cover-image-upload"
                        className="mx-auto block"
                      >
                        <div
                          onClick={() => {
                            setCoverImage(null);
                            setPreviewUrl("");
                          }}
                          className="flex bg-red-600 text-white justify-center py-2 px-4 rounded-lg mx-auto items-center cursor-pointer hover:bg-red-700 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Image
                        </div>
                      </Label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Click to upload cover image
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          JPG, PNG, WebP up to 5MB
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="cover-image-upload"
                        required
                      />
                      <Label
                        htmlFor="cover-image-upload"
                        className="mx-auto block"
                      >
                        <div className="flex bg-blue-600 text-white justify-center py-3 px-6 rounded-lg mx-auto items-center cursor-pointer hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </div>
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publish Settings */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Publish Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        published: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="published"
                    className="text-sm text-yellow-800"
                  >
                    Publish immediately (Admin users only)
                  </Label>
                </div>

                <div className="text-xs text-gray-600 space-y-2">
                  <p className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Written by: {user?.email}
                  </p>
                  <p>• All posts are subject to admin review</p>
                  <p>• Non-admin posts require approval</p>
                  <p>• You can save drafts for later</p>
                </div>
              </CardContent>
            </Card>

            {/* Preview & Submit */}
            <Card className="shadow-lg border-0 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  Quick Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.title && (
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                    <h3 className="font-bold text-gray-900 line-clamp-2">
                      {formData.title}
                    </h3>
                    {formData.excerpt && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {formData.excerpt}
                      </p>
                    )}
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full mt-3 rounded border max-h-32 object-cover"
                      />
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        By {user?.email}
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Blog Post...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Blog Post
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your post will be reviewed before publication
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
