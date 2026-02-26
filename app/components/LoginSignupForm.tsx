"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginSignupForm = () => {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isSignup
      ? "http://localhost:5000/community/customers/signup"
      : "http://localhost:5000/community/customers/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
      // Store JWT and user info
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data || {}));
      }
      // Redirect based on role (admin logic can be customized)
      router.push("/dashboard");
    } catch (err) {
      setError("Network error or server not responding");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{isSignup ? "Sign Up" : "Log In"}</h2>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              className="w-full mb-4 p-2 border rounded"
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            className="w-full mb-4 p-2 border rounded"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full mb-4 p-2 border rounded"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <button className="w-full bg-blue-600 text-white py-2 rounded mb-2" type="submit">
            {isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>
        <button
          className="w-full bg-gray-200 text-gray-700 py-2 rounded"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default LoginSignupForm;
