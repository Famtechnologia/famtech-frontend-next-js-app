"use client";
import { Search } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/apiClient"; // Assuming apiClient is configured here

// Define the structure for a market item
interface MarketItem {
  id: string;
  name: string;
  type: "crop" | "livestock";
  price: number;
}

// Sample market data. In a real application, this would come from an API.
const marketData: MarketItem[] = [
  { id: "1", name: "Wheat", type: "crop", price: 150.5 },
  { id: "2", name: "Maize", type: "crop", price: 130.75 },
  { id: "3", name: "Soybeans", type: "crop", price: 200.0 },
  { id: "4", name: "Cow", type: "livestock", price: 500.0 },
  { id: "5", name: "Chicken", type: "livestock", price: 25.0 },
  { id: "6", name: "Goat", type: "livestock", price: 150.0 },
];

const Overview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<MarketItem[]>(marketData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/api/market/overview");
        const marketData = response.data;
  
        if (!marketData || marketData.length === 0) {
          setError("No market data available.");
          return;
        }

        setFilteredData(marketData);
        setLoading(false);
  
      } catch (err) {
        console.error(err);
        setError("Failed to fetch market data.");
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchMarketData();
    }, [fetchMarketData]);

  return (
    <div className="order-1 lg:order-2">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search price..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
        />
      </div>
      <div className="space-y-2 mt-4">
        {marketData.map((item) => (
          <div
            key={item?.id}
            className="bg-white rounded-lg shadow-sm border hover:border-green-500 transition-all duration-300 p-4 border-gray-200 flex flex-col"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
              </div>
              <p className="text-lg font-bold text-green-600">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
