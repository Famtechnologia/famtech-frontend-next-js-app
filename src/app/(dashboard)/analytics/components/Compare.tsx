"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFarmComparison } from "@/lib/hooks/useDashboard"; 
import { CompareParams } from "@/lib/services/dashboard";

// --- Custom Types for Type Safety ---

interface FarmAsset {
  _id: string;
  id?: string;
  farmName: string;
  // Add other necessary farm fields here
}

interface AuthUser {
  id: string;
  email: string;
  farmProfile: string; // Primary farm ID
  farmAssets: FarmAsset[];
}

interface ComparisonMetric {
  farmId: string;
  farmName?: string;
  averageValue: number | string;
  // Add time series data structure if available
}

// --- Component Definitions ---

const PlaceholderChart: React.FC<{ data: ComparisonMetric[] | undefined, metric: string }> = ({ data, metric }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">Select farms and a metric to run comparison.</div>;
  }
  
  return (
    <div className="border border-gray-200 p-6 rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-4">Comparison Chart: {metric} Over Time</h3>
      <ul className="space-y-2 text-sm">
        {data.map((farmData: ComparisonMetric) => (
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
  // Cast user to the defined AuthUser interface for type safety
  const { user } = useAuth() as { user: AuthUser | null };
  
  // Get primary farm ID from user profile
  const primaryFarmId = user?.farmProfile || "";
  
  // Cast user?.farmAssets to FarmAsset[]
  const userFarms = (user?.farmAssets || []) as FarmAsset[];
  
  // State for farm selection dropdowns
  const [farm1, setFarm1] = useState<string>("");
  const [farm2, setFarm2] = useState<string>("");
  
  // Sync farm1 with primaryFarmId when user data loads and farm1 is not set
  // FIX: Add farm1 to dependencies to satisfy exhaustive-deps warning
  useEffect(() => {
    if (primaryFarmId && !farm1) {
      setFarm1(primaryFarmId);
    }
  }, [primaryFarmId, farm1]); 
  
  // Initialize with empty farmIds - will be updated when user clicks Run
  const [farmIds, setFarmIds] = useState<string>("");
  
  const [params, setParams] = useState<CompareParams>({
    farmIds: "", 
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    metric: "yield",
  });
  
  // Update params when farmIds changes
  useEffect(() => {
    setParams(prev => ({ ...prev, farmIds }));
  }, [farmIds]);

  // Assuming useFarmComparison returns { comparisonData: ComparisonMetric[] } on success
  const { data: comparisonData, isLoading, error } = useFarmComparison(farmIds ? params : undefined);

  const metrics = [
    { value: "yield", label: "Yield" },
    { value: "revenue", label: "Revenue" },
    { value: "profit", label: "Profit" },
    { value: "efficiency", label: "Efficiency" },
  ];

  const handleFarmChange = (farmNumber: 1 | 2, value: string) => {
    if (farmNumber === 1) {
      setFarm1(value);
    } else {
      setFarm2(value);
    }
    setFarmIds(""); // Reset comparison when farms change
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "yield" | "revenue" | "profit" | "efficiency";
    setParams({ ...params, metric: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleRunComparison = () => {
    // Validation: ensure two different farms are selected
    if (!farm1 || !farm2) {
      toast.error("Please select two farms to compare.");
      return;
    }
    if (farm1 === farm2) {
      toast.error("Please select two different farms for comparison.");
      return;
    }
    
    // Set farmIds which will trigger the fetch via useEffect
    setFarmIds(`${farm1},${farm2}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Farm Comparison</h2>
        <p className="text-sm text-gray-500">
          Compare performance metrics across two farms over a selected period.
        </p>
      </div>

      <Card title="Comparison Parameters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Farm 1 Select */}
          <div>
            <label htmlFor="farm1" className="block text-sm font-medium text-gray-700">
              Farm 1
            </label>
            <select
              id="farm1"
              value={farm1}
              onChange={(e) => handleFarmChange(1, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            >
              <option value="">Select Farm 1</option>
              {primaryFarmId && (
                <option value={primaryFarmId}>
                  {user?.email || "My Farm"} (Primary)
                </option>
              )}
              {/* Iterating over userFarms (now FarmAsset[]) */}
              {userFarms.length >= 1 && userFarms.map((farm: FarmAsset) => (
                <option key={farm._id || farm.id} value={farm._id || farm.id}>
                  {farm.farmName || `Farm ${farm._id || farm.id}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Farm ID: {farm1 || "not selected"}</p>
          </div>

          {/* Farm 2 Select */}
          <div>
            <label htmlFor="farm2" className="block text-sm font-medium text-gray-700">
              Farm 2
            </label>
            <select
              id="farm2"
              value={farm2}
              onChange={(e) => handleFarmChange(2, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            >
              <option value="">Select Farm 2</option>
              {primaryFarmId && (
                <option value={primaryFarmId}>
                  {user?.email || "My Farm"} (Primary)
                </option>
              )}
              {/* Iterating over userFarms (now FarmAsset[]) */}
              {userFarms.length >= 1 && userFarms.map((farm: FarmAsset) => (
                <option key={farm._id || farm.id} value={farm._id || farm.id}>
                  {farm.farmName || `Farm ${farm._id || farm.id}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Farm ID: {farm2 || "not selected"}</p>
          </div>

          {/* Metric Select */}
          <div>
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700">
              Metric
            </label>
            <select
              id="metric"
              value={params.metric}
              onChange={handleMetricChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            >
              {metrics.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Farm IDs Display (for debugging/info) */}
        {farm1 && farm2 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            📊 Comparing farms: <span className="font-mono">{farm1}</span> vs <span className="font-mono">{farm2}</span>
          </div>
        )}

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
              onChange={handleDateChange}
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
              onChange={handleDateChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
            />
          </div>
        </div>


        {/* Run Button (placed here for layout) */}
          <div className="flex items-end pt-2">
            <button
              onClick={handleRunComparison}
              disabled={isLoading || !farm1 || !farm2 || farm1 === farm2}
              className={`w-40 py-2 px-4 border border-transparent mt-3 rounded-md shadow-sm text-sm font-medium text-white transition ${
                isLoading || !farm1 || !farm2 || farm1 === farm2
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              {isLoading ? "Comparing..." : "Run Comparison"}
            </button>
          </div>

        {/* Info Message */}
        {!primaryFarmId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ No farm found. Please complete your farm profile first.
          </div>
        )}
        
        {primaryFarmId && userFarms.length < 2 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            {/* FIX: Escaped apostrophe */}
            ℹ️ You currently have only 1 farm. Add more farms to compare them.
          </div>
        )}

      </Card>

      {/* Comparison Results */}
      <Card title="Comparison Results" className="min-h-72">
        {error && <div className="text-red-600 p-4">Error fetching comparison data: {error.message}</div>}
        {farmIds && !isLoading && !error && (
            <PlaceholderChart data={comparisonData?.comparisonData as ComparisonMetric[]} metric={params.metric} />
        )}
        {!farmIds && !isLoading && !error && (
            <p className="text-gray-500 italic text-center py-10">
                Select two different farms and click &#34;Run Comparison&#34;.
            </p>
        )}
      </Card>
    </div>
  );
}