"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
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
    const [pending, setTransition] = useTransition();

    const submit = async (values: RegisterData) => {
        setTransition(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push("/login");
        });
        console.log("register", values);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232946] to-[#eaeaea]">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-lg w-full border border-[#e0e7ef] backdrop-blur-md relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#2563eb]/10 rounded-full blur-2xl z-0" />
                <form onSubmit={handleSubmit(submit)} className="space-y-7 relative z-10">
                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-extrabold text-[#232946] tracking-tight mb-2">Create Account</h2>
                        <p className="text-[#6b7280] text-sm">Sign up to get started</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#232946]" htmlFor="name">Full name</label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            className="h-11 w-full rounded-lg border border-[#e0e7ef] bg-[#f4f6fb] px-4 text-base outline-none focus:border-[#2563eb] focus:bg-white transition"
                            {...register("name")}
                            placeholder="XYZ"
                        />
                        {errors.name?.message && (
                            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#232946]" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="h-11 w-full rounded-lg border border-[#e0e7ef] bg-[#f4f6fb] px-4 text-base outline-none focus:border-[#2563eb] focus:bg-white transition"
                            placeholder="xyz"
                            
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#232946]" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="h-11 w-full rounded-lg border border-[#e0e7ef] bg-[#f4f6fb] px-4 text-base outline-none focus:border-[#2563eb] focus:bg-white transition"
                            {...register("email")}
                            placeholder="example@example.com"
                        />
                        {errors.email?.message && (
                            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#232946]" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="h-11 w-full rounded-lg border border-[#e0e7ef] bg-[#f4f6fb] px-4 text-base outline-none focus:border-[#2563eb] focus:bg-white transition"
                            {...register("password")}
                            placeholder="••••••••"
                        />
                        {errors.password?.message && (
                            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#232946]" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="h-11 w-full rounded-lg border border-[#e0e7ef] bg-[#f4f6fb] px-4 text-base outline-none focus:border-[#2563eb] focus:bg-white transition"
                            {...register("confirmPassword")}
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword?.message && (
                            <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || pending}
                        className="h-11 w-full rounded-lg bg-gradient-to-r from-[#2563eb] to-[#232946] text-white text-lg font-bold shadow-md hover:from-[#1d4ed8] hover:to-[#232946] transition disabled:opacity-60"
                    >
                        {isSubmitting || pending ? "Creating account..." : "Sign Up"}
                    </button>
                    <div className="mt-2 text-center text-sm text-[#232946]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#2563eb] font-semibold hover:underline transition">Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
