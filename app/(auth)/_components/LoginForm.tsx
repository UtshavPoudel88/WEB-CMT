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
    const [pending, setTransition] = useTransition();

    const submit = async (values: LoginData) => {
        setTransition(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push("/dashboard");
        });
        console.log("login", values);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-6 w-full">
            <div className="text-center mb-2">
                <Image
                    src="/images/img1.png"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="mx-auto mb-2 rounded-full shadow"
                    priority
                />
                <div className="bg-[#2563eb] text-white rounded-xl py-2 text-2xl font-bold mb-4 tracking-wide shadow-md">Login Page</div>
            </div>
            <div className="space-y-1">
                <label className="text-base font-semibold text-[#232946]" htmlFor="email">Email or Mobile Number</label>
                <input
                    id="email"
                    type="text"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border-none bg-[#f4f6fb] px-4 text-base outline-none focus:ring-2 focus:ring-[#2563eb] text-[#232946] placeholder:text-[#2563eb]"
                    {...register("email")}
                    placeholder="example@example.com"
                />
                {errors.email?.message && (
                    <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
            </div>
            <div className="space-y-1">
                <label className="text-base font-semibold text-[#232946]" htmlFor="password">Password</label>
                <div className="relative">
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="h-12 w-full rounded-xl border-none bg-[#f4f6fb] px-4 text-base outline-none focus:ring-2 focus:ring-[#2563eb] text-[#232946] placeholder:text-[#2563eb] pr-10"
                        {...register("password")}
                        placeholder="••••••••"
                    />
                    {/* Eye icon placeholder for password visibility toggle */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2563eb] cursor-pointer select-none">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#2563eb" strokeWidth="2"/></svg>
                    </span>
                </div>
                {errors.password?.message && (
                    <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
                <span></span>
                <span className="text-[#232946] font-semibold cursor-pointer hover:underline transition">Forget Password</span>
            </div>
            <button
                type="submit"
                disabled={isSubmitting || pending}
                className="h-12 w-full rounded-xl bg-[#2563eb] text-white text-xl font-bold shadow-md hover:bg-[#1746a2] transition disabled:opacity-60"
            >
                {isSubmitting || pending ? "Logging in..." : "Log In"}
            </button>
            <div className="mt-1 text-center text-base text-[#232946]">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-[#2563eb] font-semibold hover:underline transition">Sign Up</Link>
            </div>
        </form>
    );
}
