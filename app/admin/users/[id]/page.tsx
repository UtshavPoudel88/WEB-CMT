"use client";

import { useEffect, useState } from "react";
import { adminGetUser, AdminUser } from "@/lib/api/admin";
import { useParams } from "next/navigation";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid user id");
      return;
    }
    const load = async () => {
      setError("");
      try {
        const res = await adminGetUser(id);
        setUser(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      }
    };

    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">User Detail</h1>
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {!user && !error && (
          <p className="text-slate-500">Loading user...</p>
        )}
        {user && (
          <div className="space-y-2">
            <p className="text-slate-600">User ID: <span className="font-semibold text-slate-900">{user.id}</span></p>
            <p className="text-slate-600">Name: <span className="font-semibold text-slate-900">{user.name}</span></p>
            <p className="text-slate-600">Email: <span className="font-semibold text-slate-900">{user.email}</span></p>
            <p className="text-slate-600">Role: <span className="font-semibold text-slate-900">{user.role}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
