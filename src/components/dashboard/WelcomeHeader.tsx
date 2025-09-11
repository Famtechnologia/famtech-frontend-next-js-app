'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from "@/lib/store/farmStore";


const sliderData = [
  {
    id: 1,
    welcomeText: "Welcome back",
    subtitle: "Here's what's happening on your farm today.",
    badge: "Dashboard",
    icon: (
      <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    status: "All Systems Online",
    gradient: "from-green-400 via-green-500 to-green-700"
  },
  {
    id: 2,
    welcomeText: "Great progress",
    subtitle: "Your crops are growing healthy and strong this season.",
    badge: "Growth Status",
    icon: (
      <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    status: "95% Healthy Growth",
    gradient: "from-emerald-400 via-green-500 to-teal-600"
  },
  {
    id: 3,
    welcomeText: "Market update",
    subtitle: "Crop prices are favorable for your harvest this week.",
    badge: "Price Alert",
    icon: (
      <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    status: "Prices Up 12%",
    gradient: "from-green-500 via-emerald-500 to-green-600"
  }
];

 export default function WelcomeHeader (){
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Define the expected profile type
  type Profile = {
    farmName?: string;
    // add other properties as needed
  };

  // Tell TypeScript the shape of profile
  const { profile, loading, error } = useProfileStore() as {
    profile: Profile;
    loading: boolean;
    error: unknown;
  };


  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const currentData = sliderData[currentSlide];

  return (
    <div className="mb-4 sm:mb-6">
      <div className={`relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br ${currentData.gradient} p-4 sm:p-6 lg:p-8 text-white shadow-xl transition-all duration-500 ease-in-out`}>
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>
        </div>
             
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 sm:mb-4 flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-0">
                <div className="rounded-full bg-white/20 p-1.5 sm:p-2 mr-0 xs:mr-3 self-start xs:self-auto">
                  {currentData.icon}
                </div>
                <div className="rounded bg-white/20 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold uppercase tracking-wide self-start">
                  {currentData.badge}
                </div>
              </div>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
                <span className="text-yellow-300">{currentData.welcomeText}</span>, 
                <br className="sm:hidden" />
                <span className="text-white"> {profile?.farmName ?? 'Farmer'}</span>!
              </h2>
              <p className="text-green-50 text-sm sm:text-base lg:text-lg opacity-90 leading-relaxed">
                {currentData.subtitle}
              </p>
            </div>
          </div>
          
          {/* Additional Info Row */}
          <div className="mt-4 sm:mt-6 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 border-t border-white/20 pt-3 sm:pt-4">
            <div className="flex items-center text-green-100">
              <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="flex items-center text-green-100">
              <div className="mr-2 h-2 w-2 rounded-full bg-yellow-300 flex-shrink-0"></div>
              <span className="text-sm sm:text-base">{currentData.status}</span>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {sliderData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 w-6 sm:h-2 sm:w-8 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-yellow-300' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="absolute top-3 sm:top-4 right-4 sm:right-16">
          <div className={`h-1 w-8 sm:w-12 bg-white/30 rounded-full overflow-hidden ${isAutoPlaying ? 'block' : 'hidden'}`}>
            <div 
              className="h-full bg-yellow-300 rounded-full transition-all duration-[5000ms] ease-linear"
              style={{ 
                width: isAutoPlaying ? '100%' : '0%',
                animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
              }}
            />
          </div>
        </div>

        {/* Floating Elements - Hidden on mobile for cleaner look */}
        <div className="absolute -right-6 top-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5 hidden sm:block"></div>
        <div className="absolute -left-4 -bottom-4 h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-white/5 hidden sm:block"></div>
        <div className="absolute right-8 -bottom-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 hidden sm:block"></div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @media (min-width: 480px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:items-center {
            align-items: center;
          }
          .xs\\:justify-between {
            justify-content: space-between;
          }
          .xs\\:gap-0 {
            gap: 0;
          }
          .xs\\:gap-4 {
            gap: 1rem;
          }
          .xs\\:mr-3 {
            margin-right: 0.75rem;
          }
          .xs\\:self-auto {
            align-self: auto;
          }
        }
      `}</style>
    </div>
  );
};