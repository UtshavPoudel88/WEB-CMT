"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const submit = (values: RegisterData) => {
    setServerError("");

    startTransition(async () => {
      const res = await handleRegister(values);
      res.success ? router.push("/login") : setServerError(res.message);
    });
  };

  return (
    <>
      {/* Header */}
      <h1 className="text-2xl font-bold text-white/1000 text-center mb-1">
        Create your account 🚀
      </h1>
      <p className="text-sm text-center text-white/100 mb-6">
        Sign up to get started!
      </p>

      {/* Server Error */}
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-100 text-red-600 px-4 py-2 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {/* Name */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register("name")}
              placeholder="Full name"
              className="h-11 w-full pl-10 rounded-lg border"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register("email")}
              placeholder="Email address"
              className="h-11 w-full pl-10 rounded-lg border"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">
              {errors.email.message}
            </p>
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
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm password"
              className="h-11 w-full pl-10 rounded-lg border"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={pending || isSubmitting}
          className="h-11 w-full rounded-lg bg-violet-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {(pending || isSubmitting) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Create account
        </button>

        {/* Footer */}
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-600 font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </>
  );
}
