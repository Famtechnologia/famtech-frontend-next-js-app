"use client";
import React, {useState, useEffect} from "react"; // ADDED useCallback
import { getAdvice } from "@/lib/services/advisory";

// import { useAuthStore} from "@/lib/store/authStore";

import { CircleCheck, MoveRight } from "lucide-react";
import Link from "next/link";
// Assuming these are correctly imported

export const SmartCard = ({
  location,
  type,
  name,
  tip,
  record,
}) => {
  const [advice, setAdvice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const generateAdvice = async () => {

        const question = "I need a 4 word tip, Note go straight to the point for the tip don't add any unnecessary text, just give me the 4 word tip, no more, no less. Note only the tip."
    
        try {
          const res = await getAdvice(question, tip);
          setAdvice(res?.advice);
        } catch (error) {
          setError(error?.message);
        }
      };
      generateAdvice()
  }, [tip])

  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer">
      <div className="p-4">
        {/* Health Status Badge */}
        <div className={`flex items-center justify-between`}>
          <h3 className="font-semibold text-gray-800 text-xl md:text-2xl capitalize">
            {name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-green-700 capitalize`}
          >
            {type}
          </span>
        </div>

        <p className="text-gray-500 text-sm capitalize">
          {location?.state}, {location?.country}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600 font-semibold">Growth Stage</p>
            <span className="text-gray-600 font-semibold text-sm">
              {record}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full">
            {/* Progress Bar width based on the calculated percentage */}
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${record}%` }}
            ></div>
          </div>
        </div>

        {/* Actions (Stop propagation to prevent modal from opening on button click) */}
        <div className="mt-4 bg-gray-200 rounded-lg flex items-center p-3 text-sm font-semibold text-gray-800">
          <CircleCheck className="h-5 w-5 text-green-600" />
          <span>Tip: {advice}</span>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4">
        <Link
          href="/farm-operation?tab=records"
          className="text-green-700 hover:underline text-sm inline-flex gap-1 items-center"
        >
          View More
          <MoveRight size={16} />
        </Link>
      </div>
    </div>
  );
};
