// app/not-found.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Home, 
  ArrowLeft, 
  Search,
  MapPin,
  Compass,
  RefreshCw,
  Leaf
} from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() { // Renamed export for clarity, but 'Page' is fine if it matches your file
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("404 Page mounted");
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className={`max-w-4xl w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Main 404 Section */}
        <div className="text-center mb-12">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 bg-clip-text text-transparent leading-none">
              404
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 left-1/4 transform -translate-x-1/2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="absolute -top-2 right-1/4 transform translate-x-1/2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops! Field Not Found
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Looks like you&apos;ve wandered off the beaten path! The page you&apos;re looking for 
              seems to have grown legs and walked away to greener pastures.
            </p>
          </div>

          {/* Illustration Area */}
          <div className="relative mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 mx-auto max-w-md">
              <div className="relative">
                {/* Farm Scene Illustration */}
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center mb-4">
                  <Compass className="w-16 h-16 text-green-700 animate-spin" style={{
                    animation: 'spin 8s linear infinite'
                  }} />
                </div>
                
                {/* Ground */}
                <div className="h-4 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full mx-8"></div>
                
                {/* Scattered Elements */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-300 rounded-full opacity-60"></div>
                <div className="absolute top-8 -right-4 w-4 h-4 bg-blue-300 rounded-full opacity-60"></div>
                <div className="absolute -bottom-1 left-4 w-3 h-3 bg-green-400 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleGoBack}
            className="group flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleGoHome}
            className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Dashboard Home</span>
          </button>

          <button
            onClick={handleRefresh}
            className="group flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-green-600" />
              </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Need Help Finding Your Way?
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Do&apos;t worry! Here are some popular destinations to get you back on track.
            </p>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/far-operation"
                >
                {/* FIX: Changed <div> to <a> and moved className to <a> */}
                <a className="group p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors duration-200 text-left">
                  <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Farms</h4>
                  <p className="text-sm text-gray-600">Manage your farms</p>
                </a>
              </Link>

              <Link
                href="/crops"
                >
                {/* FIX: Changed <div> to <a> and moved className to <a> */}
                <a className="group p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors duration-200 text-left">
                  <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Crops</h4>
                  <p className="text-sm text-gray-600">Track crop health</p>
                </a>
              </Link>

              <Link
                href="/analytics"
                >
                {/* FIX: Changed <div> to <a> and moved className to <a> */}
                <a className="group p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors duration-200 text-left">
                  <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                    <Search className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
                  <p className="text-sm text-gray-600">View reports</p>
                </a>
              </Link>

              <Link
                href="/settings"
                >
                {/* FIX: Changed <div> to <a> and moved className to <a> */}
                <a className="group p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors duration-200 text-left">
                  <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                    <Home className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Settings</h4>
                  <p className="text-sm text-gray-600">Account settings</p>
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Still having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}