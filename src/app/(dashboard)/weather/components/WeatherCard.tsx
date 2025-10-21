// app/(WeatherForecast.tsx
"use client";
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card'
import { Sun, CloudRain, Wind, Eye, Cloudy, CloudFog, CloudDrizzle, CloudLightning, Loader2 } from 'lucide-react';
import { getWeather } from '@/lib/services/weatherAPI';
import { useAuth } from '@/lib/hooks/useAuth';
import { WeatherApiResponse } from '@/types/weather';

// Helper functions (estimateUVIndex, getWeatherIcon) remain the same...
// ... (omitted for brevity)
const estimateUVIndex = (weather: WeatherApiResponse | undefined) => {
    if (!weather || !weather.weather || !weather.clouds) {
        return null;
    }
    const weatherCondition = weather.weather[0]?.main;
    const cloudiness = weather.clouds.all; // in %

    if (weatherCondition === "Clear") {
        if (cloudiness < 10) return 10;
        if (cloudiness < 30) return 7;
        if (cloudiness < 60) return 5;
        return 2;
    }

    if (weatherCondition === "Clouds") {
        if (cloudiness < 50) return 4;
        return 2;
    }

    if (weatherCondition === "Rain" || weatherCondition === "Drizzle" || weatherCondition === "Thunderstorm") {
        return 1;
    }

    return null;
};
function getWeatherIcon(description: string) {
    const desc = description.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) return <Sun className="w-12 h-12 text-yellow-500" />;
    if (desc.includes("cloud")) return <Cloudy className="w-12 h-12 text-gray-400" />;
    if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) return <CloudRain className="w-12 h-12 text-blue-400" />;
    if (desc.includes("snow") || desc.includes("sleet")) return <CloudDrizzle className="w-12 h-12 text-blue-200" />;
    if (desc.includes("thunder") || desc.includes("storm")) return <CloudLightning className="w-12 h-12 text-yellow-700" />;
    if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze")) return <CloudFog className="w-12 h-12 text-gray-300" />;
    return <Sun className="w-12 h-12 text-yellow-500" />;
}
// ---------------------------------------------


export default function WeatherForecast() {
    const [weatherInfo, setWeatherInfo] = useState<WeatherApiResponse | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    // 💡 NEW STATE: Store the determined location string once the user is ready
    const [displayLocation, setDisplayLocation] = useState('N/A'); 

    const { user } = useAuth();
    
    // --- Effect to Fetch Weather ---
    useEffect(() => {
        // 💡 CRITICAL CHECK: Wait until the user object is not null/undefined AND 
        // has had its properties set (country/state are the values we care about).
        if (!user) {
            // Check if useAuth has a dedicated property to signal it's done loading
            // If useAuth is asynchronous, this return prevents premature API calls.
            return; 
        }

  useEffect(() => {
    const getAsyncWeather = async () => {
     // These values are used inside the effect, so they must be dependencies.
     const res = await getWeather(user?.country || "nigeria", user?.state || 'lagos');
      setWeatherInfo(res?.data);
    };
    getAsyncWeather();
  // FIX: Include user?.country and user?.state in the dependency array.
  }, [user?.country, user?.state]) 
  
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

        const getAsyncWeather = async () => {
            setIsLoading(true);

            try {
                const res = await getWeather(country, state);
                setWeatherInfo(res?.data);

                // FINAL LOCATION ADJUSTMENT: If the API city name is different, combine them
                if (res?.data?.name && res.data.name.toLowerCase() !== state.toLowerCase()) {
                    setDisplayLocation(`${res.data.name}, ${formattedState}`);
                }
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                setWeatherInfo(undefined);
                // On error, revert to just the state name
                setDisplayLocation(formattedState); 
            } finally {
                setIsLoading(false);
            }
        };
        
        getAsyncWeather();

    }, [user]); // Depend only on the `user` object.

    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-gray-500 text-sm">Loading weather for {displayLocation}...</p>
                </div>
            );
        }

        if (!weatherInfo) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                    <p className="text-red-500 font-medium">Weather data unavailable.</p>
                    <p className="text-gray-500 text-sm">Could not fetch weather for **{displayLocation}**.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Main weather display */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {getWeatherIcon(weatherInfo.weather?.[0]?.description || "N/A")}
                        <div>
                            <div className="text-3xl font-bold text-gray-800">
                                {Math.round(weatherInfo.main?.temp || 0)}°C
                            </div>
                            <div className="text-sm text-gray-600">
                                {weatherInfo.weather?.[0]?.description || "N/A"}
                            </div>
                            {/* 💡 RENDER THE NEW STATE VARIABLE */}
                            <div className="text-xs text-gray-500 mt-1 font-medium">
                                {displayLocation} 
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">Updated recently</div>
                </div>

                {/* Weather details */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <Cloudy className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">
                            {Math.round(weatherInfo.clouds?.all || 0)}%
                        </div>
                        <div className="text-xs font-medium">Chance of Rain</div> 
                    </div>
                    <div className="text-center">
                        <Wind className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">
                            {(weatherInfo.wind?.speed || 0).toFixed(1)} km/h
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
            </div>
        );
    };

    return (
        <Card
            title="Weather Forecast"
            className="h-[350px] md:h-[320px]"
            headerClassName="bg-[#EFF6FF] border-b border-blue-200"
            bodyClassName="p-6"
        >
            {renderContent()}
        </Card>
    );
}