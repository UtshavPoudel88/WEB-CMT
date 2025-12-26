"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { LoginData, loginSchema } from "../schema";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/dashboard");
    });
    console.log(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232946] via-[#3b4b8a] to-[#eaeaea]">
      <div className="relative w-full max-w-md">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#2563eb]/20 rounded-full blur-3xl" />

        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8">
          <form onSubmit={handleSubmit(submit)} className="space-y-6">
            <div className="text-center">
              <Image
                src="/images/img1.png"
                alt="Logo"
                width={80}
                height={80}
                className="mx-auto rounded-full shadow-md mb-2"
                priority
              />
              <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white rounded-xl py-2 text-2xl font-bold shadow-md">
                Login Page
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email or Mobile Number
              </label>
              <input
                type="text"
                placeholder="example@example.com"
                {...register("email")}
                className="
                  h-12 w-full rounded-xl
                  border border-slate-200
                  bg-white/70
                  px-4 text-base
                  shadow-sm
                  outline-none
                  transition-all
                  focus:border-[#2563eb]
                  focus:ring-2 focus:ring-[#2563eb]/30
                "
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1 animate-pulse">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="
                    h-12 w-full rounded-xl
                    border border-slate-200
                    bg-white/70
                    px-4 pr-10 text-base
                    shadow-sm
                    outline-none
                    transition-all
                    focus:border-[#2563eb]
                    focus:ring-2 focus:ring-[#2563eb]/30
                  "
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2563eb] cursor-pointer">
                  👁️
                </span>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1 animate-pulse">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot */}
            <div className="flex justify-end text-xs">
              <span className="text-[#2563eb] font-semibold hover:underline cursor-pointer transition">
                Forget Password?
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting || pending}
              className="
                h-12 w-full rounded-xl
                bg-gradient-to-r from-[#2563eb] to-[#1e40af]
                text-white text-lg font-bold
                shadow-lg
                transition-all duration-200
                hover:scale-[1.02]
                hover:shadow-xl
                active:scale-[0.98]
                disabled:opacity-60
              "
            >
              {isSubmitting || pending ? "Logging in..." : "Log In"}
            </button>

            <p className="text-center text-sm text-slate-700">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[#2563eb] font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
