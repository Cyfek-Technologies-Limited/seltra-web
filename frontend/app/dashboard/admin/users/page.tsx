// app/dashboard/admin/users/page.tsx (assuming this is the path; adjust if needed)
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Roller } from "@/components/ui/ReusableComponents"; // Assuming Roller is used in loading
import AdminUsersClient from "@/components/admin/AdminUsersClient";

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
          <Roller />
        </div>
      }
    >
      <AdminUsersClient />
    </Suspense>
  );
};

export default page;
