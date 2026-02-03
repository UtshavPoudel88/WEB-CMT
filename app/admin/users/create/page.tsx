"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminCreateUserSchema, AdminCreateUserData } from "../schema";
import { adminCreateUser } from "@/lib/api/admin";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [pending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateUserData>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      role: "user",
    },
  });

  const submit = (values: AdminCreateUserData) => {
    setServerError("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("role", values.role);
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const res = await adminCreateUser(formData);
        if (res.success) {
          router.push("/admin/users");
        } else {
          setServerError(res.message || "Failed to create user");
        }
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create User</h1>
        <p className="text-slate-600 mb-6">Admin user creation form</p>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              {...register("name")}
              className="mt-1 h-11 w-full rounded-lg border px-3"
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              {...register("email")}
              className="mt-1 h-11 w-full rounded-lg border px-3"
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 h-11 w-full rounded-lg border px-3"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              {...register("role")}
              className="mt-1 h-11 w-full rounded-lg border px-3"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
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
            disabled={pending || isSubmitting}
            className="h-11 w-full rounded-lg bg-violet-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {(pending || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />}
            Create user
          </button>
        </form>
      </div>
    </div>
  );
}
