"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore} from "@/lib/store/authStore";
import { register as signupRequest } from "@/lib/api/auth";
import { countries } from "@/lib/services/countries.js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
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

  // Watch values for conditional logic and validation
  const password = watch("password", "");
  const selectedCountryName = watch("country");
  const selectedStateName = watch("state");

  // Find the selected country object based on the watched value
  const selectedCountry = countryData.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  // Find the selected state object
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
        lga: data.lga || "", // 👈 optional LGA
      });

      console.log("Signup response:", res);

      const { data: resData, message } = res;
      const { user: responseUser } = resData;

      if (!responseUser) {
        throw new Error("No user returned from server");
      }

      //not needed any more
      // const user = {
      //   id: responseUser.id,
      //   email: responseUser.email,
      //   role: responseUser.role ?? "user",
      //   country: responseUser.country ?? "",
      //   state: responseUser.state ?? "",
      //   isVerified: responseUser.isVerified ?? false,
      //   lga: responseUser.lga ?? "",
      // };

      // useAuthStore.getState().setUser(user);

      toast.success(
        message ||
          "Signup successful! Please check your email for verification."
      );
      router.push("/post-signup");
      // router.push("/verify-email");
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
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-3 border-gray-600 border rounded-xl"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters.",
                },
                pattern: {
                  value: strongPasswordRegex,
                  message:
                    "Password must include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).",
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
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
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
              className="w-full p-3 border-gray-600 border rounded-xl pr-10"
            />
            <span
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}

          {/* Country */}
          <select
            {...register("country", { required: "Country is required" })}
            className="w-full p-3 border-gray-600 border rounded-xl"
          >
            <option value="" hidden>
              Select Country
            </option>
            {countryData.map((country: Country) => (
              <option key={country.name} value={country.name.toLowerCase()}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-600 text-sm">{errors.country.message}</p>
          )}

          {/* State */}
          <select
            {...register("state", { required: "State is required" })}
            className="w-full p-3 border-gray-600 border rounded-xl"
            disabled={!selectedCountry}
          >
            <option value="" hidden>
              Select State
            </option>
            {selectedCountry &&
              selectedCountry.states.map((state) => (
                <option key={state.name} value={state.name.toLowerCase()}>
                  {state.name}
                </option>
              ))}
          </select>
          {errors.state && (
            <p className="text-red-600 text-sm">{errors.state.message}</p>
          )}

          {/* LGA - Optional */}
          {selectedCountryName === "nigeria" && lgas.length > 0 && (
            <select
              {...register("lga")}
              className="w-full p-3 border-gray-600 border rounded-xl"
              disabled={!selectedStateName}
            >
              <option value="">Select LGA (Optional)</option>
              {lgas.map((lga, index) => (
                <option key={index} value={lga.toLowerCase()}>
                  {lga}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition duration-150 disabled:bg-green-400"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?
          <Link
            href="/login"
            className="text-green-600 hover:underline font-medium ml-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
