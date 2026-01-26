"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/api/auth";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordForm({ token }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // --- Frontend Validation (Bail out early) ---
    if (!passwordValidation.isValid) {
      setMessage("Please ensure your password meets all requirements.");
      setIsSuccess(false);
      return;
    }

    if (!passwordsMatch) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);

    try {
      // 💡 FIX: Updated the API call to pass all three required arguments
      const data = await resetPassword(token, newPassword, confirmPassword);
      
      setIsSuccess(true);
      setMessage(data.message || "Password reset successfully! You can now log in with your new password.");
    } catch (err) {
      console.error(err);
      setIsSuccess(false);

      let errorMessage = err.message || "Something went wrong. Please try again or request a new reset link.";

      // 💡 FIX: Improved Server Validation Alignment
      // The error object thrown by the API wrapper (err) already contains the concatenated message.
      // We just ensure we capture the message from the thrown Error.
      
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all inputs are non-empty and valid
  const isFormValid = newPassword && confirmPassword && passwordValidation.isValid && passwordsMatch;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg relative">
        {/* Loading Spinner/Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <p className="text-green-600 font-semibold">Resetting password...</p>
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
        <h2 className="text-2xl font-bold mb-2 text-center">Set New Password</h2>
        <p className="mt-2 text-center text-gray-500 mb-6">
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* New Password Input */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full p-3 border-gray-600 border rounded-xl"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading || isSuccess}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full p-3 border rounded-xl ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-600"
                  }`}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || isSuccess}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-2">Password must include:</p>
              <ul className="text-sm space-y-1">
                {/* Min Length */}
                <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2 font-bold">{passwordValidation.minLength ? '✓' : '✗'}</span>
                  At least 8 characters
                </li>
                {/* Uppercase */}
                <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2 font-bold">{passwordValidation.hasUpperCase ? '✓' : '✗'}</span>
                  One uppercase letter (A-Z)
                </li>
                {/* Lowercase */}
                <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2 font-bold">{passwordValidation.hasLowerCase ? '✓' : '✗'}</span>
                  One lowercase letter (a-z)
                </li>
                {/* Number */}
                <li className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2 font-bold">{passwordValidation.hasNumbers ? '✓' : '✗'}</span>
                  One number (0-9)
                </li>
                {/* Special Character */}
                <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2 font-bold">{passwordValidation.hasSpecialChar ? '✓' : '✗'}</span>
                  One special character (e.g., !@#$%)
                </li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading || isSuccess}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : isSuccess ? "Password Reset!" : "Reset Password"}
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
          <Link
            href="/login"
            className="text-green-600 hover:underline flex items-center justify-center"
          >
            <FaArrowLeft className="h-3 w-3 mr-2" />
            Go back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}