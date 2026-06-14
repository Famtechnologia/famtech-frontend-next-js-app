"use client";
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  Eye, 
  Cloudy, 
  CloudFog, 
  CloudDrizzle, 
  CloudLightning, 
  Loader2, 
  Thermometer, 
  Droplets, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { getWeather } from '@/lib/services/weatherAPI';
import { useAuth } from '@/lib/hooks/useAuth';
import { WeatherApiResponse } from '@/types/weather';

// Helper function to estimate UV Index
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

// Helper function to get weather icon
function getWeatherIcon(description: string, className = "w-10 h-10") {
    const desc = description.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) return <Sun className={`${className} text-amber-500 animate-pulse`} />;
    if (desc.includes("cloud")) return <Cloudy className={`${className} text-slate-400`} />;
    if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) return <CloudRain className={`${className} text-sky-400`} />;
    if (desc.includes("snow") || desc.includes("sleet")) return <CloudDrizzle className={`${className} text-sky-200`} />;
    if (desc.includes("thunder") || desc.includes("storm")) return <CloudLightning className={`${className} text-purple-600`} />;
    if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze")) return <CloudFog className={`${className} text-slate-300`} />;
    return <Sun className={`${className} text-amber-500`} />;
}

// Generate smart weather advisory for agriculture
const getFarmingAdvisory = (temp: number, windSpeed: number, humidity: number, description: string) => {
    const desc = description.toLowerCase();
    const tips = [];

    // Spraying advice
    if (windSpeed > 15) {
        tips.push({
            title: "Spraying Operations",
            desc: "Avoid spraying today. High winds may cause pesticide drift.",
            status: "warning",
        });
    } else {
        tips.push({
            title: "Spraying Operations",
            desc: "Ideal wind conditions for spraying fertilizers or pesticides.",
            status: "optimal",
        });
    }

    // Irrigation advice
    if (desc.includes("rain") || desc.includes("storm") || humidity > 80) {
        tips.push({
            title: "Irrigation Management",
            desc: "Pause irrigation. Natural soil moisture level is sufficient.",
            status: "info",
        });
    } else if (temp > 30) {
        tips.push({
            title: "Irrigation Management",
            desc: "High evaporation. Schedule deep watering in early morning.",
            status: "warning",
        });
    } else {
        tips.push({
            title: "Irrigation Management",
            desc: "Weather permits regular scheduled irrigation loops.",
            status: "optimal",
        });
    }

    // Harvesting suitability
    if (desc.includes("rain") || desc.includes("storm")) {
        tips.push({
            title: "Harvest & Tillage",
            desc: "Postpone harvesting. Wet soils increase soil compaction risk.",
            status: "warning",
        });
    } else {
        tips.push({
            title: "Harvest & Tillage",
            desc: "Optimal field conditions for harvesting and tillage.",
            status: "optimal",
        });
    }

    return tips;
};

// Dynamic theme configuration based on weather condition
const getCardTheme = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) {
        return {
            bg: "bg-gradient-to-br from-amber-50/30 via-sky-50/20 to-blue-50/30 border-amber-100 dark:from-[#1a1500] dark:via-[#0d1117] dark:to-[#0d1f36] dark:border-[#30363d]",
            headerBg: "bg-amber-100/20 border-amber-200/50 dark:bg-[#1c1500]/40 dark:border-[#30363d]",
            accentText: "text-amber-700 dark:text-amber-400"
        };
    }
    if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower") || desc.includes("thunder") || desc.includes("storm")) {
        return {
            bg: "bg-gradient-to-br from-slate-100/40 via-blue-50/20 to-slate-200/40 border-blue-100 dark:from-[#0d1117] dark:via-[#0d1f36] dark:to-[#0d1117] dark:border-[#30363d]",
            headerBg: "bg-blue-100/20 border-blue-200/50 dark:bg-[#0d1f36]/40 dark:border-[#30363d]",
            accentText: "text-blue-700 dark:text-blue-400"
        };
    }
    return {
        bg: "bg-gradient-to-br from-gray-50/40 via-slate-50/20 to-blue-50/40 border-slate-100 dark:from-[#161b22] dark:via-[#0d1117] dark:to-[#161b22] dark:border-[#30363d]",
        headerBg: "bg-slate-100/20 border-slate-200/50 dark:bg-[#1c2128]/40 dark:border-[#30363d]",
        accentText: "text-slate-700 dark:text-slate-300"
    };
};

