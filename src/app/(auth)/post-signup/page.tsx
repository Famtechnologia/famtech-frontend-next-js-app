'use client';

import React, { useState, useEffect } from "react";
import { Loader2, Mail, ArrowRight, CheckCircle, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmailNoticePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const email = localStorage.getItem("pendingVerificationEmail");
    if (email) setUserEmail(email);
  }, []);

  const handleGoToLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      router.push("/login");
      localStorage.removeItem("pendingVerificationEmail");
    }, 500);
  };

  const steps = [
    "Check your inbox for our verification email",
    "Click the confirmation link inside",
    "You'll be taken straight to your dashboard",
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)" }}
    >
      {/* Background glow orbs */}
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

      {/* Card */}
      <div className={`max-w-md w-full transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white text-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">

            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-green-400/20 animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="relative h-full w-full rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                <Mail className="w-9 h-9 text-green-300" />
              </div>
            </div>

            {/* Heading */}
            <div className="inline-flex items-center gap-1.5 bg-green-400/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> ALMOST THERE
            </div>
            <h1 className="text-2xl font-extrabold mb-2 tracking-tight">Check Your Inbox</h1>
            {userEmail ? (
              <p className="text-green-200/70 text-sm mb-6">
                We sent a verification link to <span className="text-white font-semibold">{userEmail}</span>
              </p>
            ) : (
              <p className="text-green-200/70 text-sm mb-6">
                We've sent a verification link to your email address.
              </p>
            )}

            {/* Steps */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-7 text-left space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                  <p className="text-sm text-green-100/80">{step}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-green-300/50 text-xs">already verified?</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* CTA */}
            <button
              onClick={handleGoToLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 bg-white text-green-800 hover:bg-green-50 disabled:opacity-60 disabled:cursor-wait font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95"
            >
              {isLoggingIn ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Going to Login…</>
              ) : (
                <><span>Go to Login</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-green-300/50 text-xs mt-5">
              Didn't receive the email? Check your spam or junk folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}