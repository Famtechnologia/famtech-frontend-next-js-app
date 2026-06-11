"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { getAdvice, createAdvice } from "@/lib/services/advisory";


import { useAuthStore } from "@/lib/store/authStore";
import FormSkeleton from "../skeleton/smart-advisory/Generate";

export const GenerateAdvice = ({
  location,
  setShowFarmingType,
}: {
  location: { state: string; country: string };
  setShowFarmingType: (show: boolean) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ type: string; produce: string; level: string }>();

  const {user} = useAuthStore()

  const [loading, setLoading] = useState(false);
 const [isLoading, setIsLoading] = useState<boolean>(true);
  const onSubmit = async (data: {
    type: string;
    produce: string;
    level: string;
  }) => {
    setLoading(true);

    try {
      if (!data.produce || !data.type || !data.level) {
        toast.error("Please select a farm type, produce and level");
        return;
      }

      const context = {
        ...(location && {
          state: location.state,
          country: location.country,
        }),
        type: data.type,
        produce: data.produce,
      };

      const advice = await getAdvice(
        `Generate a detailed roadmap for ${data.type} farming of ${data.produce} for a user with ${data.level} proficiency. The output should be a JSON object with a "title" and a "body". The "body" should be an array of objects, where each object represents a week and has a "week" number and a "tasks" array. Each object in the "tasks" array should have a "day" and a "instruction". The instruction for each day should be a long, detailed explanation of the task for better understanding. For example, instead of "Water the plants", it should be a more detailed explanation of how to water the plants, why it\'s important, and what to look for. IMPORTANT: Respond with ONLY the JSON object, and no other text, formatting, or explanations.
        The response must be a valid JSON object only. 
        Do NOT wrap the JSON in quotes or strings. 
        Do NOT add escape characters like \n or \". 
        Do NOT use markdown or backticks. 
        Return plain JSON, not a string.
        `,
        context
      );

      const userId = user?.id || "";

      await createAdvice(
        data?.type,
        data?.produce,
        data?.level,
        userId,
        JSON.stringify(advice) // Stringify the advice object
      );
    
      toast.success("Your advice is ready!");
      setShowFarmingType(false);
    } catch (err: unknown) {
      console.error("Advice failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Advice Generation Failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // ⏳ 1.5 seconds (you can adjust this)
  
      return () => clearTimeout(timer);
    }, [])

    if (isLoading) {
      return <FormSkeleton />;
    } 

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 transition-all duration-300 space-y-5"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
          Welcome to Smart Advisory
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Let's help you manage your farm operations - from seed to harvest.
        </p>
      </div>
      
      <div>
        <label htmlFor="type" className="block text-slate-700 font-semibold text-xs mb-1">
          Choose Farm Type
        </label>
        <select
          id="type"
          {...register("type", { required: "Crop Type is required" })}
          className="w-full p-3 mt-1.5 border border-slate-200 rounded-xl text-slate-750 text-xs bg-white focus:outline-none focus:ring-4 focus:ring-green-100/50 focus:border-green-600 transition-all shadow-sm"
        >
          <option value="" hidden>
            Select Crop Type
          </option>
          {["Crop farming", "livestock farming", "Mixed (both)"]?.map(
            (type: string) => (
              <option key={type} value={type?.toLowerCase()}>
                {type}
              </option>
            )
          )}
        </select>
        {errors.type && (
          <p className="text-red-650 text-[11px] mt-1 font-semibold">{errors?.type?.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="produce" className="block text-slate-700 font-semibold text-xs mb-1">
          Farm Produce
        </label>
        <input
          id="produce"
          type="text"
          placeholder="e.g. Maize, Cassava, Cattle"
          {...register("produce", { required: "Produce is required" })}
          className="w-full p-3 mt-1.5 border border-slate-200 rounded-xl text-slate-750 text-xs focus:outline-none focus:ring-4 focus:ring-green-100/50 focus:border-green-600 transition-all shadow-sm"
        />
        {errors.produce && (
          <p className="text-red-650 text-[11px] mt-1 font-semibold">{errors?.produce?.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="level" className="block text-slate-700 font-semibold text-xs mb-1">
          Proficiency Level
        </label>
        <select
          id="level"
          {...register("level", { required: "Level is required" })}
          className="w-full p-3 mt-1.5 border border-slate-200 rounded-xl text-slate-750 text-xs bg-white focus:outline-none focus:ring-4 focus:ring-green-100/50 focus:border-green-600 transition-all shadow-sm"
        >
          <option value="" hidden>
            Select Level
          </option>
          {["Beginner", "Intermediate", "Professional"]?.map(
            (level: string) => (
              <option key={level} value={level?.toLowerCase()}>
                {level}
              </option>
            )
          )}
        </select>
        {errors.level && (
          <p className="text-red-650 text-[11px] mt-1 font-semibold">{errors?.level?.message}</p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-green-700 transition duration-150 disabled:bg-green-400 shadow-sm"
        >
          {loading ? "Generating Plan..." : "Generate Advice Plan"}
        </button>
      </div>
    </form>
  );
};