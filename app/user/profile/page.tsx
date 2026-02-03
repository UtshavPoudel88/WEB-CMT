"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { updateUser } from "@/lib/api/auth";
import { Loader2 } from "lucide-react";

type UserCookie = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
};

const parseUserCookie = (): UserCookie | null => {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("user="));

  if (!cookie) return null;
  const value = cookie.substring("user=".length);
  try {
    return JSON.parse(decodeURIComponent(value)) as UserCookie;
  } catch {
    try {
      return JSON.parse(value) as UserCookie;
    } catch {
      return null;
    }
  }
};

export default function UserProfilePage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [user, setUser] = useState<UserCookie | null>(null);

  useEffect(() => {
    setUser(parseUserCookie());
  }, []);

  const initialValues = useMemo(
    () => ({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    }),
    [user]
  );

  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const userId = user?.id;
    if (!userId) {
      setServerError("User not found. Please login again.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", formValues.name);
        formData.append("email", formValues.email);
        if (formValues.password) {
          formData.append("password", formValues.password);
        }
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const res = await updateUser(userId, formData);
        if (res.success) {
          setSuccess(res.message || "Profile updated");
        } else {
          setServerError(res.message || "Failed to update profile");
        }
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600 mb-6">Update your profile details</p>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
            {serverError}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="mt-1 h-11 w-full rounded-lg border px-3"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className="mt-1 h-11 w-full rounded-lg border px-3"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              className="mt-1 h-11 w-full rounded-lg border px-3"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Profile image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-lg bg-violet-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update profile
          </button>
        </form>
      </div>
    </div>
  );
}
