"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
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

// Simple, farm-relevant advisory derived from current conditions.
function farmAdvisory(w: WeatherData): { tone: "good" | "watch" | "alert"; text: string } {
  if (w.rainfall >= 5) {
    return { tone: "alert", text: "Significant rainfall expected — hold off on irrigation and spraying; check drainage." };
  }
  if (w.rainfall > 0) {
    return { tone: "watch", text: "Light rain likely — you may be able to skip irrigation today." };
  }
  if (w.maxTemp >= 34) {
    return { tone: "alert", text: "High heat — water crops early morning or evening and watch livestock for heat stress." };
  }
  if (w.humidity >= 85) {
    return { tone: "watch", text: "High humidity raises fungal-disease risk — scout crops and improve airflow." };
  }
  return { tone: "good", text: "Favourable conditions for most field work today." };
}

export default function WeatherPage() {
  const { profile } = useProfile();
  const region = profile?.location?.state || profile?.location?.city || "";

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const advisory = useMemo(() => (weather ? farmAdvisory(weather) : null), [weather]);

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
          {/* Current conditions hero */}
          <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl p-5 sm:p-8 text-white shadow-sm">
            <div className="flex items-center gap-1.5 text-green-100 text-sm font-medium">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>
            <div className="mt-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-6xl sm:text-7xl font-bold leading-none tracking-tight">
                  {Math.round(weather.temperature)}°
                </div>
                <div className="mt-2 capitalize text-green-100 text-base sm:text-lg">{weather.condition}</div>
              </div>
              <HeroIcon condition={weather.condition} />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <ThermometerSnowflake className="w-3.5 h-3.5" /> Min {Math.round(weather.minTemp)}°
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <ThermometerSun className="w-3.5 h-3.5" /> Max {Math.round(weather.maxTemp)}°
              </span>
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard icon={<Droplets className="w-5 h-5" />} label="Humidity" value={`${weather.humidity}%`} />
            <MetricCard icon={<CloudRain className="w-5 h-5" />} label="Rainfall" value={`${weather.rainfall} mm`} />
            <MetricCard icon={<Wind className="w-5 h-5" />} label="Wind" value={`${weather.windSpeed ?? 0} m/s`} />
            <MetricCard icon={<Thermometer className="w-5 h-5" />} label="Feels like" value={`${Math.round(weather.temperature)}°C`} />
          </div>

          {/* Farm advisory */}
          {advisory && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                advisory.tone === "alert"
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                  : advisory.tone === "watch"
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300"
                  : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300"
              }`}>
              <Sprout className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Farm advisory</p>
                <p className="text-sm">{advisory.text}</p>
              </div>
            </div>
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

// Large decorative icon for the hero, chosen from the condition text.
function HeroIcon({ condition }: { condition: string }) {
  const c = (condition || "").toLowerCase();
  const cls = "w-16 h-16 sm:w-20 sm:h-20 text-green-100/90 shrink-0";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower") || c.includes("storm"))
    return <CloudRain className={cls} />;
  if (c.includes("cloud") || c.includes("overcast")) return <Cloud className={cls} />;
  if (c.includes("clear") || c.includes("sun")) return <Sun className={cls} />;
  return <CloudSun className={cls} />;
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
