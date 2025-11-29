"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { register as signupRequest } from "@/lib/api/auth";
import { countries } from "@/lib/services/countries.js";
import { useRouter } from "next/navigation";

// --- Type Definitions ---
interface SignupFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  lga?: string;
}

interface Country {
  name: string;
  states: Array<{ name: string; subdivision?: string[] }>;
}

// --- Constants ---
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const countryData: Country[] = countries as Country[];

// --- Component ---
export default function SignupPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>();

  const password = watch("password", "");
  const selectedCountryName = watch("country");
  const selectedStateName = watch("state");

  const selectedCountry = countryData.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  const selectedStateObj = selectedCountry?.states.find(
    (state) => state.name.toLowerCase() === selectedStateName
  );

  const lgas = selectedStateObj?.subdivision || [];

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      const res = await signupRequest({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        country: data.country,
        state: data.state,
        lga: data.lga || "",
      });

      const { data: resData, message } = res;
      const { user: responseUser } = resData;

      if (!responseUser) throw new Error("No user returned from server");

      toast.success(
        message || "Signup successful! Please check your email for verification."
      );

      router.push("/post-signup");
    } catch (err) {
      console.error("Signup failed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Signup failed. Please check your details and try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/auth/agriculture-healthy-food.jpg')] bg-cover bg-center relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-6 md:p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl text-white">
        <div className="h-28 w-28 flex justify-center mx-auto mt-2 mb-4">
          <Image
            src="/images/auth/famtech-logo-two.png"
            width={96}
            height={96}
            alt="logo"
            className=" "
          />
        </div>

        <h2 className="text-3xl font-bold -mt-6 mb-6 text-center text-white">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.email && (
            <p className="text-red-300 text-sm">{errors.email.message}</p>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters." },
                pattern: {
                  value: strongPasswordRegex,
                  message:
                    "Password must include uppercase, lowercase, number & special character.",
                },
              })}
              className="w-full p-3 rounded-xl bg-white/20 border border-white/30 pr-10 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <span
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-white/80"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && (
            <p className="text-red-300 text-sm">{errors.password.message}</p>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match.",
              })}
              className="w-full p-3 rounded-xl bg-white/20 border border-white/30 pr-10 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <span
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-white/80"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-300 text-sm">{errors.confirmPassword.message}</p>
          )}

          {/* Country */}
          <select
            {...register("country", { required: "Country is required" })}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" hidden>
              Select Country
            </option>
            {countryData.map((country: Country) => (
              <option key={country.name} value={country.name.toLowerCase()} className="text-black">
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-300 text-sm">{errors.country.message}</p>
          )}

          {/* State */}
          <select
            {...register("state", { required: "State is required" })}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={!selectedCountry}
          >
            <option value="" hidden>
              Select State
            </option>
            {selectedCountry &&
              selectedCountry.states.map((state) => (
                <option key={state.name} value={state.name.toLowerCase()} className="text-black">
                  {state.name}
                </option>
              ))}
          </select>
          {errors.state && (
            <p className="text-red-300 text-sm">{errors.state.message}</p>
          )}

          {/* LGA */}
          {selectedCountryName === "nigeria" && lgas.length > 0 && (
            <select
              {...register("lga")}
              className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={!selectedStateName}
            >
              <option value="">Select LGA (Optional)</option>
              {lgas.map((lga, index) => (
                <option key={index} value={lga.toLowerCase()} className="text-black">
                  {lga}
                </option>
              ))}
            </select>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition duration-300 disabled:bg-green-400 font-semibold"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:underline font-medium ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
