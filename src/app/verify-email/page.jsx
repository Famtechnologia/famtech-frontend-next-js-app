"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { verifyEmail } from "@/lib/api/auth";

export default function VerifyEmailPage() {
  const [mounted, setMounted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // 'verifying', 'success', 'expired', 'invalid', 'error'
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);

    // Get email and token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token") || "";

    setToken(tokenParam);

    // Auto-verify the token
    if (tokenParam) {
      handleTokenVerification(tokenParam);
    } else {
      // No token provided - invalid verification attempt
      setVerificationStatus("invalid");
      setErrorMessage("No verification token provided in the URL.");
    }
  }, []);

  // Handle token verification from URL
  const handleTokenVerification = async (verifyToken) => {
    setVerificationStatus("verifying");
    setErrorMessage("");

    try {
      await verifyEmail(verifyToken);

      // For demo purposes, simulate different responses based on token value
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Loading delay

      if (verifyToken.includes("valid")) {
        setVerificationStatus("success");
        // Store verification success in localStorage for other components
        localStorage.setItem("emailVerified", "true");
        localStorage.setItem("verifiedEmail", email);
      } else if (verifyToken.includes("expired")) {
        setVerificationStatus("expired");
        setErrorMessage(
          "The verification link has expired. Please request a new one."
        );
      } else if (verifyToken.includes("used")) {
        setVerificationStatus("error");
        setErrorMessage("This verification link has already been used.");
      } else {
        // Random success/failure for demo (70% success rate)
        const isSuccess = Math.random() > 0.3;

        if (isSuccess) {
          setVerificationStatus("success");
          localStorage.setItem("emailVerified", "true");
        } else {
          setVerificationStatus("invalid");
          setErrorMessage("The verification token is invalid or corrupted.");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setErrorMessage(
        "Network error occurred during verification. Please try again."
      );
    }
  };

  // Resend verification email
  // const handleResendEmail = async () => {
  //   if (resendCooldown > 0) return;

  //   setIsResending(true);
  //   setErrorMessage("");

  //   try {
  //     // Simulate API call to resend email
  //     const response = await fetch("/api/resend-verification", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: userEmail,
  //       }),
  //     });

  //     // Simulate delay
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     // Start cooldown timer
  //     setResendCooldown(60);
  //     const interval = setInterval(() => {
  //       setResendCooldown((prev) => {
  //         if (prev <= 1) {
  //           clearInterval(interval);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);

  //     // Show success feedback
  //     alert(
  //       "Verification email sent! Please check your inbox and spam folder."
  //     );
  //   } catch (error) {
  //     console.error("Resend error:", error);
  //     setErrorMessage(
  //       "Failed to resend verification email. Please try again later."
  //     );
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

  const goBack = () => {
    window.history.back();
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToDashboard = () => {
    // Clear any pending verification flags
    localStorage.removeItem("pendingEmailVerification");
    window.location.href = "/";
  };

  const openEmailApp = () => {
    // Try to open default email app
    window.location.href = "mailto:";
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verifying Your Email...
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Please wait while we verify your email address.
              </p>
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping mr-2"></div>
                Processing verification token...
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Email Successfully Verified! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Your email address has been confirmed and your account is now
                fully activated.
              </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-600 mt-1">
                    Verified successfully
                  </p>
                </div>
  
              <div className="space-y-3">
                <button
                  onClick={goToDashboard}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  Continue to Dashboard
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </button>
                <p className="text-sm text-gray-500">
                  You can now access all features of your account
                </p>
              </div>
            </div>
          </div>
        );

      case "expired":
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verification Link Expired
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                This verification link has expired for security reasons.
              </p>
              {errorMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-700 text-sm">{errorMessage}</p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending New Link...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send New Verification Link
                    </>
                  )}
                </button>
                <button
                  onClick={openEmailApp}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Open Email App
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        );

      case "invalid":
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Invalid Verification Link
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                The verification link is invalid, malformed, or may have been
                corrupted.
              </p>
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}
              {/* <div className="space-y-3">
                {userEmail ? (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending || resendCooldown > 0}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send New Verification Link
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goToLogin}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                  >
                    Go to Login
                  </button>
                )}
                <button
                  onClick={goBack}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </button>
              </div> */}
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Something went wrong during the verification process.
              </p>
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (token) {
                      handleTokenVerification(token);
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
               
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div
        className={`max-w-md w-full transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Back Button - Only show if not in success state */}
        {verificationStatus !== "success" && (
          <div className="mb-8">
            <button
              onClick={goBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Having trouble?{" "}
            <a
              href="/support"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>
              <strong>Debug:</strong>
            </p>
    
            <p>
              Token: {token ? `${token.substring(0, 10)}...` : "Not provided"}
            </p>
            <p>Status: {verificationStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
