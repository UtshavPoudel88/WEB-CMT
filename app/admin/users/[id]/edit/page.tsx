"use client";

import { useEffect, useState, useTransition } from "react";
import { adminGetUser, adminUpdateUser, AdminUser } from "@/lib/api/admin";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function AdminUserEditPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [formValues, setFormValues] = useState({ name: "", email: "", role: "user" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setError("");
      try {
        const res = await adminGetUser(id);
        setUser(res.data);
        setFormValues({
          name: res.data.name || "",
          email: res.data.email || "",
          role: res.data.role || "user",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      }
    };

    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!id) {
      setError("Invalid user id");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", formValues.name);
        formData.append("email", formValues.email);
        formData.append("role", formValues.role);
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const res = await adminUpdateUser(id, formData);
        setUser(res.data);
        setSuccess(res.message || "User updated");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update user");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Edit User</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">
            {success}
          </div>
        )}

        {!user && !error && (
          <p className="text-slate-500">Loading user...</p>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                name="name"
                value={formValues.name}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-lg border px-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                value={formValues.email}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-lg border px-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                name="role"
                value={formValues.role}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-lg border px-3"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Image (optional)</label>
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
              Update user
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
