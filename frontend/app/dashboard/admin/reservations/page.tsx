// app/dashboard/admin/reservations/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Roller } from "@/components/ui/ReusableComponents"; // Assuming this is used in loading state
import AdminReservationsClient from "@/components/admin/AdminReservationsClient";

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Roller />
          </div>
        </div>
      }
    >
      <AdminReservationsClient />
    </Suspense>
  );
};

export default page;
