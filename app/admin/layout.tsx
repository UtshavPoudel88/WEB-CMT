"use client";


import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import AdminSidebar from "../components/AdminSidebar";

const ADMIN_EMAILS =
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  // Check if user is admin (prefer role field from backend, fallback to email check)
  const isAdmin = !!user && (
    user.role === "admin" || 
    ADMIN_EMAILS.includes((user.email || "").toLowerCase())
  );

  useEffect(() => {
    if (!authLoading) {
      if (!token || !user) {
        router.push("/auth/login");
        return;
      }
      if (!isAdmin) {
        router.push("/user/dashboard");
        return;
      }
    }
  }, [authLoading, token, user, isAdmin, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
          <p className="mt-4 text-[var(--ink-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen app-bg flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

