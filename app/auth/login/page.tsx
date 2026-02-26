"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, type LoginFormData } from "@/lib/api/auth";
import { useAuth } from "@/lib/context/AuthContext";

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginUser(form);

      if (result.token) {
        // Store token first so it's available for the next request and for redirect
        if (typeof window !== "undefined") {
          localStorage.setItem("token", result.token);
          document.cookie = `accessToken=${result.token}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }

        // Fetch user data using the email (requires token in cookie/header)
        try {
          const axiosInstance = (await import("@/lib/api/axios")).default;
          const usersRes = await axiosInstance.get("/community/customers");
          const user = usersRes.data.data?.find((u: any) => u.email === form.email);
          
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          const isAdminByEmail = adminEmails.includes((user?.email ?? form.email).toLowerCase());
          const resolvedRole = user?.role === "admin" || isAdminByEmail ? "admin" : "user";

          const userPayload = user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                role: resolvedRole,
              }
            : {
                _id: "",
                name: form.email.split("@")[0],
                email: form.email,
                role: resolvedRole,
              };

          login(result.token, userPayload);

          const targetPath = resolvedRole === "admin" ? "/admin" : "/user/dashboard";
          window.location.href = targetPath;
          return;
        } catch (fetchError) {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          const isAdminEmail = adminEmails.includes(form.email.toLowerCase());
          login(result.token, {
            _id: "",
            name: form.email.split("@")[0],
            email: form.email,
            role: isAdminEmail ? "admin" : "user",
          });
          const targetPath = isAdminEmail ? "/admin" : "/user/dashboard";
          window.location.href = targetPath;
          return;
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      if (err?.message?.includes("Network Error") || err?.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure the backend is running (e.g. http://localhost:3000) and NEXT_PUBLIC_API_BASE_URL is set correctly.");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-md rounded-2xl px-6 py-7 sm:px-8 sm:py-8">
        {/* Back to landing page */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-ink-muted hover:text-foreground transition-colors"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-panel-soft text-foreground">
              ←
            </span>
            <span>Back to home</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold mb-1 text-foreground">Welcome back</h1>
        <p className="text-xs sm:text-sm text-ink-muted mb-6">
          Use the same email and password as in the mobile app.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-muted" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stroke text-center text-xs sm:text-sm text-ink-muted">
          <span>Don&apos;t have an account? </span>
          <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

