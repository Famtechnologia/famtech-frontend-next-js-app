"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/authStore";
import { login } from "@/lib/api/auth";
import { toast } from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form.email, form.password);
      const { token, message } = res;

      useAuthStore.getState().setToken(token);

      toast.success(message || "Login successful!");

      if (user?.farmProfile) {
        router.push("/dashboard");
      } else {
        router.push("/complete-farm-profile");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Oops looks like your connection dropped, kindly refresh";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
            <p className="text-green-600 font-semibold">
              Logging in...
            </p>
          </div>
        )}

        <div className="h-24 w-24 flex justify-center mx-auto mt-6">
          <Image
            src="/images/auth/Logo 1.jpg"
            width={96}
            height={96}
            alt="logo"
            className="rounded-full"
          />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 border-gray-600 border rounded-xl"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <input
              className="w-full p-3 border-gray-600 border rounded-xl pr-10"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <a
            href="/forgot-password"
            className="self-end text-red-400 block text-right"
          >
            Forgot Password?
          </a>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-green-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
