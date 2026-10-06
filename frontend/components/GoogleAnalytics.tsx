// components/GoogleAnalytics.tsx
"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

export function Analytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  if (!GA_ID) {
    console.warn("Google Analytics ID not found");
    return null;
  }

  return <GoogleAnalytics gaId={GA_ID} />;
}
