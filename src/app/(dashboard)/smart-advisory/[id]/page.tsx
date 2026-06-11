"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserAdvice } from "@/lib/services/advisory";
import Id from '@/components/skeleton/smart-advisory/Id';
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft, Calendar, Sprout, ChevronLeft } from "lucide-react";

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
  const { user } = useAuth();

  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [structuredAdvice, setStructuredAdvice] = useState<StructuredAdviceBody | null>(null);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const userAdvice = await getUserAdvice(user?._id || "");
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

    if (user?._id && id) fetchAdvice();
  }, [user, id]);

  const cleanDay = (dayValue: string | number) => {
    const dayString = String(dayValue); 
    return dayString.replace(/^(Day|day)\s*/, "").trim();
  };

  const renderWeekContent = () => {
    if (!structuredAdvice) return null;

    const selectedWeek = structuredAdvice.body.find(
      (weekData) => weekData.week === activeWeek
    );

    if (!selectedWeek) return <p className="text-slate-500 text-sm">No tasks for this week.</p>;

    return (
      <div className="bg-white rounded-xl">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-green-700" />
          Weekly Action Plan — Week {selectedWeek.week}
        </h3>
        
        <ol className="space-y-4 list-none pl-0">
          {selectedWeek.tasks.map((task, index) => (
            <li
              key={index}
              className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span className="inline-flex px-3 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100/35 rounded-xl uppercase tracking-wider shrink-0 mt-0.5 self-start">
                Day {cleanDay(task.day)}
              </span>
              <div className="space-y-1">
                <p className="text-slate-850 text-xs md:text-sm font-bold leading-snug">Instructions</p>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  {task.instruction}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Id />;

  if (!advice) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 p-4 bg-slate-50/50">
        <p className="text-slate-500 text-center text-sm font-semibold">
          Advice plan not found. Please try again.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-green-600 text-white px-5 py-2.5 text-xs font-bold rounded-xl shadow-md hover:bg-green-700 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Back Button --- */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          Back to Smart Advisory
        </button>

        {/* --- Header --- */}
        <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 relative overflow-hidden">
          {/* Top color accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-green-650" />
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                <Sprout className="h-7 w-7 text-emerald-600" />
                {advice.produce}
              </h1>
              {structuredAdvice && (
                <p className="text-sm md:text-base text-slate-500 font-semibold mt-1.5">
                  {structuredAdvice.title}
                </p>
              )}
            </div>
            
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 self-start">
              {advice.type}
            </span>
          </div>

          {/* --- Week Tabs --- */}
          {structuredAdvice && (
            <div className="my-6 flex flex-wrap gap-2 border-b border-slate-100 pb-6">
              {structuredAdvice.body.map((week) => (
                <button
                  key={week.week}
                  onClick={() => setActiveWeek(week.week)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeWeek === week.week
                      ? "bg-green-600 text-white shadow-md shadow-green-500/10"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50"
                  }`}
                >
                  Week {week.week}
                </button>
              ))}
            </div>
          )}

          {/* --- Week Content --- */}
          <div>
            {renderWeekContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