export default function WeatherCard() {
    const [weatherInfo, setWeatherInfo] = useState<WeatherApiResponse | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [displayLocation, setDisplayLocation] = useState('N/A'); 
    const [activeTab, setActiveTab] = useState<'weather' | 'advisory'>('weather');
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            return;
        }

        const country = user.country || "nigeria";
        const state = user.state || 'lagos';
        
        const formattedState = state.charAt(0).toUpperCase() + state.slice(1);
        setDisplayLocation(formattedState);

        const getAsyncWeather = async () => {
            setIsLoading(true);
            try {
                const res = await getWeather(country, state);
                setWeatherInfo(res?.data);

                if (res?.data?.name && res.data.name.toLowerCase() !== state.toLowerCase()) {
                    setDisplayLocation(`${res.data.name}, ${formattedState}`);
                }
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                setWeatherInfo(undefined);
            } finally {
                setIsLoading(false);
            }
        };
        
        getAsyncWeather();

    }, [user]);

    const weatherCondition = weatherInfo?.weather?.[0]?.description || "N/A";
    const temp = Math.round(weatherInfo?.main?.temp || 0);
    const humidity = weatherInfo?.main?.humidity || 0;
    const windSpeed = (weatherInfo?.wind?.speed || 0) * 3.6; // convert m/s to km/h if needed, or use as is
    const feelsLike = Math.round(weatherInfo?.main?.feels_like || 0);
    const uvIndex = estimateUVIndex(weatherInfo) ?? "N/A";

    const cardTheme = getCardTheme(weatherCondition);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
                    <p className="text-gray-500 text-sm">Synchronizing weather parameters...</p>
                </div>
            );
        }

        if (!weatherInfo) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
                    <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-red-500 font-medium">Weather station offline.</p>
                    <p className="text-gray-500 text-xs mt-1">Could not load telemetry for {displayLocation}.</p>
                </div>
            );
        }

        if (activeTab === 'weather') {
            return (
                <div className="space-y-4">
                    {/* Main weather display */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 bg-white/60 dark:bg-[#1c2128] rounded-xl shadow-sm border border-white/80 dark:border-[#30363d]">
                                {getWeatherIcon(weatherCondition, "w-12 h-12")}
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                                    {temp}°C
                                </div>
                                <div className="text-sm font-semibold text-gray-700 dark:text-[#adbac7] capitalize">
                                    {weatherCondition}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-[#8b949e] mt-1 font-medium">
                                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-[#6e7681]" />
                                    {displayLocation} 
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] bg-white/80 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d] rounded-full px-2.5 py-1 text-gray-500 dark:text-[#8b949e] font-medium shadow-sm">
                            Realtime Data
                        </div>
                    </div>

                    {/* Weather details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-gray-100 dark:border-[#30363d]">
                        <div className="bg-white/50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] rounded-xl p-2.5 text-center transition-all hover:bg-white/80 dark:hover:bg-[#21262d]">
                            <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                            <div className="text-xs font-bold text-gray-800 dark:text-[#e6edf3]">{feelsLike}°C</div>
                            <div className="text-[10px] text-gray-500 dark:text-[#8b949e] font-medium">Feels Like</div>
                        </div>
                        <div className="bg-white/50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] rounded-xl p-2.5 text-center transition-all hover:bg-white/80 dark:hover:bg-[#21262d]">
                            <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                            <div className="text-xs font-bold text-gray-800 dark:text-[#e6edf3]">{humidity}%</div>
                            <div className="text-[10px] text-gray-500 dark:text-[#8b949e] font-medium">Humidity</div>
                        </div>
                        <div className="bg-white/50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] rounded-xl p-2.5 text-center transition-all hover:bg-white/80 dark:hover:bg-[#21262d]">
                            <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                            <div className="text-xs font-bold text-gray-800 dark:text-[#e6edf3]">{windSpeed.toFixed(1)} km/h</div>
                            <div className="text-[10px] text-gray-500 dark:text-[#8b949e] font-medium">Wind Speed</div>
                        </div>
                        <div className="bg-white/50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] rounded-xl p-2.5 text-center transition-all hover:bg-white/80 dark:hover:bg-[#21262d]">
                            <Eye className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                            <div className="text-xs font-bold text-gray-800 dark:text-[#e6edf3]">{uvIndex} / 10</div>
                            <div className="text-[10px] text-gray-500 dark:text-[#8b949e] font-medium">UV Index</div>
                        </div>
                    </div>
                </div>
            );
        }

        // Advisory Tab
        const advisories = getFarmingAdvisory(temp, windSpeed, humidity, weatherCondition);
        
        return (
            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                {advisories.map((adv, idx) => (
                    <div 
                        key={idx} 
                        className={`flex items-start p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                            adv.status === 'warning'
                                ? 'bg-amber-50/80 dark:bg-[#2a1f0a] border-amber-100 dark:border-[#3a2c0d] text-amber-900 dark:text-amber-300'
                                : adv.status === 'optimal'
                                ? 'bg-green-50/80 dark:bg-[#0d2a1a] border-green-100 dark:border-[#1a3a2a] text-green-900 dark:text-green-300'
                                : 'bg-blue-50/80 dark:bg-[#0d1f36] border-blue-100 dark:border-[#1a2f4a] text-blue-900 dark:text-blue-300'
                        }`}
                    >
                        {adv.status === 'warning' && <AlertTriangle className="w-4 h-4 mr-2 text-amber-600 shrink-0 mt-0.5" />}
                        {adv.status === 'optimal' && <CheckCircle2 className="w-4 h-4 mr-2 text-green-600 shrink-0 mt-0.5" />}
                        {adv.status === 'info' && <Info className="w-4 h-4 mr-2 text-blue-600 shrink-0 mt-0.5" />}
                        <div>
                            <strong className="block font-semibold mb-0.5">{adv.title}</strong>
                            <span className="opacity-90">{adv.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card
            title="Weather & Smart Advisory"
            className={`h-full transition-all duration-300 hover:shadow-md ${cardTheme.bg}`}
            headerClassName={`border-b ${cardTheme.headerBg}`}
            bodyClassName="p-3 sm:p-5 flex flex-col justify-between"
        >
            <div className="flex-1">
                {/* Custom Tab Selector */}
                {!isLoading && weatherInfo && (
                    <div className="flex bg-gray-100/80 dark:bg-[#21262d] p-0.75 rounded-lg mb-4 text-xs font-semibold">
                        <button
                          onClick={() => setActiveTab('weather')}
                          className={`flex-1 py-1.5 rounded-md text-center transition-all outline-none focus:ring-2 focus:ring-green-400/50 ${
                            activeTab === 'weather'
                              ? 'bg-white dark:bg-[#30363d] text-gray-950 dark:text-[#e6edf3] shadow-sm'
                              : 'text-gray-500 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]'
                          }`}
                        >
                            Live Weather
                        </button>
                        <button
                          onClick={() => setActiveTab('advisory')}
                          className={`flex-1 py-1.5 rounded-md text-center transition-all outline-none focus:ring-2 focus:ring-green-400/50 ${
                            activeTab === 'advisory'
                              ? 'bg-white dark:bg-[#30363d] text-gray-950 dark:text-[#e6edf3] shadow-sm'
                              : 'text-gray-500 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]'
                          }`}
                        >
                            Farming Advisory
                        </button>
                    </div>
                )}
                {renderContent()}
            </div>
        </Card>
    );
}
