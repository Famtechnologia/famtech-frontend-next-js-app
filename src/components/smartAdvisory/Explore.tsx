"use client";
import React, { useState } from "react";
import { FarmingType } from "@/components/smartAdvisory/FarmingType";
import Advice from "./Advice";

export const Explore = ({
  location,
}: {
  location: { state: string; country: string };
}) => {
  const [showFarmingType, setShowFarmingType] = useState(false);

  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer">
      {showFarmingType ? (
        <FarmingType location={location} setShowFarmingType={setShowFarmingType} />
      ) : (
        <Advice setShowFarmingType={setShowFarmingType} />
      )}
    </div>
  );
};