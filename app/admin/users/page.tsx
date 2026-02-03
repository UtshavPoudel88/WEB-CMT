"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { adminDeleteUser, adminGetUsers, AdminUser } from "@/lib/api/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminGetUsers();
        setUsers(res.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await adminDeleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete user");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-600">Admin user management</p>
          </div>
          <Link
            href="/admin/users/create"
            className="rounded-lg bg-violet-600 px-4 py-2 text-white font-semibold"
          >
            Create User
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-3 text-slate-500" colSpan={4}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-slate-500" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-violet-600 hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-slate-700 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:underline disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
