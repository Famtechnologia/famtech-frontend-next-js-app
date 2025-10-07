'use client';
import { BarChart3, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';

const MarketPrices = () => {
  // 🔒 Placeholder: mock data commented out until API is ready
  /*
  const prices = [
    { crop: "Maize", price: "$35.00", market: "Nairobi", trend: "up" },
    { crop: "Tomatoes", price: "$65.50", market: "Kisumu", trend: "down" },
    { crop: "Potatoes", price: "$45.25", market: "Nakuru", trend: "up" }
  ];
  */

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>Market Prices</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      }
      className="h-fit"
      headerClassName="bg-blue-50 border-b border-blue-200"
      bodyClassName="p-6"
    >
      {/* Empty State */}
      <div className="flex flex-col justify-between min-h-[180px]">
        <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-4">
          <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
          <p className="text-sm mb-4 max-w-xs">
            Track real-time crop prices from nearby markets. Stay ahead with smarter selling decisions.
          </p>
        </div>

        {/* Bottom-left action link
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium mt-auto">
          Get Started <ArrowRight className="w-4 h-4 ml-1" />
        </button> */}
      </div>
    </Card>
  );
};

export default MarketPrices;
