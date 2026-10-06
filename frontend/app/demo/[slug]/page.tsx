// app/demo/[slug]/page.tsx
import { notFound } from "next/navigation";
import {
  Play,
  Clock,
  Download,
  CheckCircle,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with API call
const moduleData = {
  id: "3",
  title: "How to Create Your First Campaign",
  description:
    "Complete guide to creating effective ad campaigns on seltra platform",
  slug: "create-campaign",
  duration: 600,
  videoUrl: "/demo/videos/create-campaign.mp4",
  isFree: true,
  resources: [
    {
      title: "Campaign Creation Checklist",
      type: "pdf",
      url: "/resources/checklist.pdf",
    },
    {
      title: "Best Practices Guide",
      type: "pdf",
      url: "/resources/best-practices.pdf",
    },
  ],
  category: {
    name: "For Advertisers",
    slug: "for-advertisers",
  },
};

const relatedModules = [
  {
    id: "4",
    title: "Setting Campaign Budget & Targeting",
    slug: "campaign-targeting",
    duration: 480,
    isFree: true,
  },
  {
    id: "5",
    title: "Tracking Campaign Performance",
    slug: "campaign-analytics",
    duration: 540,
    isFree: true,
  },
];

export default function TutorialModulePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // In real implementation, fetch module data based on slug
  //   if (slug !== moduleData.slug) {
  //     notFound();
  //   }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/demo"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Badge variant="secondary">{moduleData.category.name}</Badge>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Mark as Complete
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Progress */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Course Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Current Module
                      </span>
                      <span className="text-sm font-medium">1/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "10%" }}
                      ></div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
                  <div className="space-y-2">
                    {moduleData.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                      >
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {resource.title}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {resource.type}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Video Player */}
              <div className="aspect-video bg-black relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-blue-700 transition-colors">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-lg">
                      Click to play tutorial video
                    </p>
                  </div>
                </div>
              </div>

              {/* Module Info */}
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant={moduleData.isFree ? "default" : "secondary"}
                    className={
                      moduleData.isFree
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {moduleData.isFree ? "FREE" : "PREMIUM"}
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">10 min</span>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {moduleData.title}
                </h1>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {moduleData.description}
                </p>

                {/* Learning Objectives */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Step-by-step campaign creation process
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Best practices for ad targeting
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Budget optimization techniques
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Common mistakes to avoid
                    </li>
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                  <Button variant="outline" disabled>
                    Previous Lesson
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Next Lesson
                    <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Modules */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Related Tutorials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedModules.map((module) => (
                  <Card
                    key={module.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          FREE
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {Math.floor(module.duration / 60)}m
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {module.title}
                      </h4>
                      <Link
                        href={`/demo/${module.slug}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Start Watching
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
