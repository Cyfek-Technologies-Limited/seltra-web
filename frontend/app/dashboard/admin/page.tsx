export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

interface AdminStats {
  totalPublishers: number;
  totalAdvertisers: number;
  totalCampaigns: number;
  pendingClaims: number;
  approvedClaims: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  platformProfit: number;
  expiredReservations: number;
}

interface RecentAction {
  id: string;
  actionType: string;
  description: string;
  adminEmail: string;
  createdAt: string;
}

const page = () => {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardClient />
    </Suspense>
  );
};

export default page;
