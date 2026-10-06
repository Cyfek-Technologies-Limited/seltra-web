// components/BlogSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogSearchProps {
  onSearchResults?: (results: any[]) => void;
  placeholder?: string;
}

export default function BlogSearch({
  onSearchResults,
  placeholder = "Search blogs...",
}: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/blogs/search?q=${encodeURIComponent(searchQuery)}`
      );
      const result = await response.json();

      if (result.success) {
        setResults(result.data.blogs);
        setShowResults(true);
        onSearchResults?.(result.data.blogs);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && query.length >= 2) {
      router.push(`/blog/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/blog/${slug}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
        />
        <button
          type="submit"
          disabled={loading || query.length < 2}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
          {results.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleResultClick(blog.slug)}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <h4 className="font-semibold text-gray-900 line-clamp-1">
                {blog.title}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {blog.excerpt}
              </p>
              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                <span>By {blog.author.username || blog.author.email}</span>
                <span>•</span>
                <span>{blog.views} views</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 p-4">
          <p className="text-gray-500 text-center">
            No blogs found matching "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
