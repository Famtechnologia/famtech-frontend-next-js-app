"use client";

import { useState } from "react";
import { useForm} from "react-hook-form";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore, User } from "@/lib/store/authStore";
import { register as signupRequest } from "@/lib/api/auth";
import { countries } from "@/lib/services/countries.js" // Assuming this file exports an array of country/state objects

// --- Type Definitions ---

/**
 * Defines the structure for the data submitted via the signup form.
 */
interface SignupFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
}

/**
 * Defines the structure for a Country object, matching the expected format from your 'countries.js'.
 */
interface Country {
    name: string;
    states: Array<{ name: string }>; // Assuming states is an array of objects with a 'name' property
}


// --- Constants ---

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// Type assertion to ensure the imported countries array conforms to the Country type
const countryData: Country[] = countries as Country[];


// --- Component ---

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>();

  // Watch values for conditional logic and validation
  const password = watch("password", "");
  const selectedCountryName = watch("country");

  // Find the selected country object based on the watched value
  const selectedCountry = countryData.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  /**
   * Handles form submission after successful client-side validation.
   * @param data The validated form data.
   */
  const onSubmit = async (data: SignupFormInputs) => {
    // Client-side password match is already handled by react-hook-form validation, 
    // but the backend request will ensure data integrity.

    try {
      const res = await signupRequest({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        country: data.country,
        state: data.state,
      });

      console.log("Signup response:", res);

      const { data: resData, message } = res;
      const { user: responseUser } = resData;

      if (!responseUser) {
        throw new Error("No user returned from server");
      }

      // Explicitly typing the user object for the store
      const user: User = {
        id: responseUser.id,
        email: responseUser.email,
        role: responseUser.role ?? "user",
        country: responseUser.country ?? "",
        state: responseUser.state ?? "",
        isVerified: responseUser.isVerified ?? false,
      };

      useAuthStore.getState().setUser(user);

      toast.success(
        message ||
          "Signup successful! Please check your email for verification."
      );
      // router.push("/verify-email");
    } catch (err) {
      console.error("Signup failed:", err);
      // Type guarding 'err' for better error handling
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
            <option value="" hidden>Select Country</option>
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
            disabled={!selectedCountry} // Disable if no country is selected
          >
            <option value="" hidden>Select State</option>
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