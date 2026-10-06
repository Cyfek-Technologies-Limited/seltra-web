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
    <nav className="fixed bg-primary top-0 w-full z-50 backdrop-blur-md pr-[30px]">
      <div className="container mx-auto px-4 h-[71px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-end gap-1">
          <img
            src="/logo/40.png"
            alt="Logo"
            className="w-[170px] -ml-8 h-[60px] object-cover"
          />
          {/* <p className="text-white font-bold text-lg">Seltra</p> */}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
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
        <div className="hidden md:flex items-center space-x-3">
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
          className="md:hidden flex items-center text-white focus:outline-none"
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
            className="absolute top-[71px] left-0 w-full bg-primary/95 backdrop-blur-xl flex flex-col items-center space-y-5 py-6 shadow-lg md:hidden"
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
