// app/dashboard/layout.tsx
import { Suspense } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { redirect } from "next/navigation";
import { Roller } from "@/components/ui/ReusableComponents";
import { getCurrentUser } from "@/lib/serverside"; // Adjust path to your server-side user getter

async function getServerUser() {
  const user = await getCurrentUser(); // Pass request if needed
  return user;
}

export default async function DashboardLayout({ children }) {
  const user = await getServerUser();

  if (!user) {
    // redirect("/auth/login");
    console.log("user", user);
  }

  return (
    <div className="lg:flex bg-gradient-to-l from-secondary to-sidebar ">
      <Sidebar />
      <div className="lg:ml-[250px] w-full mt-[20px] space-y-[20px] lg:mr-[30px] p-5 lg:p-0">
        <Topbar />
        <Suspense fallback={<Roller />}>
          <div className=" mb-[20px] ">{children}</div>
        </Suspense>
      </div>
    </div>
  );
}
