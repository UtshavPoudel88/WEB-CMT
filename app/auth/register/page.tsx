"use client";


import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, type RegisterFormData } from "@/lib/api/auth";

const passwordIsStrong = (password: string) => {
  // At least 5 chars, one uppercase, one lowercase, one number, one symbol
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/;
  return strongRegex.test(password);
};

const Register = () => {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    // Client-side password validation
    if (!passwordIsStrong(form.password)) {
      setPasswordError(
        "Password must be at least 5 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    if (form.password !== confirmPassword) {
      setPasswordError("Password and confirm password must match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(form);
      router.push("/auth/login");
    } catch (err: any) {
      // Provide more specific error messages
      if (err?.message?.includes("Network Error") || err?.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure the backend is running (e.g. http://localhost:3000) and NEXT_PUBLIC_API_BASE_URL is set correctly.");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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

        <h1 className="text-2xl sm:text-3xl font-semibold mb-1 text-foreground">Create your account</h1>
        <p className="text-xs sm:text-sm text-ink-muted mb-6">
          Sign up to start joining communities from the web.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-muted" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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
            <div className="relative">
              <input
                id="password"
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-xs text-ink-muted hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[10px] text-ink-muted">
              Must be at least 5 characters and include uppercase, lowercase, number, and symbol.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              className="block text-xs font-semibold text-ink-muted"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-xs text-ink-muted hover:text-foreground"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {passwordError}
            </div>
          )}

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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stroke text-center text-xs sm:text-sm text-ink-muted">
          <span>Already have an account? </span>
          <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

