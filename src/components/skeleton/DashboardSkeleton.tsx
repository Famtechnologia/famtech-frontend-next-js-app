import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ========================================
        1. Left Sidebar Skeleton (Desktop/LG+)
        ========================================
        - Hidden on mobile (hidden)
        - Fixed and full height on LG screens (lg:fixed lg:block lg:w-24) 
      */}
      <div className="hidden lg:block lg:w-24 fixed inset-y-0 left-0 z-50 bg-white shadow-lg animate-pulse">
        
        {/* Logo/Brand Area */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
        
        {/* Navigation Menu */}
        <div className="mt-8 px-2 space-y-4">
          {/* Using icons only for narrow LG sidebar */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded w-10"></div> {/* small label placeholder */}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* ========================================
        2. Main Content Area 
        ========================================
        - Full width on mobile (no margin)
        - Margin applied only on LG screens (lg:ml-24) to offset the sidebar 
      */}
      <div className="lg:ml-24">
        
        {/* Top Header/Navigation Bar (Always visible) */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 animate-pulse">
          <div className="flex items-center justify-between">
            {/* Mobile/Small screen logo/title area */}
            <div className="lg:hidden h-8 bg-gray-200 rounded w-32"></div> 
            
            {/* Desktop title area */}
            <div className="hidden lg:block h-8 bg-gray-200 rounded w-48"></div> 

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          <div className="space-y-6 animate-pulse">
            
            {/* Welcome Header Skeleton (Responsive padding/sizing) */}
            <div className="mb-4 sm:mb-6">
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 p-4 sm:p-6 lg:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 sm:mb-4 flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-0">
                      <div className="rounded-full bg-white/40 p-1.5 sm:p-2 mr-0 xs:mr-3 self-start xs:self-auto w-8 h-8 sm:w-10 sm:h-10"></div>
                      <div className="rounded bg-white/40 h-6 w-24 self-start"></div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div className="h-6 sm:h-8 lg:h-10 bg-white/40 rounded w-3/4"></div>
                      <div className="h-4 sm:h-5 lg:h-6 bg-white/30 rounded w-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 border-t border-white/20 pt-3 sm:pt-4">
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 sm:h-5 sm:w-5 bg-white/30 rounded"></div>
                    <div className="h-4 sm:h-5 bg-white/30 rounded w-32"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-white/40"></div>
                    <div className="h-4 sm:h-5 bg-white/30 rounded w-24"></div>
                  </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  <div className="h-1.5 w-6 sm:h-2 sm:w-8 rounded-full bg-white/60"></div>
                  <div className="h-1.5 w-6 sm:h-2 sm:w-8 rounded-full bg-white/40"></div>
                  <div className="h-1.5 w-6 sm:h-2 sm:w-8 rounded-full bg-white/40"></div>
                </div>
              </div>
            </div>

            {/* Main Grid Skeleton - First Row (Weather, Net Worth, Quick Actions) 
                - Stacks on mobile (default grid-cols-1)
                - 3 columns on LG screens (lg:grid-cols-3) 
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weather Forecast Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="text-center space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              </div>

              {/* Net Worth Preview Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>

              {/* Quick Actions Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-28 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="px-3 py-2 bg-gray-50 rounded">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Grid Skeleton - Second Row (Task Overview and Crop Health)
                - Stacks on mobile (default grid-cols-1)
                - Left column spans 2 on LG screens (lg:col-span-2) 
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Task Overview Skeleton */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>

                  {/* Task Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0 mt-0.5"></div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded-full w-16 flex-shrink-0"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Crop Health Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>

                  {/* Crop Items */}
                  {[1, 2].map((item) => (
                    <div key={item} className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  ))}

                  {/* Environmental Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded w-12"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Overlay (This is fine as it is hidden by default) */}
      <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden hidden"></div>
    </div>
  );
};

export default DashboardSkeleton;