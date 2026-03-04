"use client";



import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { getAllPosts, getPostsByCommunity, reactToPost, deletePost, updatePost, type Post } from "@/lib/api/posts";
import { getMyCommunities, type Community } from "@/lib/api/communities";
import { API_BASE_URL } from "@/lib/api/endpoints";
import Link from "next/link";

const ADMIN_EMAILS =
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export default function UserFeed() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const communityFilter = searchParams.get("community");

  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [reacting, setReacting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [saving, setSaving] = useState<string | null>(null);

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
      loadCommunities();
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, user, communityFilter]);

  const loadCommunities = async () => {
    try {
      const myCommunities = await getMyCommunities().catch(() => []);
      setCommunities(myCommunities);
    } catch (error) {
      console.error("Failed to load communities:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      let data: Post[] = [];
      if (communityFilter && communityFilter !== "all") {
        try {
          data = await getPostsByCommunity(communityFilter);
        } catch (error: any) {
          if (error.status === 403 || error.message?.includes("join") || error.message?.includes("must join")) {
            alert("You must join this community to view its posts. Redirecting to explore page...");
            router.push("/user/explore");
            return;
          }
          throw error;
        }
      } else {
        // Show all posts from communities user has joined
        data = await getAllPosts().catch(() => []);
      }
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (communityId: string) => {
    const params = new URLSearchParams();
    if (communityId && communityId !== "all") {
      params.set("community", communityId);
    }
    router.push(`/user/feed${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleReact = async (postId: string, type: "like" | "dislike") => {
    if (reacting) return;
    try {
      setReacting(postId);
      const updatedPost = await reactToPost(postId, type);
      // Update the post in the list
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updatedPost : p))
      );
    } catch (error: any) {
      console.error("Failed to react to post:", error);
      alert(error.message || "Failed to react to post");
    } finally {
      setReacting(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    if (deleting) return;
    try {
      setDeleting(postId);
      await deletePost(postId);
      // Remove the post from the list
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      alert(error.message || "Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (post: Post) => {
    setEditing(post._id);
    setEditText(post.text || "");
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditText("");
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editText.trim()) {
      alert("Post text cannot be empty");
      return;
    }
    if (saving) return;
    try {
      setSaving(postId);
      const updatedPost = await updatePost(postId, editText);
      // Update the post in the list
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updatedPost : p))
      );
      setEditing(null);
      setEditText("");
    } catch (error: any) {
      console.error("Failed to update post:", error);
      alert(error.message || "Failed to update post");
    } finally {
      setSaving(null);
    }
  };

  const getMediaUrl = (mediaUrl?: string) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith("http")) return mediaUrl;
    return `${API_BASE_URL}${mediaUrl}`;
  };

  const getUserName = (post: Post) => {
    if (post.userId && typeof post.userId === "object" && post.userId !== null && post.userId.name) {
      return post.userId.name;
    }
    return post.displayName || "Community member";
  };

  const getUserProfilePicture = (post: Post) => {
    if (post.userId && typeof post.userId === "object" && post.userId !== null && post.userId.profilePicture) {
      const pic = post.userId.profilePicture;
      if (pic.startsWith("http")) return pic;
      return `${API_BASE_URL}${pic}`;
    }
    return null;
  };

  const getCommunityName = (post: Post) => {
    if (post.communityId && typeof post.communityId === "object" && post.communityId !== null && post.communityId.title) {
      return post.communityId.title;
    }
    return "Community";
  };

  const isMyPost = (post: Post) => {
    if (!user) return false;
    if (!post.userId) return false;
    const postUserId = post.userId && typeof post.userId === "object" && post.userId !== null ? post.userId._id : post.userId;
    return postUserId && postUserId.toString() === user._id;
  };

  const isLiked = (post: Post) => {
    if (!user || !post.likes) return false;
    return post.likes.some((id) => id.toString() === user._id);
  };

  const isDisliked = (post: Post) => {
    if (!user || !post.dislikes) return false;
    return post.dislikes.some((id) => id.toString() === user._id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
          <p className="mt-4 text-[var(--ink-muted)]">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Feed</h1>
            <p className="text-[var(--ink-muted)]">All posts from your communities</p>
          </div>
          <Link
            href="/user/add-post"
            className="inline-flex items-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--brand-dark)] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>

        {/* Community Filter */}
        {communities.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Filter by Community
            </label>
            <select
              value={communityFilter || "all"}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full md:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[var(--foreground)]"
            >
              <option value="all">All Communities</option>
              {communities.map((community) => (
                <option key={community._id} value={community._id}>
                  {community.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-[var(--ink-muted)] mb-4">
              {communityFilter && communityFilter !== "all"
                ? "No posts in this community yet."
                : "No posts yet. Be the first to share something!"}
            </p>
            <Link
              href="/user/add-post"
              className="inline-flex items-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--brand-dark)] transition-colors"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const userName = getUserName(post);
              const profilePic = getUserProfilePicture(post);
              const communityName = getCommunityName(post);
              const mediaUrl = getMediaUrl(post.mediaUrl);
              const liked = isLiked(post);
              const disliked = isDisliked(post);

              return (
                <article
                  key={post._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={userName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm ${profilePic ? "hidden" : ""}`}
                        >
                          {userName[0]?.toUpperCase() || "U"}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{userName}</h3>
                          {communityName && (
                            <>
                              <span className="text-gray-400">·</span>
                              <span className="text-gray-500 text-xs">{communityName}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
                      </div>

                      {/* Edit/Delete Buttons (only for user's own posts) */}
                      {isMyPost(post) && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(post)}
                            disabled={editing === post._id}
                            className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="Edit post"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            disabled={deleting === post._id}
                            className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete post"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  {editing === post._id ? (
                    <div className="px-4 pb-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="What's on your mind?"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(post._id)}
                          disabled={saving === post._id || !editText.trim()}
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving === post._id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving === post._id}
                          className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    post.text && (
                      <div className="px-4 pb-3">
                        <p className="text-gray-900 whitespace-pre-line leading-relaxed">{post.text}</p>
                      </div>
                    )
                  )}

                  {/* Post Media */}
                  {mediaUrl && (
                    <div className="w-full bg-black">
                      {post.mediaType === "video" ? (
                        <div className="w-full flex items-center justify-center bg-black">
                          <video
                            src={mediaUrl}
                            controls
                            className="max-w-full max-h-96 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-center bg-black min-h-[200px]">
                          <img
                            src={mediaUrl}
                            alt="Post media"
                            className="max-w-full max-h-96 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    {/* Like/Dislike Counts */}
                    {(post.likeCount > 0 || post.dislikeCount > 0) && (
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        {post.likeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.85-1.22l3.02-7.05c.09-.23.13-.47.13-.73v-2z"/>
                            </svg>
                            {post.likeCount}
                          </span>
                        )}
                        {post.dislikeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M15 3H6c-.83 0-1.54.5-1.85 1.22l-3.02 7.05c-.09.23-.13.47-.13.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                            </svg>
                            {post.dislikeCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReact(post._id, "like")}
                        disabled={reacting === post._id}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          liked
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "text-gray-600 hover:bg-gray-100"
                        } disabled:opacity-50`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.85-1.22l3.02-7.05c.09-.23.13-.47.13-.73v-2z"/>
                        </svg>
                        Like
                      </button>
                      <button
                        onClick={() => handleReact(post._id, "dislike")}
                        disabled={reacting === post._id}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          disliked
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "text-gray-600 hover:bg-gray-100"
                        } disabled:opacity-50`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 3H6c-.83 0-1.54.5-1.85 1.22l-3.02 7.05c-.09.23-.13.47-.13.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                        </svg>
                        Dislike
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
