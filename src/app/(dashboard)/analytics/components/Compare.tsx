"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import { useFarmComparison } from "@/lib/hooks/useDashboard"; 
import { CompareParams } from "@/lib/services/dashboard";

const PlaceholderChart: React.FC<{ data: any, metric: string }> = ({ data, metric }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">Select farms and a metric to run comparison.</div>;
  }
  
  // NOTE: In a full implementation, this component would render a Line or Bar Chart
  // comparing farm performance over time for the selected metric.
  return (
    <div className="border border-gray-200 p-6 rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-4">Comparison Chart: {metric} Over Time</h3>
      <ul className="space-y-2 text-sm">
        {data.map((farmData: any) => (
          <li key={farmData.farmId} className="flex justify-between items-center p-2 border-b">
            <span className="font-medium">{farmData.farmName || `Farm ${farmData.farmId}`}</span>
            <span className="text-gray-600">
              Avg. {metric}: <span className="font-bold text-green-700">{farmData.averageValue || 'N/A'}</span>
            </span>
          </li>
        ))}
        <li className="text-center pt-4 italic text-gray-500">
          [Actual Line/Bar Chart Visualization Goes Here]
        </li>
      </ul>
    </div>
  );
};

export default function ComparisonTab() {
  const [params, setParams] = useState<CompareParams>({
    farmIds: "farmId1,farmId2", // Placeholder for initial selection
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    metric: "yield",
  });
  
  // State to manage whether to actually fetch data (prevents immediate fetch with placeholders)
  const [fetchEnabled, setFetchEnabled] = useState(false);
  
  // Conditionally enable fetch based on fetchEnabled state
  const fetchParams = fetchEnabled ? params : undefined;

  const { data: comparisonData, isLoading, error } = useFarmComparison(fetchParams);

  const metrics = [
    { value: "yield", label: "Yield" },
    { value: "revenue", label: "Revenue" },
    { value: "profit", label: "Profit" },
    { value: "efficiency", label: "Efficiency" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
    setFetchEnabled(false); 
  };

  const handleRunComparison = () => {
    // Basic validation check (e.g., ensures multiple farms are selected)
    if (params.farmIds.split(',').length < 2) {
      alert("Please enter at least two Farm IDs separated by commas.");
      return;
    }
    setFetchEnabled(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Farm Comparison</h2>
        <p className="text-sm text-gray-500">
          Compare performance metrics across multiple farms over a selected period.
        </p>
      </div>

      <Card title="Comparison Parameters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Farm IDs Input */}
          <div className="md:col-span-2">
            <label htmlFor="farmIds" className="block text-sm font-medium text-gray-700">
              Farm IDs (comma-separated)
            </label>
            <input
              type="text"
              id="farmIds"
              name="farmIds"
              value={params.farmIds}
              onChange={handleChange}
              required
              placeholder="e.g., id1, id2, id3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            />
          </div>

          {/* Metric Select */}
          <div>
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700">
              Metric
            </label>
            <select
              id="metric"
              name="metric"
              value={params.metric}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            >
              {metrics.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Run Button (placed here for layout) */}
          <div className="flex items-end pt-2">
            <button
              onClick={handleRunComparison}
              disabled={isLoading || !params.farmIds || params.farmIds.split(',').length < 2}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              {isLoading ? "Comparing..." : "Run Comparison"}
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={params.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={params.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            />
          </div>
        </div>

      </Card>

      {/* Comparison Results */}
      <Card title="Comparison Results" className="min-h-72">
        {error && <div className="text-red-600 p-4">Error fetching comparison data: {error.message}</div>}
        {fetchEnabled && !isLoading && !error && (
            <PlaceholderChart data={comparisonData?.comparisonData} metric={params.metric} />
        )}
        {!fetchEnabled && !isLoading && !error && (
            <p className="text-gray-500 italic text-center py-10">
                Configure comparison parameters and click "Run Comparison".
            </p>
        )}
      </Card>
    </div>
  );
}