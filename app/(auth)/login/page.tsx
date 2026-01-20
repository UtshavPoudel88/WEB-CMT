"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-actions";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const submit = (values: LoginData) => {
    setServerError("");

    startTransition(async () => {
      const res = await handleLogin(values);
      res.success ? router.push("/") : setServerError(res.message);
    });
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-white/1000 text-center mb-1">Welcome back 👋</h1>
      <p className="text-sm text-center text-white/100 mb-6">
        Sign in to continue
      </p>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {/* Email */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register("email")}
              placeholder="Email"
              className="h-11 w-full pl-10 rounded-lg border"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              className="h-11 w-full pl-10 rounded-lg border"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          disabled={pending || isSubmitting}
          className="h-11 w-full rounded-lg bg-violet-600 text-white font-semibold flex justify-center items-center gap-2"
        >
          {(pending || isSubmitting) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Sign In
        </button>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-violet-600 font-semibold">
            Create one
          </Link>
        </p>
      </form>
    </>
  );
}
