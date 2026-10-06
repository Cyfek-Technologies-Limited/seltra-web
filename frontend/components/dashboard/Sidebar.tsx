// components/dashboard/Sidebar.tsx - UPDATED
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, redirect } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { Card, Logo, UserAvatar } from "../ui/ReusableComponents";
import Icon from "../ui/Icon";
import CustomButton from "../ui/CustomButton";
import { adminNav, advertiserNav, publisherNav } from "@/constants/dashboard";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const { user, logout, userLoading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<
    "admin" | "publisher" | "advertiser"
  >("publisher");

  // Determine current role based on pathname and user data
  useEffect(() => {
    if (pathname.includes("/admin")) {
      setCurrentRole("admin");
    } else if (pathname.includes("/advertiser")) {
      setCurrentRole("advertiser");
    } else if (pathname.includes("/publisher")) {
      setCurrentRole("publisher");
    } else {
      // Fallback to user roles
      if (user?.isAdmin) setCurrentRole("admin");
      else if (user?.isAdvertiser) setCurrentRole("advertiser");
      else setCurrentRole("publisher");
    }
  }, [pathname, user]);

  let sidebarItems;
  if (currentRole === "admin") sidebarItems = adminNav;
  else if (currentRole === "advertiser") sidebarItems = advertiserNav;
  else sidebarItems = publisherNav;

  // Skeleton loader
  if (userLoading) {
    return (
      <Card className="hidden lg:block fixed top-[12px] left-[12px] w-[206px] h-[96vh] bg-primary shadow-md rounded-[10px] border border-white/5 p-[22px]">
        <div className="h-6 w-24 bg-white/10 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 bg-white/10 rounded-md animate-pulse" />
              <div className="h-4 w-[70%] bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <Card className="hidden lg:block fixed top-[12px] left-[12px] w-[206px] h-[96vh] bg-primary shadow-md text-black rounded-[10px] border border-white/5 overflow-y-auto scroll-hide p-[22px]">
        <div className="flex justify-between">
          <Logo />
        </div>

        {/* Current Role Indicator */}
        <div className="mt-2 mb-4">
          <div className="text-xs text-white/50">Current View:</div>
          <div className="text-sm font-medium text-accent capitalize">
            {currentRole} Dashboard
          </div>
        </div>

        <div className="space-y-[16px] mt-[20px]">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className="space-y-[14px]"
              onClick={() => redirect(item.route)}
            >
              <div
                className={`-mx-[22px] cursor-pointer h-[38px] flex items-center px-[22px] gap-[12px] py-[10.86px] transition-all duration-300 ${
                  pathname === item.route
                    ? "bg-accent text-sidebar"
                    : "hover:bg-white/5 text-white/70"
                }`}
              >
                <Icon src={item.icon} style="text-accent" w={18} h={18} />
                <Link
                  href={item.route}
                  className="font-inter font-[400] flex-1"
                >
                  {item.name}
                </Link>
                {pathname === item.route && (
                  <div className="rounded-l-[14px] w-[6px] bg-accent h-[36.86px] ml-auto -mr-[22px]" />
                )}
              </div>
            </div>
          ))}

          <div className="space-y-[14px]" onClick={() => logout()}>
            <div className="-mx-[22px] cursor-pointer h-[38px] flex items-center px-[22px] gap-[12px] py-[10.86px] hover:bg-white/5 transition-all">
              <LogOut size={18} className="text-accent" />
              <div className="font-inter font-[400] text-white">Logout</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mobile Top Navigation */}
      {/*  */}
    </>
  );
};

export default Sidebar;
