"use client";
import React, { useState } from "react";
import { GenerateAdvice } from "@/components/smartAdvisory/GenerateAdvice";
import Advice from "./Advice";

export const Explore = ({
  location,
}: {
  location: { state: string; country: string };
}) => {
  const [showFarmingType, setShowFarmingType] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
      {showFarmingType ? (
        <GenerateAdvice location={location} setShowFarmingType={setShowFarmingType} />
      ) : (
        <Advice setShowFarmingType={setShowFarmingType} />
      )}
    </div>
  );
};