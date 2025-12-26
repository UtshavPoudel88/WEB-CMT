"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterData, registerSchema } from "../schema";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const submit = async (values: RegisterData) => {
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/login");
    });
    console.log(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232946] via-[#3b4b8a] to-[#eaeaea]">
      <div className="relative w-full max-w-lg">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#2563eb]/20 rounded-full blur-3xl" />

        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-10">
          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-[#232946]">
                Create Account
              </h2>
              <p className="text-sm text-slate-600">
                Sign up to get started
              </p>
            </div>

            {[
              { label: "Full Name", id: "name", type: "text", placeholder: "XYZ" },
              { label: "Email", id: "email", type: "email", placeholder: "example@example.com" },
              { label: "Password", id: "password", type: "password", placeholder: "••••••••" },
              { label: "Confirm Password", id: "confirmPassword", type: "password", placeholder: "••••••••" },
            ].map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.id as keyof RegisterData)}
                  className="
                    h-11 w-full rounded-xl
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
                {errors[field.id as keyof RegisterData] && (
                  <p className="text-xs text-red-600 mt-1 animate-pulse">
                    {errors[field.id as keyof RegisterData]?.message as string}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting || pending}
              className="
                h-11 w-full rounded-xl
                bg-gradient-to-r from-[#2563eb] to-[#1e40af]
                text-white text-lg font-bold
                shadow-lg
                transition-all
                hover:scale-[1.02]
                hover:shadow-xl
                active:scale-[0.98]
                disabled:opacity-60
              "
            >
              {isSubmitting || pending ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-center text-sm text-slate-700">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#2563eb] font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
