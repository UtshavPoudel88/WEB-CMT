"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getAllCommunities,
  getMyCommunities,
  joinCommunity,
  leaveCommunity,
  Community,
} from "@/lib/api/communities";
import { getImageUrl } from "@/lib/api/endpoints";
import Link from "next/link";

const ADMIN_EMAILS =
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export default function UserExplore() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunityIds, setMyCommunityIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
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
      const [allCommunities, myCommunities] = await Promise.all([
        getAllCommunities().catch(() => []),
        getMyCommunities().catch(() => []),
      ]);
      setCommunities(allCommunities);
      setMyCommunityIds(new Set(myCommunities.map((c) => c._id)));
    } catch (error) {
      console.error("Failed to load communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    if (joining) return;
    try {
      setJoining(communityId);
      await joinCommunity(communityId);
      setMyCommunityIds((prev) => new Set([...prev, communityId]));
    } catch (error: any) {
      console.error("Failed to join community:", error);
      alert(error.message || "Failed to join community");
    } finally {
      setJoining(null);
    }
  };

  const handleLeave = async (communityId: string) => {
    if (joining) return;
    if (!confirm("Are you sure you want to leave this community?")) return;
    try {
      setJoining(communityId);
      await leaveCommunity(communityId);
      setMyCommunityIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(communityId);
        return newSet;
      });
    } catch (error: any) {
      console.error("Failed to leave community:", error);
      alert(error.message || "Failed to leave community");
    } finally {
      setJoining(null);
    }
  };

  const isJoined = (communityId: string) => {
    return myCommunityIds.has(communityId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
          <p className="mt-4 text-[var(--ink-muted)]">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">Explore Communities</h1>
          <p className="text-[var(--ink-muted)]">Discover and join communities that interest you</p>
        </div>

        {/* Communities Grid */}
        {communities.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-[var(--ink-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg text-[var(--ink-muted)]">No communities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              const joined = isJoined(community._id);
              const imageUrl = getImageUrl(community.image);
              const showImage = !!imageUrl && !imageErrors.has(community._id);
              return (
                <div
                  key={community._id}
                  className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-[1.02] group"
                >
                  {/* Community Image/Icon */}
                  <div className="mb-4">
                    {showImage ? (
                      <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
                        <img
                          src={imageUrl!}
                          alt={community.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={() => {
                            setImageErrors((prev) => new Set([...prev, community._id]));
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] flex items-center justify-center mb-4">
                        <span className="text-6xl font-bold text-white">
                          {community.title[0]?.toUpperCase() || "C"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Community Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                      {community.title}
                    </h3>
                    <p className="text-[var(--ink-muted)] line-clamp-2">
                      {community.description || "No description available"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {joined ? (
                      <>
                        <Link
                          href={`/user/feed?community=${community._id}`}
                          className="flex-1 px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium text-center hover:bg-[var(--brand-dark)] transition-colors"
                        >
                          View Posts
                        </Link>
                        <button
                          onClick={() => handleLeave(community._id)}
                          disabled={joining === community._id}
                          className="px-4 py-2 bg-[var(--panel-soft)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--stroke)] transition-colors disabled:opacity-50"
                        >
                          {joining === community._id ? "..." : "Leave"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoin(community._id)}
                        disabled={joining === community._id}
                        className="w-full px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-50"
                      >
                        {joining === community._id ? "Joining..." : "Join Community"}
                      </button>
                    )}
                  </div>

                  {/* Joined Badge */}
                  {joined && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-[var(--accent)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>You're a member</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


