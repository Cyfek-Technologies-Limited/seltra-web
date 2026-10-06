// app/demo/page.tsx
import Link from "next/link";
import {
  Play,
  Clock,
  CheckCircle,
  Lock,
  Download,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data - replace with actual API calls
const tutorialData = {
  categories: [
    {
      id: "1",
      name: "Getting Started",
      description: "Learn the basics of seltra platform",
      slug: "getting-started",
      modules: [
        {
          id: "1",
          title: "Welcome to seltra - Platform Overview",
          description: "Introduction to seltra and how it works",
          slug: "platform-overview",
          duration: 300, // 5 minutes
          isFree: true,
          videoUrl: "/demo/videos/welcome.mp4",
          resources: [],
          progress: 100,
        },
        {
          id: "2",
          title: "Creating Your Account & Profile Setup",
          description: "Step-by-step guide to setting up your account",
          slug: "account-setup",
          duration: 420, // 7 minutes
          isFree: true,
          videoUrl: "/demo/videos/account-setup.mp4",
          resources: [],
          progress: 100,
        },
      ],
    },
    {
      id: "2",
      name: "For Advertisers",
      description: "Learn how to create and manage campaigns",
      slug: "for-advertisers",
      modules: [
        {
          id: "3",
          title: "How to Create Your First Campaign",
          description: "Complete guide to creating effective ad campaigns",
          slug: "create-campaign",
          duration: 600, // 10 minutes
          isFree: true,
          videoUrl: "/demo/videos/create-campaign.mp4",
          resources: [
            {
              title: "Campaign Checklist",
              type: "pdf",
              url: "/resources/checklist.pdf",
            },
          ],
          progress: 75,
        },
        {
          id: "4",
          title: "Setting Campaign Budget & Targeting",
          description:
            "Learn how to optimize your ad spend and reach the right audience",
          slug: "campaign-targeting",
          duration: 480, // 8 minutes
          isFree: true,
          videoUrl: "/demo/videos/targeting.mp4",
          resources: [],
          progress: 50,
        },
        {
          id: "5",
          title: "Tracking Campaign Performance",
          description: "Monitor and analyze your campaign results",
          slug: "campaign-analytics",
          duration: 540, // 9 minutes
          isFree: true,
          videoUrl: "/demo/videos/analytics.mp4",
          resources: [],
          progress: 0,
        },
      ],
    },
    {
      id: "3",
      name: "For Publishers",
      description: "Learn how to monetize your digital space",
      slug: "for-publishers",
      modules: [
        {
          id: "6",
          title: "Connecting Your Social Media Accounts",
          description: "How to link and verify your social media platforms",
          slug: "connect-accounts",
          duration: 360, // 6 minutes
          isFree: true,
          videoUrl: "/demo/videos/connect-accounts.mp4",
          resources: [],
          progress: 100,
        },
        {
          id: "7",
          title: "How to Upload Proof of Ad Display",
          description: "Step-by-step guide to submitting ad proof",
          slug: "upload-proof",
          duration: 420, // 7 minutes
          isFree: true,
          videoUrl: "/demo/videos/upload-proof.mp4",
          resources: [
            {
              title: "Proof Guidelines",
              type: "pdf",
              url: "/resources/guidelines.pdf",
            },
          ],
          progress: 25,
        },
        {
          id: "8",
          title: "Withdrawing Your Earnings",
          description: "Complete guide to withdrawing your funds",
          slug: "withdraw-funds",
          duration: 480, // 8 minutes
          isFree: true,
          videoUrl: "/demo/videos/withdraw-funds.mp4",
          resources: [],
          progress: 0,
        },
      ],
    },
    {
      id: "4",
      name: "Advanced Features",
      description: "Master advanced platform features",
      slug: "advanced-features",
      modules: [
        {
          id: "9",
          title: "Advanced Targeting Strategies",
          description: "Learn expert targeting techniques for better ROI",
          slug: "advanced-targeting",
          duration: 720, // 12 minutes
          isFree: false,
          videoUrl: "/demo/videos/advanced-targeting.mp4",
          resources: [],
          progress: 0,
        },
        {
          id: "10",
          title: "Optimizing Ad Performance",
          description: "Techniques to improve your ad conversion rates",
          slug: "optimize-performance",
          duration: 600, // 10 minutes
          isFree: false,
          videoUrl: "/demo/videos/optimize-performance.mp4",
          resources: [],
          progress: 0,
        },
      ],
    },
  ],
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

export default function DemoPage() {
  const totalModules = tutorialData.categories.reduce(
    (acc, category) => acc + category.modules.length,
    0
  );
  const completedModules = tutorialData.categories.reduce(
    (acc, category) =>
      acc + category.modules.filter((module) => module.progress === 100).length,
    0
  );
  const progressPercentage = (completedModules / totalModules) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Course Content */}
      <section className="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Course Contents
                </h3>
                <div className="space-y-1">
                  {tutorialData.categories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        {category.name}
                      </div>
                      {category.modules.map((module) => (
                        <Link
                          key={module.id}
                          href={`/demo/${module.slug}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            {module.progress === 100 ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : module.progress > 0 ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-1">
                              {module.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDuration(module.duration)}
                              {module.progress > 0 && module.progress < 100 && (
                                <>
                                  <span>•</span>
                                  <span>{module.progress}% complete</span>
                                </>
                              )}
                            </div>
                          </div>
                          {!module.isFree && (
                            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Your Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Course Completion</span>
                      <span className="font-medium text-gray-900">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  <div className="text-center">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {tutorialData.categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  </div>

                  {/* Modules Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.modules.map((module) => (
                        <Card
                          key={module.id}
                          className="hover:shadow-md transition-shadow cursor-pointer group"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <Badge
                                variant={
                                  module.isFree ? "default" : "secondary"
                                }
                                className={
                                  module.isFree
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }
                              >
                                {module.isFree ? "FREE" : "PREMIUM"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {formatDuration(module.duration)}
                              </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {module.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {module.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Link
                                  href={`/demo/${module.slug}`}
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  <Play className="w-4 h-4" />
                                  {module.progress === 100
                                    ? "Watch Again"
                                    : "Start Watching"}
                                </Link>
                                {module.resources.length > 0 && (
                                  <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
                                    <Download className="w-4 h-4" />
                                    Resources
                                  </button>
                                )}
                              </div>

                              {module.progress > 0 && (
                                <div className="flex items-center gap-2">
                                  {module.progress === 100 ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  )}
                                  <span className="text-sm font-medium text-gray-700">
                                    {module.progress}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {module.progress > 0 && module.progress < 100 && (
                              <div className="mt-3">
                                <Progress
                                  value={module.progress}
                                  className="h-1"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Master seltra?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their digital
              advertising and monetization strategies with our comprehensive
              tutorials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Learning Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Explore All Courses
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
