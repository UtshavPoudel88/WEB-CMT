"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { getAllCommunities } from "@/lib/api/communities";
import { getImageUrl } from "@/lib/api/endpoints";
import { getPostsByCommunity, type Post } from "@/lib/api/posts";

interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, communitiesRes] = await Promise.all([
        axiosInstance.get<{ success: boolean; data: AdminUserRow[] }>("/community/customers"),
        getAllCommunities().catch(() => []),
      ]);

      setUsers(usersRes.data.data || []);
      setCommunities(communitiesRes || []);

      // Compute total posts across all communities
      const postsPerCommunity: Post[][] = await Promise.all(
        (communitiesRes || []).map((c: any) =>
          getPostsByCommunity(c._id).catch(() => [])
        )
      );
      const total = postsPerCommunity.reduce((sum, arr) => sum + arr.length, 0);
      setTotalPosts(total);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-2">
          Overview of your platform analytics and statistics.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Total Users</p>
          <p className="text-4xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Communities</p>
          <p className="text-4xl font-bold text-gray-900">{communities.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Total Posts</p>
          <p className="text-4xl font-bold text-gray-900">
            {totalPosts !== null ? totalPosts : "—"}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">No users yet</p>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => {
                const profilePicUrl = user.profilePicture ? getImageUrl(user.profilePicture) : null;
                return (
                  <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Communities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Communities</h2>
          {communities.length === 0 ? (
            <p className="text-gray-500 text-sm">No communities yet</p>
          ) : (
            <div className="space-y-3">
              {communities.slice(0, 5).map((community) => {
                const imageUrl = community.image ? getImageUrl(community.image) : null;
                return (
                  <div key={community._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={community.title}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 ${imageUrl ? "hidden" : ""}`}
                      >
                        <span className="text-blue-600 font-bold">{community.title[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{community.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{community.description || "No description"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

