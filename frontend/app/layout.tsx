import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
// import { Analytics } from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: {
    default: "Seltra ",
    template: "%s | Seltra",
  },
  description:
    "Seltra is the leading hyper-local advertising network in Nigeria and across Africa. Monetize your social media presence and reach targeted audiences with authentic advertising.",
  keywords: [
    "seltra",
    "digital marketing",
    "social media monetization",
    "Nigeria advertising",
    "Make Money Online",
    "WhatsApp monetization",
    "Instagram ads",
    "google adsense",
  ],
  authors: [{ name: "Seltra" }],
  creator: "Seltra",
  publisher: "Seltra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://seltra.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://seltra.app",
    siteName: "Seltra",
    title: "Seltra - Transforming Digital Markrting in Africa",
    description: "Join the leading hyper-local advertising network in Africa.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Seltra - Transforming Digital Markrting in Africa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seltra - Transforming Digital Markrting in Africa",
    description: "Monetize your social media presence with Seltra",
    images: ["/og-image.jpg"],
    creator: "@seltra_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // You'll add Google Search Console verification here
    google: "your-google-search-console-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Seltra",
              alternateName: "Seltra Advertising Platform",
              url: "https://seltra.app",
              logo: "https://seltra.app/logo.png",
              description:
                "Leading hyper-local advertising network in Africa connecting advertisers with micro-publishers",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lagos",
                addressCountry: "Nigeria",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "support@seltra.app",
              },
              sameAs: [
                "https://twitter.com/seltra.app",
                "https://linkedin.com/company/seltra",
                "https://instagram.com/seltra.app",
              ],
            }),
          }}
        />

        {/* <!-- Google tag (gtag.js) --> */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1FP9WQ2K7B"
        ></script>
        {/* <script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-1FP9WQ2K7B');
</script> */}
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          <main className="">{children}</main>
          <Footer />
          <Toaster />
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
