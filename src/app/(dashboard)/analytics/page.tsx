"use client";

import { useState } from "react";
import Overview from "./components/AnalyticsOverview";
import Generate from "./components/Generate";
import HistoryTab from "./components/History";
import ComparisonTab from "./components/Compare";
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "generate", label: "Generate" },
    { id: "history", label: "History" },
    
    { id: "comparison", label: "Comparison" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "generate":
        return <Generate/>
      case "history":
        return <HistoryTab />;
     
      case "comparison":
        return <ComparisonTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-6 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <h1 className=" ml-3 md:ml-0 text-2xl font-bold text-green-600 mb-3 md:mb-0">
          Reports & Analytics
        </h1>
       
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === tab.id
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 bg-white p-2 md:p-6 rounded-md shadow-none md:shadow-sm border border-gray-50 md:border-gray-100">
        {renderTabContent()}
      </div>
    </div>
  );
}
