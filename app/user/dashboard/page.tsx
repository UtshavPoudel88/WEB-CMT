"use client";


import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { getMyCommunities } from "@/lib/api/communities";
import { getPostsByUser } from "@/lib/api/posts";
import { getImageUrl } from "@/lib/api/endpoints";
import Link from "next/link";

const ADMIN_EMAILS =
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export default function UserDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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
      if (isAdmin) {
        router.push("/admin");
        return;
      }
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [communities, posts] = await Promise.all([
        getMyCommunities().catch(() => []),
        getPostsByUser(user!._id).catch(() => []),
      ]);
      setMyCommunities(communities);
      setMyPosts(posts);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
          <p className="mt-4 text-[var(--ink-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-[var(--ink-muted)]">Here's what's happening in your communities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ink-muted)] mb-1">My Communities</p>
                <p className="text-3xl font-bold text-[var(--brand)]">{myCommunities.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ink-muted)] mb-1">My Posts</p>
                <p className="text-3xl font-bold text-[var(--accent)]">{myPosts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ink-muted)] mb-1">Total Likes</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {myPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/user/explore"
            className="glass-panel rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--brand)]/10 group-hover:bg-[var(--brand)]/20 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Explore</p>
                <p className="text-sm text-[var(--ink-muted)]">Find communities</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/add-post"
            className="glass-panel rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Create Post</p>
                <p className="text-sm text-[var(--ink-muted)]">Share something</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/feed"
            className="glass-panel rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">View Feed</p>
                <p className="text-sm text-[var(--ink-muted)]">See all posts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/profile"
            className="glass-panel rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Profile</p>
                <p className="text-sm text-[var(--ink-muted)]">Edit settings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Communities */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--foreground)]">My Communities</h2>
              <Link href="/user/explore" className="text-sm text-[var(--brand)] hover:underline">
                View all
              </Link>
            </div>
            {myCommunities.length === 0 ? (
              <div className="text-center py-8 text-[var(--ink-muted)]">
                <p>You haven't joined any communities yet.</p>
                <Link
                  href="/user/explore"
                  className="text-[var(--brand)] hover:underline mt-2 inline-block"
                >
                  Explore communities →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myCommunities.slice(0, 5).map((community) => {
                  const hasImage = community.image && !imageErrors.has(community._id);
                  const imageUrl = hasImage
                    ? community.image.startsWith("http")
                      ? community.image
                      : getImageUrl(community.image)
                    : null;
                  
                  return (
                    <Link
                      key={community._id}
                      href={`/user/feed?community=${community._id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--panel-soft)] transition-colors"
                    >
                      {hasImage && imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={community.title}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors((prev) => new Set([...prev, community._id]));
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] flex items-center justify-center text-white font-bold flex-shrink-0">
                          {community.title?.[0]?.toUpperCase() || "C"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--foreground)]">{community.title}</p>
                        <p className="text-sm text-[var(--ink-muted)] line-clamp-1">
                          {community.description || "No description"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Recent Posts</h2>
              <Link href="/user/my-feed" className="text-sm text-[var(--brand)] hover:underline">
                View all
              </Link>
            </div>
            {myPosts.length === 0 ? (
              <div className="text-center py-8 text-[var(--ink-muted)]">
                <p>You haven't created any posts yet.</p>
                <Link
                  href="/user/add-post"
                  className="text-[var(--brand)] hover:underline mt-2 inline-block"
                >
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myPosts.slice(0, 5).map((post) => {
                  const postUser = typeof post.userId === "object" ? post.userId : null;
                  const profilePic = postUser?.profilePicture
                    ? getImageUrl(postUser.profilePicture)
                    : user?.profilePicture
                    ? getImageUrl(user.profilePicture)
                    : null;
                  return (
                    <div
                      key={post._id}
                      className="p-3 rounded-lg hover:bg-[var(--panel-soft)] transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={user?.name || "You"}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${profilePic ? "hidden" : ""}`}
                        >
                          {(user?.name || "U")[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--foreground)] line-clamp-2">
                            {post.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--ink-muted)] ml-11">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {post.likeCount || 0}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


