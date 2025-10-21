"use client";
import React, { useState } from "react";
import Card from "../ui/Card";
import { ClipboardList, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdviceCardProps {
  farmType: string;
  produce: string;
  location: {
    state: string;
    country: string;
  };
  advice:string;
  id: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({
  farmType,
  produce,
  location,
  id,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleViewAdvice = () => {
    setLoading(true);
    // 👇 add a tiny delay so the loader shows briefly
    setTimeout(() => {
      router.push(`/smart-advisory/${id}`);
    }, 1000);
  };

  return (
    <Card
      title="Farming Plan"
      className="hover:border-green-500 transition-all duration-300"
    >
      <div className="flex flex-col items-start md:p-4">
        <div className="flex items-center mb-4">
          <ClipboardList className="w-8 h-8 text-green-600 mr-4 hidden md:flex " />
          <div>
            <p className="text-gray-600 capitalize">
              Type: <span className="font-semibold">{farmType}</span>
            </p>
            <p className="text-gray-600 capitalize">
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

        <button
          onClick={handleViewAdvice}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 text-center bg-green-600 text-white py-2 px-4 rounded-md transition duration-150 mt-4 ${
            loading ? "opacity-80 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          {loading ? "Loading..." : "View Advice"}
        </button>
      </div>
    </Card>
  );
};

export default AdviceCard;
