"use client";
import React, { useState } from "react";
import { Sprout, PawPrint, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdviceCardProps {
  farmType: string;
  produce: string;
  location: {
    state: string;
    country: string;
  };
  advice: string;
  id: string;
  onDelete: (id: string) => Promise<void>;
}

const AdviceCard: React.FC<AdviceCardProps> = ({
  farmType,
  produce,
  location,
  id,
  onDelete,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCrop = farmType?.toLowerCase()?.includes("crop");

  const handleViewAdvice = () => {
    setLoading(true);
    router.push(`/smart-advisory/${id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete advice:", error);
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-w-[250px] relative overflow-hidden flex flex-col justify-between border border-slate-100">
      {/* Top line indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isCrop ? "bg-green-600" : "bg-blue-600"
      }`} />
      
      {/* Inline Confirmation Overlay */}
      {isConfirming && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
          <div className="p-2 bg-red-50 rounded-xl text-red-500 mb-2">
            <Trash2 className="h-5 w-5 animate-bounce" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Delete Farming Plan?</h4>
          <p className="text-slate-500 text-xs mt-1 mb-4 leading-normal">This action will permanently remove this advisory plan.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 flex-1">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-850">Farming Plan</h2>
          <button
            onClick={() => setIsConfirming(true)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Farming Plan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className={`p-3 rounded-xl hidden md:block ${
            isCrop ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
          }`}>
            {isCrop ? (
              <Sprout className="w-6 h-6" />
            ) : (
              <PawPrint className="w-6 h-6" />
            )}
          </div>
          <div className="text-sm space-y-1 font-semibold text-slate-500">
            <p className="capitalize">
              Type: <span className="text-slate-800 font-bold ml-1">{farmType}</span>
            </p>
            <p className="capitalize">
              Produce: <span className="text-slate-800 font-bold ml-1">{produce}</span>
            </p>
            <p className="capitalize">
              Location:{" "}
              <span className="text-slate-700 ml-1">
                {location.state}, {location.country}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={handleViewAdvice}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-1.5 text-center py-2.5 px-4 rounded-xl text-sm font-bold transition duration-150 ${
            isCrop 
              ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" 
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          } ${
            loading ? "opacity-80 cursor-not-allowed" : ""
          }`}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {loading ? "Loading..." : "View Advice Plan"}
        </button>
      </div>
    </div>
  );
};

export default AdviceCard;
