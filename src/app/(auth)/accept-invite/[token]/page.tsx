"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyInviteToken, acceptInvite } from "@/lib/services/staff";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

type Status = "loading" | "valid" | "invalid" | "success";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [staffInfo, setStaffInfo] = useState<{ name: string; email: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyInviteToken(token)
      .then((data) => {
        setStaffInfo(data);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite(token, password);
      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] rounded-2xl shadow-lg border border-gray-200 dark:border-[#30363d] p-8">

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8 text-gray-500 dark:text-[#8b949e]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm">Verifying your invite link…</p>
          </div>
        )}

        {/* Invalid / expired */}
        {status === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-[#e6edf3]">Invite Link Expired</h1>
            <p className="text-sm text-gray-500 dark:text-[#8b949e]">
              This invite link is invalid or has expired. Please ask your farm manager to send a new invite.
            </p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-[#1a3a2a] flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-[#4ade80]" />
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-[#e6edf3]">You're all set!</h1>
            <p className="text-sm text-gray-500 dark:text-[#8b949e]">
              Your account is ready. Redirecting you to login…
            </p>
          </div>
        )}

        {/* Valid — show form */}
        {status === "valid" && staffInfo && (
          <>
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-[#1a3a2a] flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-emerald-700 dark:text-[#4ade80]">
                  {staffInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
                Welcome, {staffInfo.name.split(" ")[0]}!
              </h1>
              <p className="text-sm text-gray-500 dark:text-[#8b949e] mt-1">
                Set a password for <span className="font-medium text-gray-700 dark:text-[#e6edf3]">{staffInfo.email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#e6edf3] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="block w-full border border-gray-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3]"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#e6edf3] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="block w-full border border-gray-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3]"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {submitting ? "Setting up account…" : "Activate My Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
