"use client"
import { Lightbulb, CheckCircle,  } from 'lucide-react';
import Card from '@/components/ui/Card'



const SmartAdvisory = () => {
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

  return (
    <Card title="Smart Advisory" className="h-fit" headerClassName='bg-blue-50'>
      <div className="space-y-4">
        {advisories.map((advisory, index) => (
          <div key={index} className={`flex items-start space-x-3 p-3 ${advisory.bgColor} rounded-lg border border-gray-100`}>
            <advisory.icon className={`w-5 h-5 ${advisory.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{advisory.title}</div>
              <div className="text-sm text-gray-600 mt-1">{advisory.message}</div>
              <div className="text-xs text-gray-500 mt-2">{advisory.time}</div>
            </div>
          </div>
        ))}
        
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
          View all advisories →
        </button>
      </div>
    </Card>
  );
};

export default SmartAdvisory