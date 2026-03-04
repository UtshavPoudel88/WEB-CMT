"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt?: string;
  role?: string; // "user" or "admin"
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load user from localStorage on mount
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken && storedUser) {
        try {
          setTimeout(() => {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setLoading(false);
          }, 0);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => setLoading(false), 0);
        }
      } else {
        setTimeout(() => setLoading(false), 0);
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      document.cookie = `accessToken=${newToken}; path=/; max-age=${30 * 24 * 60 * 60}`;
      // Cookie for Next.js proxy/middleware (server-side) so /user and /admin aren't redirected to login
      const userCookie = encodeURIComponent(JSON.stringify({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role ?? "user",
      }));
      document.cookie = `user=${userCookie}; path=/; max-age=${30 * 24 * 60 * 60}`;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    // Go back to public landing page
    router.push("/");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      const userCookie = encodeURIComponent(JSON.stringify({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role ?? "user",
      }));
      document.cookie = `user=${userCookie}; path=/; max-age=${30 * 24 * 60 * 60}`;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

