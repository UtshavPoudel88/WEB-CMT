"use client";


import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

const NavBar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // NavBar is for logged-in users only: show only on /user/* routes. Hide on landing, auth, and admin.
  const isLanding = pathname === "/" || !pathname;
  const isUserArea = pathname?.startsWith("/user");
  if (isLanding || pathname?.startsWith("/auth") || pathname?.startsWith("/admin") || !user || !isUserArea) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-lg px-6 sm:px-8 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/user/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="Community Talks"
            className="h-10 w-10 object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <span className="bg-white text-blue-700 rounded-full px-3 py-1 font-bold text-lg tracking-wide shadow-sm hidden">
            CT
          </span>
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white drop-shadow">
            Community Talks
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
          <Link className="hover:bg-blue-900/70 px-3 py-1.5 rounded text-white font-medium" href="/user/dashboard">
            Dashboard
          </Link>
          <Link className="hover:bg-blue-900/70 px-3 py-1.5 rounded text-white font-medium" href="/user/feed">
            Feed
          </Link>
          <Link className="hover:bg-blue-900/70 px-3 py-1.5 rounded text-white font-medium" href="/user/explore">
            Explore
          </Link>
          <Link className="hover:bg-blue-900/70 px-3 py-1.5 rounded text-white font-medium" href="/user/profile">
            Profile
          </Link>
          <Link className="hover:bg-blue-900/70 px-3 py-1.5 rounded text-white font-medium" href="/user/add-post">
            Add Post
          </Link>
          <button
            className="ml-1 rounded border border-white/30 px-3 py-1.5 text-white text-sm font-medium hover:bg-white/10 transition"
            type="button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
