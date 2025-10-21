"use client";
import React from "react";

export default function FormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-base border border-gray-200 p-4 animate-pulse space-y-4">
      {/* Title */}
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>

      {/* Farm Type */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mt-4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>

      {/* Produce */}
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-10 bg-gray-200 rounded"></div>

      {/* Level */}
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-10 bg-gray-200 rounded"></div>

      {/* Button */}
      <div className="h-10 bg-gray-300 rounded w-32 ml-auto"></div>
    </div>
  );
}
