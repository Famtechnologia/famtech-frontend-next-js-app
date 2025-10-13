"use client";
import { Lightbulb, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';

const SmartAdvisory = () => {
  // 🔒 Mock data (temporarily disabled until backend integration)
  /*
  const advisories = [
    {
      type: "weather",
      title: "Weather Advisory",
      message: "Ideal time for planting maize in your region is now. Soil moisture is optimal.",
      time: "Today",
      icon: Lightbulb,
      color: "text-blue-500",
      bgColor: "bg-green-50"
    },
    {
      type: "harvest",
      title: "Harvest Tip",
      message: "Your tomatoes will be ready for harvest in approximately 7 days.",
      time: "Yesterday", 
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-yellow-50"
    }
  ];
  */

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>Smart Advisory</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      }
      className="h-fit"
      headerClassName="bg-blue-50 border-b border-blue-200"
      bodyClassName="p-6"
    >
      <div className="flex flex-col justify-between min-h-[180px]">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-4">
          <Lightbulb className="w-8 h-8 text-blue-500 mb-3" />
          <p className="text-sm mb-4 max-w-xs">
            Get AI-powered farming tips and insights tailored to your crops and location.
          </p>
        </div>

        
      </div>
    </Card>
  );
};

export default SmartAdvisory;
