// app/blog/[slug]/page.tsx - SERVER COMPONENT
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getBlog(
  slug: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/blogs/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Remove cache: "no-store" for metadata generation
      // cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: "Blog not found" };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.data && result.data.title) {
      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message || "Unexpected API response format",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [GET BLOG] Fetch error:", error);
    return { success: false, message: `Fetch failed: ${error}` };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    // Await params first (Next.js 15+ uses Promise-based params)
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog.success || !blog.data) {
      return {
        title: "Blog Not Found | seltra",
        description: "The requested blog post could not be found.",
      };
    }

    const blogData = blog.data;
    const description =
      blogData.excerpt ||
      blogData.content?.substring(0, 160) ||
      "Read this blog post on seltra";

    return {
      title: `${blogData.title} | seltra Blog`,
      description,
      openGraph: {
        title: blogData.title,
        description,
        type: "article",
        publishedTime: blogData.publishedAt || blogData.createdAt,
        authors: [blogData.author?.username || "seltra"],
        images: blogData.coverImage ? [blogData.coverImage] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: blogData.title,
        description,
        images: blogData.coverImage ? [blogData.coverImage] : [],
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error("❌ Error generating metadata:", error);
    return {
      title: "Blog | seltra",
      description: "Read insightful articles about digital advertising",
    };
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const blogResult = await getBlog(slug);

    if (!blogResult.success || !blogResult.data || !blogResult.data.title) {
      notFound();
    }

    const blog = blogResult.data;

    // Format date and reading time
    const publishedDate = blog.publishedAt
      ? new Date(blog.publishedAt)
      : new Date(blog.createdAt);

    const formattedDate = publishedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const readingTime = Math.ceil(
      (blog.content?.split(/\s+/).length || 0) / 200
    );

    // Dynamic import for the client component
    const BlogContent = (await import("./BlogContent")).default;

    return <BlogContent {...{ blog, formattedDate, readingTime }} />;
  } catch (error) {
    console.error("❌ Error loading blog page:", error);
    notFound();
  }
}

// Keep generateStaticParams for static generation
export async function generateStaticParams() {
  // Return an empty array or fetch slugs from your API
  return [{ slug: "test-blog-1" }, { slug: "test-blog-2" }];
}
