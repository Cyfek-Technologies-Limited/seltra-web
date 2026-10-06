"use client";

import Landing from "@/components/public/Landing";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, userLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after user loading is complete and we have a user
    if (!userLoading && user) {
      let redirectUrl;
      if (user?.isAdmin) {
        redirectUrl = "/dashboard/admin";
      } else if (user?.isPublisher) {
        redirectUrl = "/dashboard/publisher";
      } else if (user?.isAdvertiser) {
        redirectUrl = "/dashboard/advertiser";
      }

      if (redirectUrl) {
        // Use router.push instead of redirect to avoid SSR issues
        router.push(redirectUrl);
      }
    }
  }, [user, userLoading, router]);

  // // Show loading state or landing page
  // if (userLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return <Landing />;
}
