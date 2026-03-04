"use client";



import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { createPost } from "@/lib/api/posts";
import { getMyCommunities } from "@/lib/api/communities";
import Link from "next/link";

const ADMIN_EMAILS =
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export default function UserAddPost() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, user]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const myCommunities = await getMyCommunities();
      setCommunities(myCommunities);
      if (myCommunities.length > 0) {
        setCommunityId(myCommunities[0]._id);
      }
    } catch (error) {
      console.error("Failed to load communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Only allow images
      if (!file.type.startsWith("image/")) {
        setMessage("Only image files are allowed. Videos are not supported.");
        return;
      }
      
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId) {
      setMessage("Please select a community");
      return;
    }
    if (!text.trim() && !media) {
      setMessage("Please add text or media to your post");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const formData = new FormData();
      formData.append("text", text);
      formData.append("communityId", communityId);
      if (media) {
        formData.append("media", media);
        formData.append("mediaType", "image");
      }

      await createPost(formData);
      setMessage("Post created successfully!");
      setText("");
      setMedia(null);
      setPreview("");

      setTimeout(() => {
        router.push("/user/feed");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create post:", error);
      setMessage(error.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
          <p className="mt-4 text-[var(--ink-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="min-h-screen app-bg py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="glass-panel rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-[var(--ink-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Join a Community First</h2>
            <p className="text-[var(--ink-muted)] mb-6">
              You need to join at least one community before you can create posts.
            </p>
            <Link
              href="/user/explore"
              className="inline-block px-6 py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-dark)] transition-colors"
            >
              Explore Communities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">Create New Post</h1>
          <p className="text-[var(--ink-muted)]">Share your thoughts with your communities</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8">
          {/* Community Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Select Community <span className="text-red-500">*</span>
            </label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--stroke)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--panel)] text-[var(--foreground)]"
              required
            >
              {communities.map((community) => (
                <option key={community._id} value={community._id}>
                  {community.title}
                </option>
              ))}
            </select>
          </div>

          {/* Text Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Post Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="w-full px-4 py-3 border border-[var(--stroke)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--panel)] text-[var(--foreground)] resize-none"
            />
            <p className="text-xs text-[var(--ink-muted)] mt-2">{text.length}/1000 characters</p>
          </div>

          {/* Media Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Add Media (Optional)
            </label>
            <div className="border-2 border-dashed border-[var(--stroke)] rounded-xl p-6 text-center hover:border-[var(--brand)] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setMedia(null);
                        setPreview("");
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-[var(--ink-muted)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-[var(--foreground)] font-medium mb-1">
                      Click to upload image
                    </p>
                    <p className="text-sm text-[var(--ink-muted)]">PNG, JPG, GIF, WEBP up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || (!text.trim() && !media)}
              className="flex-1 px-6 py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Post..." : "Create Post"}
            </button>
            <Link
              href="/user/feed"
              className="px-6 py-3 bg-[var(--panel-soft)] text-[var(--foreground)] rounded-xl font-semibold hover:bg-[var(--stroke)] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


