"use client";
import React from "react";
import { Wheat } from "lucide-react";
import Card from "@/components/ui/Card";

const CropHealthCard = () => {
  // Mock data (commented for now until API integration)
  /*
  const crops = {
    winterWheat: { healthScore: 85 },
    corn: { healthScore: 68 },
  };

  const weather = {
    current: {
      humidity: 62,
      soilTemp: 18,
    },
  };
  */

  return (
    <div className="h-full">
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>Crop Health Snapshot</span>
          <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
            Coming Soon
          </span>
        </div>
      }
      className="h-full"
      headerClassName="bg-green-50 border-b border-green-200"
      bodyClassName="p-6"
    >
      <div className="flex flex-col items-center justify-center text-center text-gray-600 space-y-6 mt-8">
        {/* Default placeholder message */}
        <div className="w-full flex flex-col items-center space-y-2">
          <Wheat className="w-8 h-8 text-green-500" />
          <p className="text-sm text-gray-700">
            Crop health insights coming soon...
          </p>
          <p className="text-xs text-gray-500">
            Monitor soil condition, humidity & crop status with detailed reports.
          </p>
        </div>

       
      </div>
    </Card>
    </div>
  );
};

export default CropHealthCard;
