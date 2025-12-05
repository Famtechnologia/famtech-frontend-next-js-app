"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api/auth";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle, FaExclamationCircle, FaArrowLeft } from "react-icons/fa";

export default function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Removed ': React.FormEvent' from the 'e' argument
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const res = await forgotPassword(email);
      if (!res) {
        setIsSuccess(false);
        setMessage("Failed to send reset link. Please try again.");
        console.log(res)
        return;
      }
      console.log(res);
      setIsSuccess(true);
      setMessage("Reset link sent! Check your email for further instructions.");
    } catch (err) { // Removed ': any' from the 'err' argument
      console.error(err);
      setIsSuccess(false);
      
      // Accessing err.message remains the same
      const errorMessage =
        err.message || "Something went wrong. Please try again.";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg relative">
        {/* Loading Spinner/Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <p className="text-green-600 font-semibold">Sending link...</p>
          </div>
        )}

        {/* Logo */}
        <div className="h-24 w-24 flex justify-center mx-auto mt-6">
          <Image
            src="/images/auth/Logo 1.png"
            width={96}
            height={96}
            alt="logo"
            className="rounded-full"
          />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold mb-2 text-center">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full p-3 border-gray-600 border rounded-xl"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isSuccess}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : isSuccess ? "Email Sent!" : "Send Reset Link"}
          </button>
        </form>

        {/* Message Alert */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-xl border ${
              isSuccess
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-red-50 text-red-700 border-red-300"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {isSuccess ? (
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <FaExclamationCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Back to Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-green-600 hover:underline flex items-center justify-center">
            <FaArrowLeft className="h-3 w-3 mr-2" />
            Go back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}