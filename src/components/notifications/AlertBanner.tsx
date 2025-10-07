'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import Card from '@/components/ui/Card';

const Alerts = () => {
  // 🔒 Placeholder: real alert data will be added once backend connects
  /*
  const alerts = [
    {
      type: 'pest',
      title: 'Pest Alert',
      message: 'Fall armyworm detected in nearby farms. Check your maize crop.',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      type: 'weather',
      title: 'Weather Warning',
      message: 'Heavy rainfall expected tomorrow. Secure your crops.',
      time: '1 day ago',
      icon: Cloud,
      color: 'text-blue-500'
    }
  ];
  */

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>Alerts</span>
          <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      }
      className="h-fit"
      headerClassName="bg-yellow-50 border-b border-yellow-200"
      bodyClassName="p-6"
    >
      {/* Empty state */}
      <div className="flex flex-col justify-between min-h-[180px]">
        <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-4">
          <Bell className="w-8 h-8 text-yellow-500 mb-3" />
          <p className="text-sm mb-4 max-w-xs">
            No alerts yet. Enable notifications to get real-time updates about your farm.
          </p>
        </div>

        {/* Bottom-left action button 
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium mt-auto">
          Get Started <ArrowRight className="w-4 h-4 ml-1" />
        </button>*/}
      </div>
    </Card>
  );
};

export default Alerts;
