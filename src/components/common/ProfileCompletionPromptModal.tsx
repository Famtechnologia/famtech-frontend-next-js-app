"use client";

import { useRouter } from "next/navigation";
import { Sprout, ArrowRight, X } from "lucide-react";

interface ProfileCompletionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
  onProceedAnyway?: () => void;
}

export default function ProfileCompletionPromptModal({
  isOpen,
  onClose,
  actionName = "this action",
  onProceedAnyway,
}: ProfileCompletionPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-gray-900 dark:text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Complete Your Farm Profile</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Quick 30-second setup for personalized advice
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          To perform <span className="font-semibold text-green-700 dark:text-green-400">{actionName}</span> and get custom market prices and crop growth recommendations for your area, please take a moment to complete your farm details.
        </p>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              router.push("/complete-farm-profile");
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-700 hover:bg-green-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md">
            Complete Profile Now <ArrowRight className="w-4 h-4" />
          </button>

          {onProceedAnyway && (
            <button
              onClick={() => {
                onClose();
                onProceedAnyway();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              Skip for now and continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
