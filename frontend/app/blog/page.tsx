"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  views: number;
  createdAt: string;
  author: {
    username: string | null;
  };
  _count: {
    comments: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function BlogPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/blogs?page=${currentPage}&limit=9`
      );
      const result = await response.json();
      console.log("blog data", result);

      if (result.status === 200) {
        setBlogs(result.data.blogs);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a colorful placeholder based on blog content
  const generatePlaceholder = (blog: Blog) => {
    // Create a deterministic color based on blog title or ID
    const colors = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-teal-500",
      "from-orange-400 to-red-500",
      "from-purple-400 to-pink-500",
      "from-teal-400 to-blue-500",
      "from-yellow-400 to-orange-500",
    ];

    // Use blog ID or title to pick a consistent color
    const colorIndex = blog.id.charCodeAt(0) % colors.length;

    // Get first letter of title for the placeholder
    const firstLetter = blog.title.charAt(0).toUpperCase();

    return { colorClass: colors[colorIndex], letter: firstLetter };
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              seltra Blog
            </h1>
            <p className="text-xl text-gray-600">
              Insights about digital advertising in Africa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">seltra Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn how to monetize your digital space and reach targeted
            audiences across Africa
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog) => {
            const placeholder = generatePlaceholder(blog);

            return (
              <article
                key={blog.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image or Placeholder Container */}
                <div className="relative h-[250px]">
                  {blog.coverImage ? (
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    // Colorful Placeholder with same dimensions as blog image
                    <div
                      className={`w-full h-full rounded-xl flex items-center justify-center bg-gradient-to-br ${placeholder.colorClass}`}
                    >
                      <div className="text-white text-center p-6">
                        <div className="text-6xl font-bold mb-2 opacity-80">
                          {placeholder.letter}
                        </div>
                        <div className="text-sm font-medium opacity-90">
                          {blog.category || "Blog Post"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Badge Overlay */}
                  {blog.category && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm rounded-full">
                        {blog.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {blog.author.username || "Anonymous"}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {blog.views} views
                    </span>
                    <span className="text-sm text-gray-500">
                      {blog._count.comments} comments
                    </span>
                  </div>

                  {/* Tags (if any) */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-500">
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? "text-white bg-blue-600 border border-blue-600"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))
              }
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {blogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for insightful content about digital advertising.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
