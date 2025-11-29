"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { getAdvice, createAdvice } from "@/lib/services/advisory";


import { useAuthStore } from "@/lib/store/authStore";
import FormSkeleton from "../layout/skeleton/smart-advisory/Generate";

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
      className={`relative bg-white rounded-lg shadow-base border border-gray-200 overflow-hidden cursor-pointer p-4 transition-all duration-300`}
    >
      <div className="mb-4">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-2 mt-8 ">
          Welcome to Smart Advisory
        </h2>
        <p className="text-gray-500 text-sm md:text-base">
          Lets help you to manage our farm - from seed to harvest
        </p>
      </div>
      
      <div className="mb-4 mt-4">
        <label htmlFor="type" className="text-gray-700 mb-2 font-medium text-base md:text-lg">
          Choose Farm Type
        </label>
        {/* type */}
        <select
          id="type"
          {...register("type", { required: "Crop Type is required" })} // Fix: 'type' is a valid property in SignupFormInputs
          className="w-full p-3 mt-1 border-gray-400 border rounded-xl text-gray-500 text-sm"
        >
          <option value="" hidden >
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
          <p className="text-red-600 text-sm">{errors?.type?.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="produce" className="text-gray-700 mb-2 font-medium text-base md:text-lg">
          Farm Produce
        </label>
        {/* produce */}
        <input
          id="produce"
          type="produce"
          placeholder="Produce"
          {...register("produce", { required: "Produce is required" })}
          className="w-full p-3 border-gray-400 border rounded-xl"
        />
        {errors.produce && (
          <p className="text-red-600 text-sm">{errors?.produce?.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="level" className="text-gray-700 mb-2 font-medium text-base md:text-lg">
          Level
        </label>
        {/* level */}
        <select
          id="level"
          {...register("level", { required: "Level is required" })}
          className="w-full p-3 border-gray-400 border rounded-xl  text-gray-500 text-sm"
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
          <p className="text-red-600 text-sm">{errors?.level?.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-auto bg-green-600 text-white text-sm md:text-base py-3 px-4 rounded-xl hover:bg-green-700 transition duration-150 disabled:bg-green-400 float-right"
      >
        {loading ? "Generating..." : "Generate Advice"}
      </button>
    </form>
  );
};