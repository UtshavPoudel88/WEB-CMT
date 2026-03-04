"use client";


import React, { useEffect, useState } from "react";
import { getAllPosts, deletePost, type Post } from "@/lib/api/posts";
import { getImageUrl } from "@/lib/api/endpoints";
import axiosInstance from "@/lib/api/axios";
import type { AxiosError } from "axios";

interface PostWithDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  } | string;
  communityId: {
    _id: string;
    title: string;
    image?: string;
  } | string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "";
  likes: string[];
  dislikes: string[];
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  displayName?: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPosts();
      setPosts(data as PostWithDetails[]);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    if (deleting) return;
    try {
      setDeleting(postId);
      setError(null);
      await deletePost(postId);
      await loadPosts(); // Reload posts after deletion
    } catch (err) {
      console.error("Failed to delete post:", err);
      const errorMessage = err instanceof Error 
        ? (err as AxiosError<{ message?: string }>).response?.data?.message || err.message 
        : "Failed to delete post. Please try again.";
      setError(errorMessage || "Failed to delete post. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const getMediaUrl = (mediaUrl?: string) => getImageUrl(mediaUrl ?? undefined);
  const getUserProfilePicture = (post: PostWithDetails) => {
    if (post.userId && typeof post.userId === "object" && post.userId !== null && post.userId.profilePicture) {
      return getImageUrl(post.userId.profilePicture);
    }
    return null;
  };
  const getCommunityImage = (post: PostWithDetails) => {
    if (post.communityId && typeof post.communityId === "object" && post.communityId !== null && post.communityId.image) {
      return getImageUrl(post.communityId.image);
    }
    return null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Posts</h1>
        <p className="text-sm text-gray-600 mt-2">
          Manage all posts across all communities. View details and delete posts as needed.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 text-sm">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const profilePic = getUserProfilePicture(post);
            const communityImg = getCommunityImage(post);
            const mediaUrl = getMediaUrl(post.mediaUrl);
            const userName =
              post.userId && typeof post.userId === "object" && post.userId !== null && post.userId.name
                ? post.userId.name
                : post.displayName || "Unknown User";
            const userEmail =
              post.userId && typeof post.userId === "object" && post.userId !== null && post.userId.email 
                ? post.userId.email 
                : "N/A";
            const communityName =
              post.communityId && typeof post.communityId === "object" && post.communityId !== null && post.communityId.title
                ? post.communityId.title
                : "Unknown Community";

            return (
              <div
                key={post._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={userName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold ${profilePic ? "hidden" : ""}`}
                        >
                          {userName[0]?.toUpperCase() || "U"}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{userName}</h3>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{userEmail}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{formatTime(post.createdAt)}</p>

                        {/* Community Info */}
                        <div className="flex items-center gap-2">
                          {communityImg ? (
                            <img
                              src={communityImg}
                              alt={communityName}
                              className="w-5 h-5 rounded object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold ${communityImg ? "hidden" : ""}`}
                          >
                            {communityName[0]?.toUpperCase() || "C"}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">{communityName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(post._id)}
                      disabled={deleting === post._id}
                      className="flex-shrink-0 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                    >
                      {deleting === post._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <p className="text-gray-900 whitespace-pre-line leading-relaxed mb-4">
                    {post.text}
                  </p>

                  {/* Post Media */}
                  {mediaUrl && (
                    <div className="mb-4">
                      {post.mediaType === "video" ? (
                        <video
                          src={mediaUrl}
                          controls
                          className="max-w-full max-h-96 rounded-lg bg-black"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Post media"
                          className="max-w-full max-h-96 rounded-lg object-contain bg-gray-100"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.85-1.22l3.02-7.05c.09-.23.13-.47.13-.73v-2z"/>
                      </svg>
                      <span className="font-medium">{post.likeCount || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 3H6c-.83 0-1.54.5-1.85 1.22l-3.02 7.05c-.09.23-.13.47-.13.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                      </svg>
                      <span className="font-medium">{post.dislikeCount || 0} dislikes</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Post ID: <span className="font-mono">{post._id}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

