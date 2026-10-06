// app/blog/[slug]/BlogContent.tsx - CLIENT COMPONENT
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditBlogButton } from "./EditBlogButton";

type BlogContentProps = {
  blog: any;
  formattedDate: string;
  readingTime: number;
};

export default function BlogContent({
  blog,
  formattedDate,
  readingTime,
}: BlogContentProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 100000); // 2 minutes = 120000 ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Ready to Skyrocket Your Lead Generation?
            </DialogTitle>
            <DialogDescription className="text-lg">
              Don't let poor ad performance hold your business back any longer.
              Implement these proven strategies and watch your leads pour in.
              Start creating high-converting campaigns today!
            </DialogDescription>
          </DialogHeader>

          <Link href="/dashboard/advertiser/campaigns/create">
            <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
              Launch Your Winning Campaign Now
            </Button>
          </Link>
        </DialogContent>
      </Dialog>

      {/* Modern Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/blog"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Blogs</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Edit Button - Only show if user can edit */}
              <EditBlogButton blog={blog} />

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Rest of your blog page content */}
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-12">
          {/* Category and Metadata */}
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
            {blog.category && (
              <Badge variant="secondary" className="font-medium">
                {blog.category}
              </Badge>
            )}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {blog.views || 0} views
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed font-light">
              {blog.excerpt}
            </p>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-4 py-6 border-y border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {blog.author?.username ||
                  blog.author?.email ||
                  "Unknown Author"}
              </p>
              <p className="text-gray-500 text-sm">Author</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={1200}
              height={630}
              className="w-full h-auto lg:h-[500px] lg:object-contain"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="flex gap-12">
          {/* Main Content */}
          <div className="lg:flex-[0.8] flex-1 lg:col-span-8">
            <div className="prose prose-lg max-w-none">
              <div
                className="text-gray-700 leading-relaxed text-lg"
                style={{
                  fontSize: "1.125rem",
                  lineHeight: "1.75",
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    typeof blog.content === "string"
                      ? blog.content.replace(/\n/g, "<br/>")
                      : String(blog.content),
                }}
              />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Share this article
              </h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Tweet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:flex-[0.3]">
            <div className="hidden lg:block sticky top-24 space-y-8">
              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">
                  Ready to generate new leads?
                </h3>
                <Link
                  href={"/dashboard/advertiser/campaigns/create"}
                  className="space-y-3"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              More from seltra
            </h2>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder for related articles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4"></div>
              <Badge variant="secondary" className="mb-3">
                Advertising
              </Badge>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                Maximizing Your Social Media ROI
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                Learn how to get the most out of your social media advertising
                budget.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl mb-4"></div>
              <Badge variant="secondary" className="mb-3">
                Monetization
              </Badge>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                The Future of Digital Content Monetization
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                Explore emerging trends in content monetization and creator
                economy.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-4"></div>
              <Badge variant="secondary" className="mb-3">
                Strategy
              </Badge>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                Building Your Personal Brand Online
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                Essential strategies for building a strong personal brand in the
                digital space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Generate new leads?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of brands who are already winning with seltra. Start
            your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/advertiser/campaigns/create">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Create Campaign
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
