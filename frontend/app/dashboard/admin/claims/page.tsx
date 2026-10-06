// app/dashboard/admin/claims/page.tsx
import "server-only";

export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/user";
import ClientClaimsComponent from "./ClientClaimsComponent";

interface PendingClaim {
  id: string;
  amount: number;
  views: number;
  proofImage: string;
  claimedAt: string;
  extractedViews?: number;
  acceptedAt?: string;
  publisher: {
    user: {
      email: string;
      username?: string;
      createdAt: string;
    };
    account: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      isVerified: boolean;
    };
    strikes: Array<{
      rejectionReason: string;
      severity: string;
      issuedAt: string;
    }>;
  };
  proofUrl: string;
  campaign: {
    id: string;
    title: string;
    platform: string;
    views: number;
    targetViews: number;
    user: {
      email: string;
      username?: string;
    };
  };
}

async function fetchPendingClaims() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const cookieStore = await cookies(); // 🔥 FIX
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const response = await fetch(`${BASE_URL}/admin/claims/pending?limit=20`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  console.log("claims response:", response);
  if (!response.ok) throw new Error("Failed to fetch claims");
  const data = await response.json();
  return data.data.claims.reverse();
}

export default async function AdminClaimsPage() {
  const user = await getCurrentUser();
  console.log("user", user);
  // if (!user?.roles?.includes("ADMIN")) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="text-center py-12">
  //         <h3 className="text-lg font-medium text-foreground mb-2">
  //           Admin Access Required
  //         </h3>
  //         <p className="text-muted-foreground">
  //           You need admin privileges to access this page.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  let claims: PendingClaim[] = [];
  try {
    claims = await fetchPendingClaims();
  } catch (error) {
    // Handle error, e.g., show fallback UI
    console.error("Failed to fetch pending claims:", error);
  }

  return <ClientClaimsComponent initialClaims={claims} user={user} />;
}
