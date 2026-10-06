// app/admin/tutorials/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Video, FileText, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { toast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
  videoUrl: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  videoUrl: string;
  thumbnail: string;
  lessons: Lesson[];
  _count: {
    lessons: number;
    resources: number;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  modules: Module[];
}

export default function AdminTutorialsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "categories" | "modules" | "lessons"
  >("categories");

  // Form toggles
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);

  // Forms
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0,
  });

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    order: 0,
    isFree: true,
    isPublished: false,
    duration: 0,
    videoUrl: "",
    thumbnail: "",
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    moduleId: "",
    order: 0,
    duration: 0,
    videoUrl: "",
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      const token = localStorage.getItem("auth-token");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/admin/tutorials/categories`, {
        method: "GET",
        headers,
        credentials: "include",
        cache: "no-store",
      });

      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        throw new Error(result.message || "Failed to load tutorials");
      }
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      toast({
        title: "Error",
        description: "Failed to load tutorials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/admin/tutorials/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      const result = await res.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        setShowCategoryForm(false);
        setCategoryForm({ name: "", description: "", order: 0 });
        fetchTutorials();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/admin/tutorials/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleForm),
      });

      const result = await res.json();

      if (result.success) {
        toast({ title: "Success", description: "Module created successfully" });
        setShowModuleForm(false);
        setModuleForm({
          title: "",
          description: "",
          categoryId: "",
          order: 0,
          isFree: true,
          isPublished: false,
          duration: 0,
          videoUrl: "",
          thumbnail: "",
        });
        fetchTutorials();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      });
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/admin/tutorials/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonForm),
      });

      const result = await res.json();

      if (result.success) {
        toast({ title: "Success", description: "Lesson created successfully" });
        setShowLessonForm(false);
        setLessonForm({
          title: "",
          content: "",
          moduleId: "",
          order: 0,
          duration: 0,
          videoUrl: "",
        });
        fetchTutorials();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = async (file: File, type: "video" | "thumbnail") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch(`${BASE_URL}/admin/tutorials/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        if (type === "video") {
          setModuleForm((prev) => ({ ...prev, videoUrl: result.data.url }));
        } else {
          setModuleForm((prev) => ({ ...prev, thumbnail: result.data.url }));
        }
        toast({ title: "Success", description: "File uploaded successfully" });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-center">Loading tutorials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tutorial Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage categories, modules, and lessons
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" /> New Category
              </Button>
              <Button onClick={() => setShowModuleForm(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> New Module
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {["categories", "modules", "lessons"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "categories" && (
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {category.name}
                      <Badge variant="outline">Order: {category.order}</Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Modules ({category.modules.length})
                    </h4>
                    {category.modules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {module.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {module._count.lessons} lessons •{" "}
                              {module._count.resources} resources
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              module.isPublished ? "default" : "secondary"
                            }
                          >
                            {module.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge
                            variant={module.isFree ? "default" : "secondary"}
                          >
                            {module.isFree ? "Free" : "Premium"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
