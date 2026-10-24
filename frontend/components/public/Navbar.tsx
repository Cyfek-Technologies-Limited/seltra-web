"use client";

import { useState } from "react";
import { LogIn, UserPlus, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const { user, userLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  if (pathname.includes("/dashboard") || pathname.includes("/auth")) {
    return null;
  }

  let redirectUrl;
  if (!userLoading) {
    if (user?.isAdmin) {
      redirectUrl = "/dashboard/admin";
    } else if (user?.isPublisher) {
      redirectUrl = "/dashboard/publisher";
    } else if (user?.isAdvertiser) {
      redirectUrl = "/dashboard/advertiser";
    }
  }

  const navLinks = [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Explore Campaigns", href: "/explore" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <div className="container mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto] items-center justify-between rounded-full border border-white/10 bg-[#07101d]/85 px-5 shadow-xl shadow-black/15 backdrop-blur-xl md:grid-cols-[1fr_auto_1fr] md:px-8">
        {/* Logo */}
        <Link href="/" className="flex w-fit items-end gap-1">
          <img
            src="/logo/40.png"
            alt="Seltra"
            className="h-[57px] w-[89px] object-cover"
          />
          {/* <p className="text-white font-bold text-lg">Seltra</p> */}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center justify-center space-x-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center justify-end space-x-3 md:flex">
          <Button variant="accent" size="sm" asChild>
            <Link href={user ? redirectUrl : "/auth/login"}>
              <LogIn className="w-4 h-4 mr-1" />
              {user ? "Dashboard" : "Login"}
            </Link>
          </Button>

          {!user && (
            <Button variant="hero" size="sm" asChild>
              <Link href="/auth/signup">
                <UserPlus className="w-4 h-4 mr-1" />
                Get Started
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-self-end text-white focus:outline-none md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="w-7 h-7 transition-transform duration-200 hover:scale-110" />
          ) : (
            <Menu className="w-7 h-7 transition-transform duration-200 hover:scale-110" />
          )}
        </button>
      </div>

      {/* Mobile Menu Popup */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="absolute left-4 right-4 top-[calc(100%+0.75rem)] flex flex-col items-center space-y-5 rounded-3xl border border-white/10 bg-[#07101d]/95 py-6 shadow-xl backdrop-blur-xl sm:left-6 sm:right-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link?.href}
                onClick={() => setMenuOpen(false)}
                className="text-white text-lg hover:text-gray-200 transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="flex flex-col space-y-3 w-4/5 mt-4">
              <Button variant="accent" size="lg" asChild>
                <Link
                  href={user ? redirectUrl : "/auth/login"}
                  onClick={() => (user ? setMenuOpen(false) : logout())}
                  className="flex items-center justify-center"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {user ? "Dashboard" : "Login"}
                </Link>
              </Button>

              {!user && (
                <Button variant="hero" size="lg" asChild>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
