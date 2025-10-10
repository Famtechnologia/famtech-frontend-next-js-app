"use client";
import React from "react"; // ADDED useCallback

// import { useAuthStore} from "@/lib/store/authStore";

import { CircleCheck, MoveRight } from "lucide-react";
import Link from "next/link";
// Assuming these are correctly imported

export const SmartCard = ({
  location,
}: {
  location: { state: string; country: string };
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer">
      <div className="p-4">
        {/* Health Status Badge */}
        <div className={`flex items-center justify-between`}>
          <h3 className="font-semibold text-gray-800 text-medium">
            Maize Crop
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-green-700 capitalize`}
          >
            Good
          </span>
        </div>

        <p className="text-gray-500 text-sm">
          {location?.state}, {location?.country}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600 font-semibold">Health</p>
            <span className="text-gray-600 font-semibold text-sm">10%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full">
            {/* Progress Bar width based on the calculated percentage */}
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `10%` }}
            ></div>
          </div>
        </div>

        {/* Actions (Stop propagation to prevent modal from opening on button click) */}
        <div className="mt-4 bg-gray-200 rounded-lg flex items-center p-3 text-sm font-semibold text-gray-800">
          <CircleCheck className="h-5 w-5 text-green-600" />
          <span>Tip: Restock Tomorrow</span>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4">
        <Link href="#" className="text-green-700 hover:underline text-sm inline-flex gap-1 items-center">
          View More
          <MoveRight size={16} />
        </Link>
      </div>
    </div>
  );
};
