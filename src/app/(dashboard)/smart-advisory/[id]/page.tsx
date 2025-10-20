"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserAdvice } from "@/lib/services/advisory";
import { useAuthStore } from "@/lib/store/authStore";

interface AdviceData {
  id: string;
  type: string;
  produce: string;
  advice: string;
}

export default function AdviceDetailsPage() {
  const router = useRouter();
  const { id } = useParams(); // 👈 get advice id from URL
  const { user } = useAuthStore();

  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        // 🔹 Fetch all user's advice and filter by the current id
        const userAdvice = await getUserAdvice(user?.id || "");
        const selected = userAdvice?.data?.find(
          (item: AdviceData) => item.id === id
        );
        setAdvice(selected || null);
      } catch (err) {
        console.error("Error fetching advice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && id) {
      fetchAdvice();
    }
  }, [user, id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500">Loading advice...</p>
      </div>
    );

  if (!advice)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500">Advice not found.</p>
      </div>
    );

  // ✅ Clean up advice text safely
  const cleanedAdvice = JSON.parse(advice.advice)
    .advice?.replace(/\\n```/g, "")
    .replace(/\\n/g, "")
    .replace(/```/g, "")
    .replace(/```json\\n/g, "")
    .replace(/```json/g, "")
    .replace(/\\\\/g, "")
    .replace(/\\/g, "");

  return (
    <div className="p-6 md:p-10">
      <button
        onClick={() => router.back()}
        className="text-green-700 mb-6 font-semibold hover:underline"
      >
        ← Back
      </button>

      <div className="w-full bg-white rounded-2xl shadow p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {advice.produce} ({advice.type})
        </h2>
        <p className="text-gray-500 mb-6">Personalized Farming Advice</p>

        <div className="border-t pt-4 text-gray-800 leading-relaxed whitespace-pre-line">
          {cleanedAdvice}
        </div>
      </div>
    </div>
  );
}
