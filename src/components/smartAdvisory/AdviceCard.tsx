"use client";
import React from "react";
import Card from "../ui/Card"; // ✅ assuming you already have this component
import { ClipboardList } from "lucide-react";
import Link from "next/link";

interface AdviceCardProps {
  farmType: string;
  produce: string;
  location: {
    state: string;
    country: string;
  };
  advice: string;
  id: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({
  farmType,
  produce,
  location,
 // advice,
  id,
}) => {
  return (
    <Card
      title="Farming Plan"
      className="hover:border-green-500 transition-all duration-300"
    >
      <div className="flex flex-col items-start  md:p-4">
        <div className="flex items-center mb-4">
          <ClipboardList className="w-8 h-8 text-green-600 mr-4 hidden md:flex " />
          <div>
            <p className="text-gray-600">
              Type: <span className="font-semibold">{farmType}</span>
            </p>
            <p className="text-gray-600">
              Produce: <span className="font-semibold">{produce}</span>
            </p>
            <p className="text-gray-600">
              Location:{" "}
              <span className="font-semibold capitalize">
                {location.state}, {location.country}
              </span>
            </p>
          </div>
        </div>

        <Link
          href={`/smart-advisory/${id}`}
          className="w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150 mt-4"
        >
          View Advice
        </Link>
      </div>
    </Card>
  );
};

export default AdviceCard;
