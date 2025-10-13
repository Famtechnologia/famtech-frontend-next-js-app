// app/(WeatherForecast.tsx
"use client";
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card'
import {  Sun, CloudRain, Wind, Eye, Cloudy, CloudFog, CloudDrizzle, CloudLightning } from 'lucide-react';
import { getWeather } from '@/lib/services/weatherAPI';
import { useAuth } from '@/lib/hooks/useAuth';
import { WeatherApiResponse } from '@/types/weather';

// Helper function to categorize UV Index


// Helper function to estimate UV Index based on weather conditions
const estimateUVIndex = (weather: WeatherApiResponse | undefined) => {
  if (!weather || !weather.weather || !weather.clouds) {
    return null;
  }

  const weatherCondition = weather.weather[0]?.main;
  const cloudiness = weather.clouds.all; // in %

  if (weatherCondition === "Clear") {
    if (cloudiness < 10) return 10; // Extreme
    if (cloudiness < 30) return 7; // High
    if (cloudiness < 60) return 5; // Moderate
    return 2; // Low
  }

  if (weatherCondition === "Clouds") {
    if (cloudiness < 50) return 4; // Moderate
    return 2; // Low
  }

  if (weatherCondition === "Rain" || weatherCondition === "Drizzle" || weatherCondition === "Thunderstorm") {
    return 1; // Low
  }

  return null; // For other conditions like "Snow", "Mist", etc.
};

//Helper function to get the right weather according to the weather
function getWeatherIcon(description: string) {
  const desc = description.toLowerCase();

  if (desc.includes("sun") || desc.includes("clear")) {
    return <Sun className="w-12 h-12 text-yellow-500" />;
  }
  if (desc.includes("cloud")) {
    return <Cloudy className="w-12 h-12 text-gray-400" />;
  }
  if (
    desc.includes("rain") ||
    desc.includes("drizzle") ||
    desc.includes("shower")
  ) {
    return <CloudRain className="w-12 h-12 text-blue-400" />;
  }
  if (desc.includes("snow") || desc.includes("sleet")) {
    return <CloudDrizzle className="w-12 h-12 text-blue-200" />;
  }
  if (desc.includes("thunder") || desc.includes("storm")) {
    return <CloudLightning className="w-12 h-12 text-yellow-700" />;
  }
  if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze")) {
    return <CloudFog className="w-12 h-12 text-gray-300" />;
  }
  // Add more mappings as needed

  // Default icon
  return <Sun className="w-12 h-12 text-yellow-500" />;
}

export default function WeatherForecast() {
 const [weatherInfo, setWeatherInfo] = useState<WeatherApiResponse | undefined>();

  const {user} = useAuth()
  console.log(user)

useEffect(() => {
  const getAsyncWeather = async () => {
    // These values are used inside the effect, so they must be dependencies.
    const res = await getWeather(
      user?.country || "nigeria",
      user?.state || "lagos",
      user?.lga // optional — only included if available
    );

    console.log("this is the weather data ", res.data);
    setWeatherInfo(res?.data);
  };
  getAsyncWeather();

}, [user?.country, user?.state, user?.lga]);
  
  return (
    <Card
      title="Weather Forecast"
      className="h-[350px] md:h-[320px] "
      headerClassName="bg-[#EFF6FF] border-b border-blue-200"
      bodyClassName="p-6"
    >
      <div className="space-y-4">
        {/* Main weather display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weatherInfo?.weather?.[0]?.description || "N/A")}
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {Math.round(weatherInfo?.main?.temp || 0)}°C
              </div>
              <div className="text-sm text-gray-600">
                {weatherInfo?.weather?.[0]?.description || "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {weatherInfo?.name || "N/A"}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Updated 10 min ago</div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <div className="text-xs text-gray-600">
              {Math.round(weatherInfo?.clouds?.all || 0)}% chance
            </div>
            <div className="text-xs font-medium">Rain</div>
          </div>
          <div className="text-center">
            <Wind className="w-6 h-6 text-gray-500 mx-auto mb-1" />
            <div className="text-xs text-gray-600">
              {Math.round(weatherInfo?.wind?.speed || 0).toFixed(1)} km/h
            </div>
            <div className="text-xs font-medium">Wind</div>
          </div>
          <div className="text-center">
            <Eye className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <div className="text-xs text-gray-600">
              {estimateUVIndex(weatherInfo) ?? "N/A"} of 10
            </div>
            <div className="text-xs font-medium">UV Index</div>
          </div>
        </div>

       {/* <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
          View 5-day forecast →
        </button>*/}
      </div>
    </Card>
  );
};
