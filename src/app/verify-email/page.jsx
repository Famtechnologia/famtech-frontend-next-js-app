"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { verifyEmail } from "@/lib/api/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token") || "";
    setToken(tokenParam);

    if (tokenParam) {
      handleTokenVerification(tokenParam);
    } else {
      setVerificationStatus("invalid");
      setErrorMessage("No verification token provided in the URL.");
    }
  }, []);

  const handleTokenVerification = async (verifyToken) => {
    setVerificationStatus("verifying");
    setErrorMessage("");
    try {
      await verifyEmail(verifyToken);
      // If the API call succeeds without throwing, verification passed
      setVerificationStatus("success");
      localStorage.setItem("emailVerified", "true");
    } catch (error) {
      console.error("Verification error:", error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || "";

      if (status === 400 && msg.toLowerCase().includes("expired")) {
        setVerificationStatus("expired");
        setErrorMessage("This verification link has expired. Please request a new one.");
      } else if (status === 400 || status === 404) {
        setVerificationStatus("invalid");
        setErrorMessage(msg || "The verification link is invalid or has already been used.");
      } else {
        setVerificationStatus("error");
        setErrorMessage("A network error occurred during verification. Please try again.");
      }
    }
  };

  const goToDashboard = () => {
    localStorage.removeItem("pendingEmailVerification");
    router.push("/dashboard");
  };

  const goToLogin = () => router.push("/login");
  const goBack = () => window.history.back();

  // ── Shared card shell ──────────────────────────────────────────────────
  const Card = ({ children }) => (
    <div
      className={`max-w-md w-full transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Glassmorphic card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white text-center">
        {/* subtle inner glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
      <p className="text-center mt-6 text-green-200/60 text-sm">
        Having trouble?{" "}
        <a href="/support" className="text-green-300 hover:text-white font-semibold underline underline-offset-2 transition-colors">
          Contact Support
        </a>
      </p>
    </div>
  );

  // ── State: Verifying ───────────────────────────────────────────────────
  const renderVerifying = () => (
    <Card>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
        <Loader2 className="w-10 h-10 text-green-300 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Verifying your email…</h2>
      <p className="text-green-200/70 text-sm mb-6">Please wait while we confirm your address.</p>
      <div className="flex items-center justify-center gap-2 text-xs text-green-300/70">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
        Processing verification token
      </div>
    </Card>
  );

  // ── State: Success ─────────────────────────────────────────────────────
  const renderSuccess = () => (
    <Card>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-400/20 flex items-center justify-center ring-1 ring-green-400/40">
        <CheckCircle className="w-10 h-10 text-green-300" />
      </div>
      <div className="inline-flex items-center gap-1.5 bg-green-400/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> VERIFIED
      </div>
      <h2 className="text-2xl font-bold mb-2">Email Confirmed! 🎉</h2>
      <p className="text-green-200/70 text-sm mb-8">
        Your account is now fully activated. You're all set to start managing your farm.
      </p>
      <button
        onClick={goToDashboard}
        className="w-full flex items-center justify-center gap-2 bg-white text-green-800 hover:bg-green-50 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95"
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </Card>
  );

  // ── State: Expired ─────────────────────────────────────────────────────
  const renderExpired = () => (
    <Card>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-400/20 flex items-center justify-center ring-1 ring-amber-400/40">
        <Clock className="w-10 h-10 text-amber-300" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
      <p className="text-green-200/70 text-sm mb-4">This verification link has expired for security reasons.</p>
      {errorMessage && (
        <div className="bg-amber-400/10 border border-amber-400/30 text-amber-200 text-sm rounded-xl px-4 py-3 mb-6">
          {errorMessage}
        </div>
      )}
      <button
        onClick={goToLogin}
        className="w-full flex items-center justify-center gap-2 bg-white text-green-800 hover:bg-green-50 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95"
      >
        Back to Login
      </button>
    </Card>
  );

  // ── State: Invalid ─────────────────────────────────────────────────────
  const renderInvalid = () => (
    <Card>
      <div className="mb-4">
        <button onClick={goBack} className="inline-flex items-center gap-1.5 text-green-300/70 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-400/20 flex items-center justify-center ring-1 ring-rose-400/40">
        <XCircle className="w-10 h-10 text-rose-300" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
      <p className="text-green-200/70 text-sm mb-4">
        The verification link is invalid, malformed, or may have already been used.
      </p>
      {errorMessage && (
        <div className="bg-rose-400/10 border border-rose-400/30 text-rose-200 text-sm rounded-xl px-4 py-3 mb-6">
          {errorMessage}
        </div>
      )}
      <button
        onClick={goToLogin}
        className="w-full flex items-center justify-center gap-2 bg-white text-green-800 hover:bg-green-50 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95"
      >
        Back to Login
      </button>
    </Card>
  );

  // ── State: Error ───────────────────────────────────────────────────────
  const renderError = () => (
    <Card>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-400/20 flex items-center justify-center ring-1 ring-rose-400/40">
        <AlertTriangle className="w-10 h-10 text-rose-300" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
      <p className="text-green-200/70 text-sm mb-4">Something went wrong during verification.</p>
      {errorMessage && (
        <div className="bg-rose-400/10 border border-rose-400/30 text-rose-200 text-sm rounded-xl px-4 py-3 mb-6">
          {errorMessage}
        </div>
      )}
      <button
        onClick={() => token ? handleTokenVerification(token) : window.location.reload()}
        className="w-full flex items-center justify-center gap-2 bg-white text-green-800 hover:bg-green-50 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </Card>
  );

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying": return renderVerifying();
      case "success":   return renderSuccess();
      case "expired":   return renderExpired();
      case "invalid":   return renderInvalid();
      case "error":     return renderError();
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)" }}>
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #4ade80, transparent)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #86efac, transparent)" }} />

      {/* Brand mark */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Leaf className="h-4 w-4 text-green-300" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Famtech</span>
      </div>

      {renderContent()}
    </div>
  );
}
