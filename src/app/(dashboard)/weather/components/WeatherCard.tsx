// app/(WeatherForecast.tsx
"use client";
import { useEffect } from 'react';
import Card from '@/components/ui/Card'
import {  Sun, CloudRain, Wind, Eye,  } from 'lucide-react';
import { getWeather } from '@/lib/services/weatherAPI';
import { useAuth } from '@/lib/hooks/useAuth';

export default function WeatherForecast() {

  const {user} = useAuth()
  console.log(user)

  useEffect(() => {
    const getAsyncWeather = async () => {
      const res = await getWeather(user?.country || "nigeria", user?.state || 'lagos');
      console.log(res);
    };
    getAsyncWeather();
  }, [])
  
  return (
     <Card title="Weather Forecast" className="h-[350px] md:h-[320px] " headerClassName='bg-[#EFF6FF] border-b border-blue-200' bodyClassName='p-6' >
       <div className="space-y-4">
         {/* Main weather display */}
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <Sun className="w-12 h-12 text-yellow-500" />
             <div>
               <div className="text-3xl font-bold text-gray-800">24°C</div>
               <div className="text-sm text-gray-600">Partly Cloudy</div>
               <div className="text-xs text-gray-500 mt-1">Lagos</div>
             </div>
           </div>
           <div className="text-xs text-gray-500">Updated 10 min ago</div>
         </div>
         
         {/* Weather details */}
         <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
           <div className="text-center">
             <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
             <div className="text-xs text-gray-600">30% chance</div>
             <div className="text-xs font-medium">Rain</div>
           </div>
           <div className="text-center">
             <Wind className="w-6 h-6 text-gray-500 mx-auto mb-1" />
             <div className="text-xs text-gray-600">12 km/h</div>
             <div className="text-xs font-medium">Wind</div>
           </div>
           <div className="text-center">
             <Eye className="w-6 h-6 text-orange-500 mx-auto mb-1" />
             <div className="text-xs text-gray-600">5 of 10</div>
             <div className="text-xs font-medium">UV Index</div>
           </div>
         </div>
         
         <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
           View 5-day forecast →
         </button>
       </div>
     </Card>
   );
};

