"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import PerformanceChart from "@/components/analytics/PerformanceChart";
import { useDashboardData, useInsights } from "@/lib/hooks/useDashboard";
import { useAuth } from "@/lib/hooks/useAuth";

export default function OverviewTab() {
  const { user } = useAuth();
  const farmId = user?.farmProfile;

  // Fetch analytics data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData(farmId || "", { refreshInterval: 60000 });

  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    error: insightsError,
  } = useInsights(farmId || "", { refreshInterval: 60000 });

  const [showInsights, setShowInsights] = useState(true);
  const isLoading = isDashboardLoading || isInsightsLoading;
  const error = dashboardError || insightsError;

  useEffect(() => {
    if (dashboardError) toast.error("Failed to load dashboard data.");
    if (insightsError) toast.error("Failed to load insights.");
  }, [dashboardError, insightsError]);

  if (!user)
    return <div className="p-6 text-gray-600 italic">Loading user data...</div>;

  if (!farmId)
    return (
      <div className="p-6 text-gray-600 italic">
        Unable to load analytics overview — no active farm selected.
      </div>
    );

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

  // Normalize data
  const keyMetrics =
    insightsData?.data?.keyMetrics ??
    insightsData?.keyMetrics ??
    dashboardData?.keyMetrics ??
    dashboardData?.data?.keyMetrics ??
    {};

  const ai = insightsData?.data?.aiInsights ?? insightsData?.aiInsights ?? {};
  const benchmarks =
    insightsData?.data?.benchmarks ?? insightsData?.benchmarks ?? {};
  const risks =
    insightsData?.data?.riskAssessment ?? insightsData?.riskAssessment ?? [];
  const recommendations =
    insightsData?.data?.recommendations ??
    insightsData?.recommendations ??
    [];

  const trends =
    insightsData?.data?.trends?.message ??
    insightsData?.trends?.message ??
    "No trend data available.";

  const formatVal = (v: any) =>
    v === undefined || v === null
      ? "-"
      : typeof v === "number"
      ? v.toLocaleString()
      : v;

  // Metrics section (ensures 3 core metrics)
  const metrics = [
    {
      title: "Total Yield",
      value:
        keyMetrics.totalYield ??
        keyMetrics.total_yield ??
        dashboardData?.totalYield ??
        0,
    },
    {
      title: "Total Revenue",
      value:
        keyMetrics.totalRevenue ??
        keyMetrics.total_revenue ??
        dashboardData?.totalRevenue ??
        0,
    },
    {
      title: "Efficiency",
      value:
        keyMetrics.successRate ??
        keyMetrics.success_rate ??
        keyMetrics.averageYieldPerHectare ??
        0,
    },
  ];

  // Forecast / AI data
  const forecast = {
    yieldPrediction:
      ai?.yieldPrediction ?? ai?.yield ?? ai?.predicted_yield ?? "—",
    revenueProjection:
      ai?.revenueProjection ?? ai?.revenue ?? ai?.predicted_revenue ?? "—",
    confidence:
      ai?.confidence ??
      ai?.confidence_score ??
      ai?.data?.confidence ??
      "—",
    summary: ai?.summary ?? "No AI summary available.",
    source: ai?.source ?? "n/a",
  };

  // Dummy chart if no trend data (so layout stays consistent)
  const emptyChartValues = [0, 0, 0, 0, 0];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="bg-green-50 border border-green-200 rounded-md p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">{m.title}</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {formatVal(m.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Predictive Analysis */}
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
              {typeof forecast.confidence === "number"
                ? `${(forecast.confidence * 100).toFixed(0)}%`
                : forecast.confidence}
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200 text-sm text-gray-700">
          <p>{forecast.summary}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence:{" "}
            {typeof forecast.confidence === "number"
              ? `${(forecast.confidence * 100).toFixed(0)}%`
              : forecast.confidence}{" "}
            • Source: {forecast.source}
          </p>
        </div>

        {/* Chart */}
        <div className="mt-4">
          <PerformanceChart
            title="Recent Yield Trends"
            labels={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]}
            values={emptyChartValues}
          />
          <p className="text-xs text-gray-400 mt-2">{trends}</p>
        </div>
      </Card>

      {/* Benchmarks */}
      {benchmarks && Object.keys(benchmarks).length > 0 && (
        <Card title="Benchmarks">
          <p className="text-sm text-gray-500 mb-3">
            Comparison of your farm’s performance against regional averages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(benchmarks).map(([metric, data]: [string, any]) => (
              <div
                key={metric}
                className="p-4 bg-green-50 border border-green-200 rounded-md"
              >
                <p className="text-sm text-gray-600 capitalize">{metric}</p>
                <p className="text-base text-gray-700">
                  Farm: {data.farm ?? 0} | Regional: {data.regional ?? 0}
                </p>
                <p className="text-xs text-gray-500 italic">
                  Performance: {data.performance ?? "n/a"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risk Assessment */}
      {Array.isArray(risks) && risks.length > 0 && (
        <Card title="Risk Assessment">
          <p className="text-sm text-gray-500 mb-3">
            Identified operational and financial risks.
          </p>
          <div className="space-y-3">
            {risks.map((r: any, i: number) => (
              <div
                key={i}
                className={`p-4 rounded-md border ${
                  r.level === "high"
                    ? "border-red-300 bg-red-50"
                    : r.level === "medium"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-green-300 bg-green-50"
                }`}
              >
                <p className="font-medium text-gray-800 capitalize">
                  {r.type} risk — {r.level}
                </p>
                <p className="text-sm text-gray-600">{r.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Intelligent Insights */}
      <Card title="Intelligent Insights">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Actionable recommendations generated by the analytics engine.
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
            {recommendations.length > 0 ? (
              recommendations.map(
                (
                  tip: { message: string; type: string; priority: string },
                  i: number
                ) => (
                  <li key={i} className="text-sm">
                    <strong className="capitalize">{tip.type}</strong> (
                    {tip.priority}): {tip.message}
                  </li>
                )
              )
            ) : (
              <li className="text-sm italic text-gray-500">
                No AI recommendations available yet — generate recent analytics
                to view insights.
              </li>
            )}
          </ul>
        )}
      </Card>

      {/* Last updated */}
      <p className="text-xs text-gray-400 text-right">
        Last updated:{" "}
        {dashboardData?.data?.lastUpdated
          ? new Date(dashboardData.data.lastUpdated).toLocaleString()
          : new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
