"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { useAuthStore, User } from "@/lib/store/authStore";
import { register as signupRequest } from "@/lib/api/auth";

interface SignupFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  region: string;
  language: string;
}

export default function SignupPage() {
  // const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>();

  const onSubmit = async (data: SignupFormInputs) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await signupRequest({
        email: data.email,
        password: data.password,
        region: data.region,
        language: data.language,
      });

      console.log("Signup response:", res);

      // ---
      // CORRECTED CODE: We are no longer destructuring `tokens`
      // from the response because the API documentation doesn't show it
      // as part of a successful signup response.
      // ---
      const { data: resData, message } = res;
      const { user: responseUser } = resData;

      if (!responseUser) {
        throw new Error("No user returned from server");
      }

      const user: User = {
        id: responseUser.id,
        email: responseUser.email,
        role: responseUser.role ?? "user",
        region: responseUser.region ?? "",
        language: responseUser.language ?? "en",
        isVerified: responseUser.isVerified ?? false,
      };

      useAuthStore.getState().setUser(user);
      
      // We are not getting a token after signup.
      // The user will get a verification email and will be redirected to the verification page
      // so no need to set a token here.

      toast.success(message || "Signup successful!");
      // router.push("/verify-email");
   } catch (err: unknown) {
  console.error("Signup failed:", err);
  const errorMessage = err instanceof Error ? err.message : "Something went wrong";
  toast.error(errorMessage);
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="h-24 w-24 flex justify-center mx-auto mt-6">
          <Image
            src="/images/auth/Logo 1.jpg"
            width={96}
            height={96}
            alt="logo"
            className="rounded-full"
          />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-3 border-gray-600 border rounded-xl"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}

          {/* password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full p-3 border-gray-600 border rounded-xl pr-10"
            />
            <span
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* confirm password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
              className="w-full p-3 border-gray-600 border rounded-xl pr-10"
            />
            <span
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* region */}
          <input
            type="text"
            placeholder="Region"
            {...register("region", { required: "Region is required" })}
            className="w-full p-3 border-gray-600 border rounded-xl"
          />

          {/* language */}
          <select
            {...register("language", { required: "Language is required" })}
            className="w-full p-3 border-gray-600 border rounded-xl"
          >
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="yo">Yoruba</option>
            <option value="ha">Hausa</option>
            <option value="ig">Igbo</option>
            <option value="pcm">Pidgin</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white p-3 rounded-xl"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}