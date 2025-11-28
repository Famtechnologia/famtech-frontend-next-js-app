"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { useDashboardData, useInsights } from "@/lib/hooks/useDashboard";
import { useAuthStore } from "@/lib/store/authStore";

export default function OverviewTab() {
  const user = useAuthStore((s) => s.user);
  const farmId = user?.farmId;

  // 🛡️ Defensive check before firing requests
  if (!farmId) {
    return (
      <div className="p-6 text-gray-600 italic">
        Unable to load analytics overview — no active farm selected.
      </div>
    );
  }

  // Fetch dashboard + insights data using SWR hooks (auto-refresh every 60s)
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData(farmId, { refreshInterval: 60000 });

  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    error: insightsError,
  } = useInsights(farmId, { refreshInterval: 60000 });

  const [showInsights, setShowInsights] = useState(true);
  const isLoading = isDashboardLoading || isInsightsLoading;
  const error = dashboardError || insightsError;

  if (isLoading)
    return (
      <div className="p-6 text-gray-600 italic">
        Loading analytics overview...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-600">
        Failed to load analytics overview. Error:{" "}
        {error.message || "Unknown error"}
      </div>
    );

  // ✅ Metrics safely pulled from widgets array (filter KPIs)
  const metrics =
    dashboardData?.widgets?.filter((w: { type: string }) => w.type === "kpi") ||
    [];

  // ✅ Forecast key mapping (handles inconsistent backend keys)
  const predictions = insightsData?.predictions;
  const forecast = predictions
    ? {
        yieldPrediction: predictions.yield ?? "—",
        revenueProjection: predictions.revenue ?? "—",
        confidence: predictions.confidence ?? "—",
      }
    : { yieldPrediction: "—", revenueProjection: "—", confidence: "—" };

  const insights =
    insightsData?.recommendations && insightsData.recommendations.length > 0
      ? insightsData.recommendations
      : [
          "No personalized recommendations available. Generate recent analytics to view.",
        ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
        <p className="text-sm text-gray-500">
          Real-time analytics and predictive insights for your farm’s
          performance.
        </p>
      </div>

      {/* Metrics Section */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric: any, i: number) => (
            <div
              key={i}
              className="bg-green-50 border border-green-200 rounded-md p-4 shadow-sm"
            >
              <p className="text-sm text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {metric.data?.value ?? "-"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Predictive Analysis Card */}
      <Card title="Predictive Analysis">
        <p className="text-gray-500 text-sm mb-4">
          Forecasts based on recent performance trends.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-gray-600">Yield Prediction</p>
            <p className="text-xl font-semibold text-green-700 mt-1">
              {forecast.yieldPrediction}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-gray-600">Revenue Projection</p>
            <p className="text-xl font-semibold text-green-700 mt-1">
              {forecast.revenueProjection}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="text-xl font-semibold text-green-700 mt-1">
              {forecast.confidence}
            </p>
          </div>
        </div>
      </Card>

      {/* Intelligent Insights Card */}
      <Card title="Intelligent Insights">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Actionable recommendations from the machine learning model.
          </p>
          <button
            onClick={() => setShowInsights((prev) => !prev)}
            className="text-green-600 text-sm underline hover:text-green-700"
          >
            {showInsights ? "Hide" : "View"} insights
          </button>
        </div>

        {showInsights && (
          <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-700">
            {insights.map((tip: string, i: number) => (
              <li key={i} className="text-sm">
                {tip}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Optional: last update time */}
      <p className="text-xs text-gray-400 text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
