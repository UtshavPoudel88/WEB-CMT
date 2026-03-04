"use client";



import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import axiosInstance from "@/lib/api/axios";
import { API, API_BASE_URL } from "@/lib/api/endpoints";

const ADMIN_EMAILS =
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export default function UserProfile() {
  const { user, token, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API.AUTH.GET_USER(user!._id));
      const userData = res.data.data;
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        password: "",
      });
      setConfirmPassword("");
      setPasswordError(null);

      let profilePic = "";
      if (userData.profilePicture) {
        if (userData.profilePicture.startsWith("http")) {
          profilePic = userData.profilePicture;
        } else {
          const timestamp = new Date().getTime();
          profilePic = `${API_BASE_URL}${userData.profilePicture}?t=${timestamp}`;
        }
      } else {
        profilePic =
          "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(userData.name || "User") +
          "&background=2b6bff&color=fff";
      }
      setPreview(profilePic);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setMessage("");
      setPasswordError(null);

      if (form.password) {
        const strongRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/;
        if (!strongRegex.test(form.password)) {
          setPasswordError(
            "Password must be at least 5 characters and include uppercase, lowercase, number, and symbol."
          );
          setSaving(false);
          return;
        }
        if (form.password !== confirmPassword) {
          setPasswordError("Password and confirm password must match.");
          setSaving(false);
          return;
        }
      }

      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        const uploadRes = await axiosInstance.post(
          API.AUTH.UPLOAD_PROFILE_PICTURE(user._id),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (uploadRes.data.success) {
          const timestamp = new Date().getTime();
          const profilePicPath = uploadRes.data.data.profilePicture;
          const profilePicUrl = uploadRes.data.data.profilePictureUrl
            ? `${uploadRes.data.data.profilePictureUrl}?t=${timestamp}`
            : `${API_BASE_URL}${profilePicPath}?t=${timestamp}`;

          setPreview(profilePicUrl);

          if (profilePicPath) {
            updateUser({
              ...user,
              profilePicture: profilePicPath,
            });
          }
        }
      }

      const updateData: any = { name: form.name, email: form.email };
      if (form.password) {
        updateData.password = form.password;
      }

      const res = await axiosInstance.put(API.AUTH.UPDATE_USER(user._id), updateData);
      if (res.data.success) {
        setPhoto(null);
        await loadUserData();
        updateUser(res.data.data);
        setEditMode(false);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
          <p className="mt-4 text-[var(--ink-muted)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">Profile</h1>
          <p className="text-[var(--ink-muted)]">Manage your account settings and preferences</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-[var(--stroke)]">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[var(--brand)]/20 bg-gray-200">
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User"
                    )}&background=2b6bff&color=fff`;
                  }}
                />
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-[var(--brand)] text-white p-3 rounded-full cursor-pointer hover:bg-[var(--brand-dark)] transition-colors shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{user?.name || "User"}</h2>
            <p className="text-[var(--ink-muted)]">{user?.email}</p>
          </div>

          {/* Profile Form */}
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Name</label>
                <input
                  className="w-full px-4 py-3 border border-[var(--stroke)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--panel)] text-[var(--foreground)]"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email</label>
                <input
                  className="w-full px-4 py-3 border border-[var(--stroke)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--panel)] text-[var(--foreground)]"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  New Password{" "}
                  <span className="text-[var(--ink-muted)] text-xs">
                    (leave blank to keep current)
                  </span>
                </label>
                <div className="relative mb-2">
                  <input
                    className="w-full px-4 py-3 pr-16 border border-[var(--stroke)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--panel)] text-[var(--foreground)]"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-4 text-xs text-[var(--ink-muted)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pr-16 border border-[var(--stroke)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--panel)] text-[var(--foreground)]"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute inset-y-0 right-0 px-4 text-xs text-[var(--ink-muted)] hover:text-[var(--foreground)]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  Must be at least 5 characters and include uppercase, lowercase, number, and symbol.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  {passwordError}
                </div>
              )}

              {message && (
                <div
                  className={`p-4 rounded-xl ${
                    message.includes("successfully")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setPhoto(null);
                    loadUserData();
                    setMessage("");
                  }}
                  className="px-6 py-3 bg-[var(--panel-soft)] text-[var(--foreground)] rounded-xl font-semibold hover:bg-[var(--stroke)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Name</label>
                <p className="text-lg text-[var(--foreground)]">{form.name || user?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Email</label>
                <p className="text-lg text-[var(--foreground)]">{form.email || user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">
                  Member Since
                </label>
                <p className="text-lg text-[var(--foreground)]">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              {message && (
                <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div>
              )}

              <button
                onClick={() => setEditMode(true)}
                className="w-full px-6 py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-dark)] transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


