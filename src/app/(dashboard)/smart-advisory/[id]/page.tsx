"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserAdvice } from "@/lib/services/advisory";
import Id from '@/components/skeleton/smart-advisory/Id';
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  Calendar, 
  Sprout, 
  PawPrint,
  ChevronLeft, 
  CheckCircle2 
} from "lucide-react";

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
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

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

  // Load completion states from localStorage
  useEffect(() => {
    if (!advice?.id) return;
    const keyPrefix = `advice-${advice.id}-`;
    const states: Record<string, boolean> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(keyPrefix)) {
        states[key] = localStorage.getItem(key) === "true";
      }
    }
    setCompletedTasks(states);
  }, [advice?.id, activeWeek]);

  const toggleTaskCompletion = (day: string | number) => {
    if (!advice?.id) return;
    const dayKey = `advice-${advice.id}-week-${activeWeek}-day-${day}`;
    const newState = !completedTasks[dayKey];
    const updated = { ...completedTasks, [dayKey]: newState };
    setCompletedTasks(updated);
    localStorage.setItem(dayKey, String(newState));
  };

  const cleanDay = (dayValue: string | number) => {
    const dayString = String(dayValue); 
    return dayString.replace(/^(Day|day)\s*/, "").trim();
  };

  const parseInstruction = (text: string) => {
    const colonIndex = text.indexOf(":");
    if (colonIndex > 0 && colonIndex < 45) {
      const title = text.substring(0, colonIndex).trim();
      const body = text.substring(colonIndex + 1).trim();
      return { title, body };
    }
    return { title: "Instructions", body: text };
  };

  const getActiveWeekStats = () => {
    if (!structuredAdvice || activeWeek === null) return { total: 0, completed: 0, percent: 0 };
    const selectedWeek = structuredAdvice.body.find((w) => w.week === activeWeek);
    if (!selectedWeek) return { total: 0, completed: 0, percent: 0 };

    const total = selectedWeek.tasks.length;
    const completed = selectedWeek.tasks.filter((task) => {
      const dayKey = `advice-${advice?.id}-week-${activeWeek}-day-${task.day}`;
      return completedTasks[dayKey] === true;
    }).length;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const renderWeekContent = () => {
    if (!structuredAdvice) return null;

    const selectedWeek = structuredAdvice.body.find(
      (weekData) => weekData.week === activeWeek
    );

    if (!selectedWeek) return <p className="text-slate-500 text-sm">No tasks for this week.</p>;

    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-green-700" />
            Weekly Action Plan — Week {selectedWeek.week}
          </h3>
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span>Week Progress:</span>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${getActiveWeekStats().percent}%` }}
              />
            </div>
            <span className="font-bold text-slate-800">{getActiveWeekStats().percent}%</span>
          </div>
        </div>
        
        <ol className="space-y-4 list-none pl-0">
          {selectedWeek.tasks.map((task, index) => {
            const { title, body } = parseInstruction(task.instruction);
            const dayKey = `advice-${advice?.id}-week-${activeWeek}-day-${task.day}`;
            const isCompleted = completedTasks[dayKey] === true;

            return (
              <li
                key={index}
                onClick={() => toggleTaskCompletion(task.day)}
                className={`p-5 border rounded-2xl flex items-start gap-4 cursor-pointer transition-all duration-200 select-none
                  ${
                    isCompleted
                      ? "bg-slate-50/40 border-slate-200/60 opacity-80"
                      : "bg-white border-slate-100 hover:border-slate-200/80 hover:shadow-md shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  }`}
              >
                {/* Custom Checkbox */}
                <div className="mt-0.5 shrink-0 transition-transform duration-200 active:scale-95">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5.5 w-5.5 text-green-600 fill-green-50" />
                  ) : (
                    <div className="h-5.5 w-5.5 rounded-full border-2 border-slate-300 hover:border-green-600 transition-colors" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-extrabold rounded-lg uppercase tracking-wider
                      ${
                        isCompleted
                          ? "bg-slate-200/50 text-slate-500"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100/20"
                      }`}>
                      Day {cleanDay(task.day)}
                    </span>
                    <h4 className={`text-sm md:text-base font-bold text-slate-800 leading-snug truncate
                      ${isCompleted ? "line-through text-slate-400" : ""}`}>
                      {title}
                    </h4>
                  </div>
                  <p className={`text-slate-600 text-xs md:text-sm leading-relaxed font-medium
                    ${isCompleted ? "text-slate-400" : ""}`}>
                    {body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

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

  const illustrationSrc = advice.type?.toLowerCase().includes("livestock")
    ? "/images/livestock_farming_illustration.png"
    : "/images/crop_farming_illustration.png";

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Back Button --- */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          Back to Smart Advisory
        </button>

        {/* --- Top Title Header Card --- */}
        <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 relative overflow-hidden mb-8">
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            advice.type?.toLowerCase()?.includes("crop")
              ? "from-emerald-500 to-green-600"
              : "from-blue-500 to-indigo-600"
          }`} />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                {advice.type?.toLowerCase()?.includes("crop") ? (
                  <Sprout className="h-7 w-7 text-emerald-600" />
                ) : (
                  <PawPrint className="h-7 w-7 text-blue-600" />
                )}
                {advice.produce}
              </h1>
              {structuredAdvice && (
                <p className="text-sm md:text-base text-slate-500 font-semibold mt-1.5 leading-relaxed">
                  {structuredAdvice.title}
                </p>
              )}
            </div>
            
            <span className={`px-3.5 py-1.5 border text-xs font-bold rounded-xl uppercase tracking-wider shrink-0 self-start sm:self-auto capitalize ${
              advice.type?.toLowerCase()?.includes("crop")
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-blue-50 border-blue-100 text-blue-700"
            }`}>
              {advice.type} Plan
            </span>
          </div>
        </div>

        {/* --- Interactive Workspace Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left / Main Section: Weekly Tabs & Daily Cards (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Week Selector Tabs */}
            {structuredAdvice && (
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl">
                {structuredAdvice.body.map((week) => (
                  <button
                    key={week.week}
                    onClick={() => setActiveWeek(week.week)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 flex-1 text-center whitespace-nowrap
                      ${
                        activeWeek === week.week
                          ? "bg-green-600 text-white shadow-md shadow-green-500/10"
                          : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-100"
                      }`}
                  >
                    Week {week.week}
                  </button>
                ))}
              </div>
            )}

            {/* Daily content checklist cards */}
            <div>
              {renderWeekContent()}
            </div>
          </div>

          {/* Right Section: Sticky Sidebar with Illustration & Metadata */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            
            {/* Illustration Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="aspect-[4/3] w-full relative bg-slate-50">
                <img 
                  src={illustrationSrc} 
                  alt={`${advice.produce} Illustration`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-base mb-1.5">Action Plan Insight</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">
                  This custom guide was compiled specifically for your {advice.type.toLowerCase()} operations. Click on each daily card to check off tasks as you complete them.
                </p>
              </div>
            </div>

            {/* Plan Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2">Plan Details</h3>
              
              <div className="space-y-3.5 text-xs md:text-sm font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Duration:</span>
                  <span className="text-slate-800 font-bold">{structuredAdvice?.body?.length || 0} Weeks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-800 font-bold capitalize">{advice.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Target Produce:</span>
                  <span className="text-slate-800 font-bold capitalize">{advice.produce}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
