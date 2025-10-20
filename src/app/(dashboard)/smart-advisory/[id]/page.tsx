"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserAdvice } from "@/lib/services/advisory";
import { useAuthStore } from "@/lib/store/authStore";

// --- Type Definitions ---
interface Task {
  day: string;
  instruction: string;
}

interface WeekData {
  week: number;
  tasks: Task[];
}

interface StructuredAdviceBody {
  title: string;
  body: WeekData[];
}

interface AdviceData {
  id: string | number;
  type: string;
  produce: string;
  advice: string;
}

export default function AdviceDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();

  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [structuredAdvice, setStructuredAdvice] = useState<StructuredAdviceBody | null>(null);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const userAdvice = await getUserAdvice(user?.id || "");
        const selected = userAdvice?.data?.find(
          (item: AdviceData) => String(item.id) === String(id)
        );

        if (selected) {
          setAdvice(selected);

          const rawAdviceContent = JSON.parse(selected.advice);
          let contentToParse = rawAdviceContent;

          if (typeof contentToParse.advice === "string") {
            const cleanedJsonString = contentToParse.advice
              .replace(/\\n/g, "")
              .replace(/```json/g, "")
              .replace(/```/g, "")
              .replace(/\\/g, "");
            try {
              contentToParse = JSON.parse(cleanedJsonString);
            } catch (e) {
              console.error("Failed to parse cleaned advice JSON string:", e);
            }
          }

          if (contentToParse.body && Array.isArray(contentToParse.body)) {
            setStructuredAdvice(contentToParse);
            setActiveWeek(contentToParse.body[0]?.week || null);
          } else {
            console.error("Structured advice body not found or invalid.");
            setStructuredAdvice(null);
          }
        }
      } catch (err) {
        console.error("Error fetching or parsing advice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && id) fetchAdvice();
  }, [user, id]);

 const renderWeekContent = () => {
  if (!structuredAdvice) return null;

  const selectedWeek = structuredAdvice.body.find(
    (weekData) => weekData.week === activeWeek
  );

  if (!selectedWeek) return <p>No tasks for this week.</p>;

  // Function to clean the day string, removing "Day " if present
  const cleanDay = (dayValue: string | number) => {
    // 💡 FIX: Convert the value to a string first using String() or .toString()
    const dayString = String(dayValue); 
    
    // Remove "Day" or "day" prefix, and trim whitespace
    return dayString.replace(/^(Day|day)\s*/, "").trim();
  };

  switch (activeWeek) {
    default:
      return (
        <div className=" px-1.5 pt-6  pb-6 bg-white rounded-xl ">
          <h3 className="text-xl font-semibold mb-4 text-green-600 border-b pb-2">
            Weekly Action Plan — Week {selectedWeek.week}
          </h3>
          <ol className="space-y-5 list-none pl-0">
            {selectedWeek.tasks.map((task, index) => (
              <li
                key={index}
                className="flex p-4 border-l-2 md:border-l-3 border-green-400 bg-green-50 rounded-l-2xl rounded-r-lg shadow-sm"
              >
                <div className="flex flex-col">
                  {/* The fix is implemented in the cleanDay function itself */}
                  <span className="font-bold text-gray-900 mb-1">
                    Day {cleanDay(task.day)} Instruction: 
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    {task.instruction}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      );
  }
};
  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg text-gray-500">Loading personalized roadmap...</p>
      </div>
    );

  if (!advice)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 p-4">
        <p className="text-gray-500 text-center text-lg">
          Advice not found. Please go back and try again.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition"
        >
          ← Go Back
        </button>
      </div>
    );

  return (
    <div className="p-0 md:p-2 w-full bg-gray-50 min-h-screen">
      {/* --- Back Button --- */}
      <button
        onClick={() => router.back()}
        className="text-green-600 mb-6 flex items-center font-medium hover:text-green-800 transition"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Smart Advisory
      </button>

      {/* --- Header --- */}
      <div className="w-full bg-white rounded-xl shadow-xl p-3 pt-6 md:p-10 border-t-2 border-gray-200">
        <div className="flex items-center mb-4">
        {/* <span className="text-4xl mr-4">🌱</span>*/}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-green-700 capitalize">
              {advice.produce}
            </h1>
            {structuredAdvice && (
              <p className="text-lg text-gray-600 font-semibold mt-1">
                {structuredAdvice.title}
              </p>
            )}
          </div>
        </div>
        <p className="text-gray-500 mb-6 border-b pb-4">
          Personalized Advisory for {advice.type}
        </p>

        {/* --- Week Tabs --- */}
        {structuredAdvice && (
          <div className="mb-6 flex flex-wrap gap-3">
            {structuredAdvice.body.map((week) => (
              <button
                key={week.week}
                onClick={() => setActiveWeek(week.week)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  activeWeek === week.week
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                }`}
              >
                Week {week.week}
              </button>
            ))}
          </div>
        )}

        {/* --- Week Content --- */}
        {renderWeekContent()}
      </div>
    </div>
  );
}
