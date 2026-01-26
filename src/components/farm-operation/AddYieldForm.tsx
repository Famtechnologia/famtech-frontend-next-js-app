"use client";
import React, { useState } from "react";

interface AddYieldFormProps {
  cropName: string;
  onSave: (yieldValue: number, unit: string) => void;
  onClose: () => void;
}

const AddYieldForm: React.FC<AddYieldFormProps> = ({ cropName, onSave, onClose }) => {
  const [yieldValue, setYieldValue] = useState("");
  const [unit, setUnit] = useState("kg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(yieldValue), unit);
    onClose();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Add Yield for {cropName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Yield Amount</label>
          <input
            type="number"
            min="0"
            value={yieldValue}
            onChange={(e) => setYieldValue(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter yield (e.g. 50)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-green-500 focus:border-green-500"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="tons">Tons</option>
            <option value="bags">Bags</option>
            <option value="litres">Litres</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddYieldForm;
