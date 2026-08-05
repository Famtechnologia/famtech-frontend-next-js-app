"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { register as signupRequest } from "@/lib/api/auth";
import { countries } from "@/lib/services/countries.js";
import { useRouter } from "next/navigation";
import { generateStrongPassword } from "@/lib/utils/passwordGenerator";
import { useAuthStore } from "@/lib/store/authStore";

// --- Type Definitions ---
interface SignupFormInputs {
  email?: string;
  phone?: string;
  otpCode?: string;
  password?: string;
  confirmPassword?: string;
  country: string;
  state: string;
  lga?: string;
  businessName?: string;
}

interface Country {
  name: string;
  states: Array<{ name: string; subdivision?: string[] }>;
}

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const countryData: Country[] = countries as Country[];

export default function SignupPage() {
  const [signUpMethod, setSignUpMethod] = useState<"phone" | "email">("phone");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [suggestedPassword, setSuggestedPassword] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>({
    defaultValues: {
      country: "nigeria",
      state: "kano",
    },
  });

  const handleSuggestPassword = () => {
    const pwd = generateStrongPassword();
    setSuggestedPassword(pwd);
    setValue("password", pwd, { shouldValidate: true });
    setValue("confirmPassword", pwd, { shouldValidate: true });
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleCopy = async () => {
    if (!suggestedPassword) return;
    await navigator.clipboard.writeText(suggestedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const password = watch("password", "");
  const phoneVal = watch("phone", "");
  const selectedCountryName = watch("country");
  const selectedStateName = watch("state");

  const selectedCountry = countryData.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  const selectedStateObj = selectedCountry?.states.find(
    (state) => state.name.toLowerCase() === selectedStateName
  );

  const lgas = selectedStateObj?.subdivision || [];

  const handleSendOtp = () => {
    if (!phoneVal || phoneVal.length < 8) {
      toast.error("Please enter a valid phone or WhatsApp number");
      return;
    }
    setOtpSent(true);
    toast.success(`Verification OTP code sent to WhatsApp / SMS: ${phoneVal}`);
  };

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      if (signUpMethod === "phone") {
        // 1-Click Phone/WhatsApp OTP Signup
        if (!data.phone) {
          toast.error("Phone number is required");
          return;
        }
        if (!data.otpCode || data.otpCode.length < 4) {
          toast.error("Please enter the 4-digit or 6-digit OTP sent to your WhatsApp");
          return;
        }

        // Mock 1-click token for immediate farmer access
        const mockPhoneUser = {
          id: `usr-${Date.now()}`,
          phone: data.phone,
          email: `${data.phone.replace(/\D/g, "")}@famtech.llc`,
          fullName: "Farmer User",
          businessName: data.businessName || "My Farm",
          isEmailVerified: true,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("famtech-signup-location", JSON.stringify({
            country: (data.country || "nigeria").toLowerCase(),
            state: (data.state || "").toLowerCase(),
            lga: (data.lga || "").toLowerCase(),
          }));
        }

        setToken(`mock-token-${Date.now()}`);
        setUser(mockPhoneUser as any);

        toast.success("1-Click Verification Successful! Welcome to Famtech");
        router.push("/dashboard");
        return;
      }

      // Standard Email Signup
      if (!data.email || !data.password || !data.confirmPassword) {
        toast.error("Please fill in all required email registration fields");
        return;
      }

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

      if (typeof window !== "undefined") {
        localStorage.setItem("famtech-signup-location", JSON.stringify({
          country: data.country.toLowerCase(),
          state: data.state.toLowerCase(),
          lga: (data.lga || "").toLowerCase(),
        }));
      }

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
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/auth/agriculture-healthy-food.jpg')] bg-cover bg-center relative p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white">
        <div className="h-20 w-20 flex justify-center mx-auto mb-3">
          <Image
            src="/images/auth/famtech-logo-two.png"
            width={80}
            height={80}
            alt="Famtech logo"
            className="object-contain"
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-center text-white">
          Create Farm Account
        </h2>
        <p className="text-xs text-center text-white/80 mb-6">
          Fast & simple registration for farmers
        </p>

        {/* 1-Click Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setSignUpMethod("phone")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
              signUpMethod === "phone"
                ? "bg-green-600 text-white shadow-lg"
                : "text-white/70 hover:text-white"
            }`}>
            <FaWhatsapp className="w-4 h-4 text-green-300" /> WhatsApp / Phone
          </button>
          <button
            type="button"
            onClick={() => setSignUpMethod("email")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
              signUpMethod === "email"
                ? "bg-green-600 text-white shadow-lg"
                : "text-white/70 hover:text-white"
            }`}>
            <FaEnvelope className="w-4 h-4 text-emerald-300" /> Email & Pass
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {signUpMethod === "phone" ? (
            /* --- WhatsApp / Phone OTP Signup --- */
            <>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Phone or WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      placeholder="+234 801 234 5678"
                      {...register("phone")}
                      className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3.5 py-3 text-xs font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors whitespace-nowrap">
                    {otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1">
                    Enter WhatsApp Verification Code (OTP) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    {...register("otpCode")}
                    className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-white font-mono text-center tracking-widest text-base"
                  />
                  <p className="text-[11px] text-green-300 mt-1">
                    ✓ Code sent via WhatsApp / SMS. Check your messages.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Farm Name <span className="text-white/60 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Green Valley Farm (Defaults to My Farm)"
                  {...register("businessName")}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-white text-sm"
                />
              </div>
            </>
          ) : (
            /* --- Email & Password Signup --- */
            <>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Need a password?</span>
                <button
                  type="button"
                  onClick={handleSuggestPassword}
                  className="text-xs text-green-300 hover:text-green-200 font-medium underline underline-offset-2">
                  Suggest one
                </button>
              </div>

              {suggestedPassword && (
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm">
                  <span className="flex-1 font-mono text-white/90 truncate select-all">
                    {suggestedPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs text-green-300 hover:text-green-200 whitespace-nowrap font-medium">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters." },
                    pattern: {
                      value: strongPasswordRegex,
                      message: "Must include uppercase, lowercase, number & symbol.",
                    },
                  })}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 pr-10 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
                <span
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-white/80">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-300 text-xs">{errors.password.message}</p>
              )}

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match.",
                  })}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 pr-10 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
                <span
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-white/80">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-300 text-xs">{errors.confirmPassword.message}</p>
              )}
            </>
          )}

          {/* Location Details (Shared) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">Country</label>
              <select
                {...register("country", { required: "Country is required" })}
                className="w-full p-2.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400">
                {countryData.map((country: Country) => (
                  <option key={country.name} value={country.name.toLowerCase()} className="text-black">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">State / Region</label>
              <select
                {...register("state", { required: "State is required" })}
                className="w-full p-2.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                disabled={!selectedCountry}>
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
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3.5 rounded-xl transition duration-300 disabled:bg-green-400 font-bold text-sm shadow-xl mt-2 flex items-center justify-center gap-2">
            {signUpMethod === "phone" ? (
              <>
                <FaWhatsapp className="w-4 h-4" /> 1-Click Verify & Enter Platform
              </>
            ) : (
              isSubmitting ? "Signing up..." : "Sign Up with Email"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/80 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-green-300 hover:underline font-semibold ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
