// components/dashboard/Topbar.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import Icon from "../ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useRoleManager } from "@/hooks/useRoleManager";
import {
  Menu,
  X,
  LogOut,
  Target,
  Flame,
  Zap,
  Heart,
  Trophy,
  Users,
} from "lucide-react";
import { adminNav, advertiserNav, publisherNav } from "@/constants/dashboard";
import Link from "next/link";
import { UserAvatar } from "../ui/ReusableComponents";
import { RoleSwitch } from "./RoleSwitch";
import { usePathname } from "next/navigation";

const Topbar = () => {
  const pathname = usePathname();
  const { user, logout, refreshUser } = useAuth();
  const { addRole, isLoading } = useRoleManager();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Business motivational quotes with matching Lucide icons
  const motivationalQuotes = [
    {
      text: "The harder you work, the more luck you seem to have.",
      icon: Flame,
    },
    { text: "The secret of getting ahead is getting started.", icon: Zap },
    { text: "Don't let yesterday take up too much of today.", icon: Target },
    {
      text: "You do great work by loving what you do.",
      icon: Heart,
    },
    { text: "The future depends on what you do today.", icon: Trophy },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rotate quotes every 5 seconds with smooth fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) =>
          prev === motivationalQuotes.length - 1 ? 0 : prev + 1
        );
        setTimeout(() => setIsAnimating(false), 200);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [motivationalQuotes.length]);

  // Determine nav items
  let navItems;
  if (currentRole === "admin") navItems = adminNav;
  else if (currentRole === "advertiser") navItems = advertiserNav;
  else navItems = publisherNav;
  // Current quote and icon
  const currentQuote = motivationalQuotes[currentQuoteIndex];
  const IconComponent = currentQuote.icon;

  // Mobile menu handlers for role management
  const handleBecomePublisher = async () => {
    const success = await addRole("PUBLISHER");
    if (success) {
      setMenuOpen(false);
      setTimeout(() => {
        window.location.href = "/dashboard/publisher";
      }, 500);
    }
  };

  const handleBecomeAdvertiser = async () => {
    const success = await addRole("ADVERTISER");
    if (success) {
      setMenuOpen(false);
      setTimeout(() => {
        window.location.href = "/dashboard/advertiser";
      }, 500);
    }
  };

  const handleSwitchToPublisher = () => {
    setMenuOpen(false);
    window.location.href = "/dashboard/publisher";
  };

  const handleSwitchToAdvertiser = () => {
    setMenuOpen(false);
    window.location.href = "/dashboard/advertiser";
  };

  return (
    <div className="flex justify-between items-center relative">
      {/* Left: Motivational Quotes with Fade Animation */}
      <div className="flex-1 max-w-[400px]">
        <div className="flex items-center bg-gradient-to-l from-accent to-primary gap-3 w-full lg:h-[36px] h-[40px] rounded-[10px] border-[1px] py-2 px-4 border-white/15">
          <div className="relative flex items-center justify-start overflow-hidden">
            <div
              className={`flex items-center h-[150px] gap-2 font-inter font-[300] text-[14px] text-white/90 transition-opacity duration-700 ease-in-out ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <IconComponent size={16} className="text-white/90" />
              {currentQuote.text}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2" ref={menuRef}>
        {/* Role Switch Component */}
        <RoleSwitch />

        <div className="lg:flex hidden gap-2">
          <Link href={"/dashboard/notifications"}>
            <div className="bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer">
              <Icon src="/dash/bell.svg" w={33} h={33} />
            </div>
          </Link>
          <Link
            href={"/about"}
            className="bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
          >
            <Icon src="/dash/info.svg" w={33} h={33} />
          </Link>
        </div>

        <div
          onClick={refreshUser}
          className="hidden lg:flex items-center gap-2 cursor-pointer"
        >
          <UserAvatar username={user?.username} />
        </div>

        {/* Mobile Menu - Updated to include Role Switch */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
        >
          {menuOpen ? (
            <X size={22} className="text-black" />
          ) : (
            <Menu size={22} className="text-black" />
          )}
        </button>

        {menuOpen && (
          <div className="absolute top-[110%] right-0 w-[250px] bg-[#121212] border border-white/10 rounded-[8px] shadow-lg overflow-hidden z-50 animate-fadeIn lg:hidden">
            {/* Mobile Role Options */}
            <div className="p-3 border-b border-white/10">
              <div className="text-xs text-white/50 mb-2">Switch Role</div>
              {user?.isPublisher && (
                <button
                  onClick={handleSwitchToPublisher}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-white/80 text-sm transition rounded"
                >
                  <Users className="w-4 h-4" />
                  Publisher Dashboard
                </button>
              )}
              {user?.isAdvertiser && (
                <button
                  onClick={handleSwitchToAdvertiser}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-white/80 text-sm transition rounded"
                >
                  <Target className="w-4 h-4" />
                  Advertiser Dashboard
                </button>
              )}
              {!user?.isPublisher && (
                <button
                  onClick={handleBecomePublisher}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-white/80 text-sm transition rounded disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  {isLoading ? "Adding..." : "Become Publisher"}
                </button>
              )}
              {!user?.isAdvertiser && (
                <button
                  onClick={handleBecomeAdvertiser}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-white/80 text-sm transition rounded disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  {isLoading ? "Adding..." : "Become Advertiser"}
                </button>
              )}
            </div>

            {/* Navigation Links */}
            {navItems.map((item, i) => (
              <Link
                key={i}
                href={item.route}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/80 text-sm transition"
              >
                <Icon src={item.icon} w={16} h={16} />
                {item.name}
              </Link>
            ))}

            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/80 text-sm transition border-t border-white/10"
            >
              <LogOut size={16} className="text-accent" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
