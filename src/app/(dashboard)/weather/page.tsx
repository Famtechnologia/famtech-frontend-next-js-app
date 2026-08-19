"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  MapPin,
  RefreshCw,
  Sprout,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import apiClient from "@/lib/api/apiClient";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuth } from "@/lib/hooks/useAuth";
import { getCropRecords } from "@/lib/services/croplivestock";
import { getTasks } from "@/lib/services/taskplanner";
import WeatherScene from "./components/WeatherScene";

interface WeatherData {
  country?: string;
  state?: string;
  city?: string;
  temperature: number;
  minTemp: number;
  maxTemp: number;
  humidity: number;
  rainfall: number;
  condition: string;
  windSpeed?: number;
  source?: string;
  timestamp?: string;
}

type Advisory = { tone: "good" | "watch" | "alert"; title: string; text: string };
type CropLite = { cropName?: string; currentGrowthStage?: string; healthStatus?: string };
type TaskLite = { title?: string; status?: string; timeline?: { dueDate?: string } };

const cap = (s?: string) => (s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "");
const uniqueNames = (crops: CropLite[]) =>
  [...new Set(crops.map((c) => cap(c.cropName)).filter(Boolean))];
const nameList = (crops: CropLite[]) => {
  const n = uniqueNames(crops);
  return n.length <= 1 ? n[0] || "crops" : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
};
const titleList = (tasks: TaskLite[]) => tasks.map((t) => `"${cap(t.title)}"`).join(", ");

// Weather-, crop- and task-aware farm advisories, most urgent first.
function buildAdvisories(w: WeatherData, crops: CropLite[], tasks: TaskLite[]): Advisory[] {
  const out: Advisory[] = [];
  const cond = (w.condition || "").toLowerCase();
  const raining = w.rainfall > 0 || /rain|drizzle|storm|shower/.test(cond);
  const heavyRain = w.rainfall >= 5 || /storm|thunder/.test(cond);
  const hot = w.maxTemp >= 33;
  const humid = w.humidity >= 85;
  const windy = (w.windSpeed ?? 0) >= 8; // ~29 km/h

  const stage = (c: CropLite) => (c.currentGrowthStage || "").toLowerCase();
  const health = (c: CropLite) => (c.healthStatus || "").toLowerCase();
  const tender = crops.filter((c) => ["flowering", "fruiting", "seeding"].includes(stage(c)));
  const readyToHarvest = crops.filter((c) => ["maturity", "harvesting"].includes(stage(c)));
  const poor = crops.filter((c) => ["poor", "fair"].includes(health(c)));

  const soon = tasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    if (!["pending", "ongoing"].includes(s)) return false;
    const due = t.timeline?.dueDate ? new Date(t.timeline.dueDate).getTime() : 0;
    return due > 0 && due - Date.now() <= 3 * 864e5;
  });
  const sprayTasks = soon.filter((t) => /spray|pesticide|fertil|herbicid|weed/i.test(t.title || ""));
  const harvestTasks = soon.filter((t) => /harvest/i.test(t.title || ""));

  if (heavyRain) {
    out.push({
      tone: "alert",
      title: "Heavy rain incoming",
      text: `Hold irrigation and spraying, and check drainage.${readyToHarvest.length ? ` Bring in your ${nameList(readyToHarvest)} before the downpour.` : ""}`,
    });
  } else if (raining) {
    out.push({
      tone: "watch",
      title: "Light rain likely",
      text: `You can skip irrigation today.${sprayTasks.length ? ` Consider delaying ${titleList(sprayTasks)} — rain washes off applications.` : ""}`,
    });
  }
  if (hot && !raining) {
    out.push({
      tone: "alert",
      title: "High heat",
      text: `Water crops early morning or evening and watch livestock for heat stress.${tender.length ? ` Your ${nameList(tender)} ${tender.length > 1 ? "are" : "is"} at a sensitive stage — keep soil moisture up.` : ""}`,
    });
  }
  if (humid && !heavyRain) {
    out.push({
      tone: "watch",
      title: "Disease watch",
      text: `High humidity raises fungal-disease risk.${tender.length ? ` Scout your ${nameList(tender)} for blight/mildew and improve airflow.` : " Scout crops and improve airflow."}`,
    });
  }
  if (windy && sprayTasks.length) {
    out.push({ tone: "watch", title: "Too windy to spray", text: `Winds are up — postpone ${titleList(sprayTasks)} to avoid drift.` });
  }
  if (!raining && readyToHarvest.length) {
    out.push({
      tone: "good",
      title: "Good harvest window",
      text: `Dry conditions are ideal to harvest your ${nameList(readyToHarvest)}${harvestTasks.length ? ` (${titleList(harvestTasks)} due)` : ""}.`,
    });
  }
  if (poor.length) {
    out.push({
      tone: "watch",
      title: "Crops need attention",
      text: `${nameList(poor)} ${poor.length > 1 ? "are" : "is"} rated ${[...new Set(poor.map((c) => health(c)))].join("/")} — inspect for pests, water or nutrient stress.`,
    });
  }
  if (soon.length) {
    out.push({ tone: "good", title: `${soon.length} task${soon.length > 1 ? "s" : ""} due soon`, text: soon.slice(0, 3).map((t) => cap(t.title)).join(" · ") });
  }
  if (!out.length) out.push({ tone: "good", title: "All clear", text: "Favourable conditions for most field work today." });

  return out.slice(0, 5);
}

