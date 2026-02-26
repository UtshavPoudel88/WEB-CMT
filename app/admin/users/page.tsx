"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { API, API_BASE_URL } from "@/lib/api/endpoints";

interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role?: string;
  createdAt?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersRes = await axiosInstance.get<{ success: boolean; data: AdminUserRow[] }>("/community/customers");
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      setError(null);
      await axiosInstance.delete(`/community/customers/${id}`);
      await loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete user. Please try again.");
    }
  };

  const handlePromoteToAdmin = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to promote ${email} to admin?`)) return;
    try {
      setPromoting(id);
      setError(null);
      await axiosInstance.put(API.AUTH.UPDATE_USER(id), { role: "admin" });
      await loadUsers();
    } catch (err: any) {
      console.error("Failed to promote user:", err);
      setError(err.response?.data?.message || "Failed to promote user. Please try again.");
    } finally {
      setPromoting(null);
    }
  };

  const handleDemoteFromAdmin = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove admin privileges from ${email}?`)) return;
    try {
      setPromoting(id);
      setError(null);
      await axiosInstance.put(API.AUTH.UPDATE_USER(id), { role: "user" });
      await loadUsers();
    } catch (err: any) {
      console.error("Failed to demote user:", err);
      setError(err.response?.data?.message || "Failed to demote user. Please try again.");
    } finally {
      setPromoting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-600 mt-2">
          Manage users, promote to admin, or delete accounts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4 hidden md:table-cell">Created</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isAdmin = user.role === "admin";
                  const profilePicUrl = user.profilePicture
                    ? user.profilePicture.startsWith("http")
                      ? user.profilePicture
                      : `${API_BASE_URL}${user.profilePicture}`
                    : null;
                  return (
                    <tr key={user._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {profilePicUrl ? (
                            <img
                              src={profilePicUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${profilePicUrl ? "hidden" : ""}`}
                          >
                            {user.name[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                      <td className="py-3 pr-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 pr-0 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleDemoteFromAdmin(user._id, user.email)}
                              disabled={promoting === user._id}
                              className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50"
                            >
                              {promoting === user._id ? "..." : "Remove Admin"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePromoteToAdmin(user._id, user.email)}
                              disabled={promoting === user._id}
                              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              {promoting === user._id ? "..." : "Promote to Admin"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user._id)}
                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

