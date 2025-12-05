"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDashboardData, useInsights } from "@/lib/hooks/useDashboard";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const farmId = user?.farmProfile;
  const [period, setPeriod] = useState("quarter");

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData(farmId || "", { refreshInterval: 60000 });

  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    error: insightsError,
    refetch: refetchInsights,
  } = useInsights(farmId || "", { refreshInterval: 60000, period });

  const isLoading = isDashboardLoading || isInsightsLoading;

  useEffect(() => {
    if (dashboardError) toast.error("Failed to load dashboard data.");
    if (insightsError) toast.error("Failed to load insights data.");
  }, [dashboardError, insightsError]);

  if (!user)
    return <div className="p-6 text-gray-600 italic">Loading user data...</div>;

  if (!farmId)
    return (
      <div className="p-6 text-gray-600 italic">
        Unable to load analytics — no farm selected.
      </div>
    );

  if (isLoading)
    return (
      <div className="p-6 text-gray-600 italic">Loading analytics data...</div>
    );

  const revenueWidget = dashboardData?.data?.widgets?.find(
    (w) => w.config?.metric === "totalRevenue"
  );
  const yieldWidget = dashboardData?.data?.widgets?.find(
    (w) => w.config?.metric === "totalYield"
  );
  const cropChartWidget = dashboardData?.data?.widgets?.find(
    (w) => w.type === "chart"
  );

  const revenueValue = revenueWidget?.data?.value ?? 0;
  const revenueChange = revenueWidget?.data?.change ?? 0;

  const yieldValue = yieldWidget?.data?.value ?? 0;
  const yieldChange = yieldWidget?.data?.change ?? 0;

  const chartLabels = cropChartWidget?.data?.labels ?? [];
  const chartValues =
    cropChartWidget?.data?.datasets?.[0]?.data ?? [];

  const insights = insightsData?.data;

  return (
    <div className="space-y-10 ">
      {/* ===== Dashboard Section ===== */}
      <section>

        <p className="text-lg text-gray-700 mb-6">
          Real-time analytics for your farm’s performance.
        </p>

        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm">
            <p className="text-sm text-gray-600">Total Revenue (Monthly)</p>
            <p className="text-3xl font-bold text-green-700 mt-2">
              ${revenueValue.toLocaleString()}
            </p>
            <p
              className={`text-sm mt-1 ${revenueChange > 0 ? "text-green-600" : "text-red-600"
                }`}
            >
              {revenueChange > 0 ? "▲" : "▼"} {revenueChange}% from last period
            </p>
          </div>

          {/* Total Yield */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm">
            <p className="text-sm text-gray-600">Total Yield (Monthly)</p>
            <p className="text-3xl font-bold text-green-700 mt-2">
              {yieldValue.toLocaleString()} kg
            </p>
            <p
              className={`text-sm mt-1 ${yieldChange > 0 ? "text-green-600" : "text-red-600"
                }`}
            >
              {yieldChange > 0 ? "▲" : "▼"} {yieldChange}% from last period
            </p>
          </div>
        </div>

        {/* Crop Performance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Crop Performance
          </h3>
          <div className="h-72">
            <Bar
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: "Yield (kg/ha)",
                    backgroundColor: "#16a34a",
                    borderRadius: 6,
                    data: chartValues,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false } },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f0fdf4" },
                  },
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* ===== Insights Section (Updated to Match Backend) ===== */}
      <section>
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              AI Farm Insights
            </h2>
            <p className="text-sm text-gray-500">
              Data-driven insights, recommendations, and risk analysis for your farm.
            </p>
          </div>

          {/* Period Dropdown 
          <div className="mt-4 sm:mt-0">
            <label
              htmlFor="period"
              className="block text-sm text-gray-600 mb-1"
            >
              Select period
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                refetchInsights();
              }}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>*/}
        </div> 
        {/* Key Metrics */}
        {insights?.keyMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(insights.keyMetrics).map(([metric, value]) => (
              <div
                key={metric}
                className="bg-white border border-green-100 rounded-lg p-3 shadow-sm"
              >
                <p className="text-xs text-gray-500 capitalize">
                  {metric.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-lg font-semibold text-green-700">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* AI Insights Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1">
            Insight Summary
          </h3>
          <p className="text-gray-700 text-sm">
            {insights?.aiInsights?.summary || "No insights available yet."}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Confidence:{" "}
            {insights?.aiInsights?.confidence
              ? `${(insights.aiInsights.confidence * 100).toFixed(0)}%`
              : "N/A"}
          </p>
        </div>
        
        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Recommendations
          </h3>
          {Array.isArray(insights?.recommendations) &&
            insights.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {insights.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`border-l-4 p-4 rounded-md shadow-sm ${rec.priority === "high"
                      ? "border-red-400 bg-red-50"
                      : rec.priority === "medium"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-green-400 bg-green-50"
                    }`}
                >
                  <p className="font-semibold text-gray-800 capitalize">
                    {rec.type}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    Priority: {rec.priority}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{rec.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No recommendations available.
            </p>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Risk Assessment
          </h3>
          {Array.isArray(insights?.riskAssessment) &&
            insights.riskAssessment.length > 0 ? (
            <div className="space-y-3">
              {insights.riskAssessment.map((risk, i) => (
                <div
                  key={i}
                  className={`border-l-4 p-4 rounded-md ${risk.level === "high"
                      ? "border-red-400 bg-red-50"
                      : risk.level === "medium"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-green-400 bg-green-50"
                    }`}
                >
                  <p className="font-semibold text-gray-800 capitalize">
                    {risk.type} Risk ({risk.level})
                  </p>
                  <p className="text-sm text-gray-700">{risk.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No risks identified for this period.
            </p>
          )}
        </div>
        
        <p className="text-xs text-gray-400 text-right">
          Last updated:{" "}
          {insights?.period?.endDate
            ? new Date(insights.period.endDate).toLocaleString()
            : "—"}
        </p>
      </section>

    </div>
  );
}