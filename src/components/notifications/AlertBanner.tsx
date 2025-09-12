'use client'
import { Cloud, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card'


const Alerts = () => {
  const alerts = [
    {
      type: "pest",
      title: "Pest Alert",
      message: "Fall armyworm detected in nearby farms. Check your maize crop.",
      time: "2 hours ago",
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      type: "weather",
      title: "Weather Warning", 
      message: "Heavy rainfall expected tomorrow. Secure your crops.",
      time: "1 day ago",
      icon: Cloud,
      color: "text-blue-500"
    }
  ];

  return (
    <Card title="Alerts" className="h-fit " headerClassName='bg-yellow-50 border-b border-yellow-200' bodyClassName='p-6'>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start space-x-3 p-3">
            <alert.icon className={`w-5 h-5 ${alert.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{alert.title}</div>
              <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
              <div className="text-xs text-gray-500 mt-2">{alert.time}</div>
            </div>
          </div>
        ))}
        
        <button className="text-yellow-600 text-sm font-medium hover:text-yellow-700 flex items-center">
          View all alerts →
        </button>
      </div>
    </Card>
  );
};

export default Alerts;