export default function WeatherPage() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const region = profile?.location?.state || profile?.location?.city || "";

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crops, setCrops] = useState<CropLite[]>([]);
  const [tasks, setTasks] = useState<TaskLite[]>([]);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/weather", {
        params: region ? { region } : {},
      });
      setWeather((res?.data?.data ?? null) as WeatherData | null);
    } catch (err) {
      console.error("[weather] failed to load:", err);
      setError("Could not load weather for your region.");
    } finally {
      setIsLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Pull the farmer's crops and upcoming tasks so advisories can reference them.
  useEffect(() => {
    const pid = profile?.id as string | undefined;
    if (!pid) return;
    getCropRecords(pid)
      .then((data) => setCrops(Array.isArray(data) ? (data as CropLite[]) : []))
      .catch(() => setCrops([]));
    getTasks(pid)
      .then((data) => {
        const list = Array.isArray(data) ? (data as (TaskLite & { assignee?: string })[]) : [];
        const email = user?.email;
        setTasks(email ? list.filter((t) => t.assignee === email) : list);
      })
      .catch(() => setTasks([]));
  }, [profile?.id, user?.email]);

  const advisories = useMemo(
    () => (weather ? buildAdvisories(weather, crops, tasks) : []),
    [weather, crops, tasks]
  );

  // Title-case any location string ("nigeria" -> "Nigeria").
  const titleCase = (s?: string) =>
    s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : s;

  // Prefer the city (e.g. "Ibadan") over the state ("Oyo") to match how
  // Apple/Google label the location; fall back to state, country as needed.
  const city = titleCase(weather?.city);
  const state = titleCase(weather?.state || profile?.location?.state);
  const country = titleCase(weather?.country || profile?.location?.country);
  const locationLabel =
    (city && state && city.toLowerCase() !== state.toLowerCase()
      ? `${city}, ${state}`
      : [city || state, country].filter(Boolean).join(", ")) || "Your region";

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-5 text-gray-900 dark:text-[#e6edf3]">
      <PageHeader
        title="Weather"
        subtitle="Live conditions for your farm's region.">
        <button
          onClick={fetchWeather}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-green-700 dark:text-green-500 gap-2 font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading weather...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <Cloud className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{error}</p>
          <button onClick={fetchWeather} className="text-xs font-semibold text-green-700 dark:text-green-500 hover:underline">
            Try again
          </button>
        </div>
      ) : !weather ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No weather data yet</p>
          <p className="text-xs text-gray-400 max-w-xs">Set your farm location in Settings to see local conditions.</p>
        </div>
      ) : (
        <>
          {/* Current conditions hero — animated farm scene reflects the live condition */}
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-8 text-white shadow-sm min-h-[220px] sm:min-h-[240px] flex flex-col">
            <WeatherScene condition={weather.condition} />
            <div className="relative z-10 flex flex-col flex-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </div>
              <div className="mt-auto flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-6xl sm:text-7xl font-bold leading-none tracking-tight">
                    {Math.round(weather.temperature)}°
                  </div>
                  <div className="mt-2 capitalize text-white/90 text-base sm:text-lg">{weather.condition}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                      <ThermometerSnowflake className="w-3.5 h-3.5" /> Min {Math.round(weather.minTemp)}°
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                      <ThermometerSun className="w-3.5 h-3.5" /> Max {Math.round(weather.maxTemp)}°
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard icon={<Droplets className="w-5 h-5" />} label="Humidity" value={`${weather.humidity}%`} />
            <MetricCard icon={<CloudRain className="w-5 h-5" />} label="Rainfall" value={`${weather.rainfall} mm`} />
            <MetricCard icon={<Wind className="w-5 h-5" />} label="Wind" value={`${weather.windSpeed ?? 0} m/s`} />
            <MetricCard icon={<Thermometer className="w-5 h-5" />} label="Feels like" value={`${Math.round(weather.temperature)}°C`} />
          </div>

          {/* Farm advisory — tailored to conditions, your crops and due tasks */}
          {advisories.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-green-700 dark:text-green-500" />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Farm advisory</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {advisories.map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border p-4 ${
                      a.tone === "alert"
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                        : a.tone === "watch"
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300"
                        : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300"
                    }`}>
                    <span className="mt-0.5 shrink-0">
                      {a.tone === "alert" ? "⚠️" : a.tone === "watch" ? "🌦️" : "🌱"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="text-sm opacity-90">{a.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {weather.timestamp && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Updated {new Date(weather.timestamp).toLocaleString()}
              {weather.source ? ` · ${weather.source}` : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#161b22] p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-green-700 dark:text-green-400">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  );
}
