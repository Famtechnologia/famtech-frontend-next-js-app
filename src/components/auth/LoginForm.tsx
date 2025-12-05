"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/authStore";
import { login } from "@/lib/api/auth";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { loginStaff } from "@/lib/services/staff";

interface LoginForm {
  email: string;
  password: string;
  role: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (form.role === "assignee") {
        const res = await loginStaff(form.email, form.password);
        const { token, message } = res;

        useAuthStore.getState().setToken(token);
        Cookies.set("famtech-auth", token, { expires: 3 });
        toast.success(message || "Assignee Login successful!");

        // ⏳ Keep loading true until navigation completes
        router.replace("/staffs/dashboard");
        return;
      } else if (form.role === "farmer") {
        const res = await login(form.email, form.password);
        const { token, message } = res;

        useAuthStore.getState().setToken(token);
        Cookies.set("famtech-auth", token, { expires: 3 });
        toast.success(message || "Login successful!");

        router.replace("/dashboard");
      }

      router.replace("/login");
      // No setLoading(false) here — it’ll unmount naturally after redirect
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Oops, looks like your connection dropped. Please refresh.";
      toast.error(errorMessage);
      setLoading(false); // Only remove if login fails
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/auth/agriculture-healthy-food.jpg')] bg-cover bg-center relative">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Glassmorphism container */}
      <div className="relative z-10 w-full max-w-md p-6 md:p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* ✅ Logging in overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl">
            <p className="text-green-300 font-semibold text-lg">
              Logging in...
            </p>
          </div>
        )}

        {/* Logo */}
        <div className="h-24 w-40 flex justify-center mx-auto mt-2 mb-4">
          <Image
            src="/images/auth/famtech-logo-two.png"
            width={96}
            height={96}
            alt="logo"
          />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <input
              className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/80"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <select
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="" hidden>
              Select Role
            </option>
            <option value="farmer" className="text-black">
              Farmer
            </option>
            <option value="assignee" className="text-black">
              Assignee
            </option>
          </select>

          <a
            href="/forgot-password"
            className="text-red-400 block text-right hover:underline"
          >
            Forgot Password?
          </a>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition duration-300 font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-green-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
