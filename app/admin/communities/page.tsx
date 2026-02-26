"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { getAllCommunities, createCommunity } from "@/lib/api/communities";
import { getImageUrl } from "@/lib/api/endpoints";

export default function AdminCommunities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [newCommunity, setNewCommunity] = useState({
    title: "",
    image: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const communitiesRes = await getAllCommunities();
      setCommunities(communitiesRes || []);
    } catch (err) {
      console.error("Failed to load communities:", err);
      setError("Failed to load communities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.title || (!imageFile && !newCommunity.image)) {
      setError("Please provide a title and either upload an image or provide an image URL");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createCommunity({
        title: newCommunity.title,
        image: imageFile ? undefined : newCommunity.image,
        imageFile: imageFile || undefined,
        description: newCommunity.description,
      });
      setNewCommunity({ title: "", image: "", description: "" });
      setImageFile(null);
      setImagePreview("");
      // Reset file input
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      await loadCommunities();
    } catch (err: any) {
      console.error("Failed to create community:", err);
      setError(err.message || "Failed to create community. Please check the data and try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCommunity = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this community? This cannot be undone.")) return;
    try {
      setError(null);
      await axiosInstance.delete(`/community/communities/${id}`);
      await loadCommunities();
    } catch (err) {
      console.error("Failed to delete community:", err);
      setError("Failed to delete community. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Communities</h1>
        <p className="text-sm text-gray-600 mt-2">
          Create and manage communities on your platform.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Create Community Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Community</h2>
        <form className="space-y-4" onSubmit={handleCreateCommunity}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="text"
                value={newCommunity.title}
                onChange={(e) => setNewCommunity((prev) => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Community name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image-upload">
                Community Image <span className="text-red-500">*</span>
              </label>
              <input
                id="image-upload"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Or provide an image URL:</p>
              <input
                id="image-url"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mt-1"
                type="text"
                value={newCommunity.image}
                onChange={(e) => {
                  setNewCommunity((prev) => ({ ...prev, image: e.target.value }));
                  if (e.target.value) {
                    setImageFile(null);
                    setImagePreview("");
                  }
                }}
                placeholder="https://example.com/image.jpg (optional if uploading file)"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description (optional)
            </label>
            <textarea
              id="description"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              rows={3}
              value={newCommunity.description}
              onChange={(e) => setNewCommunity((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this community..."
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>

      {/* Communities Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Communities</h2>
        {communities.length === 0 ? (
          <p className="text-gray-500 text-sm">No communities created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4 hidden md:table-cell">Description</th>
                  <th className="py-3 pr-4">Image</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((c: any) => (
                  <tr key={c._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{c.title}</td>
                    <td className="py-3 pr-4 hidden md:table-cell text-gray-600 line-clamp-1">
                      {c.description || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {c.image && getImageUrl(c.image) ? (
                        <>
                          <img
                            src={getImageUrl(c.image)!}
                            alt={c.title}
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                          <div className="h-10 w-10 rounded-lg bg-gray-100 hidden flex items-center justify-center text-gray-400 text-xs font-medium">
                            {c.title?.slice(0, 1)?.toUpperCase() || "—"}
                          </div>
                        </>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                          {c.title?.slice(0, 1)?.toUpperCase() || "—"}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-0 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCommunity(c._id)}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

