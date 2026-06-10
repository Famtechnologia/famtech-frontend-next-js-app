"use client";
import React, { useState, useEffect } from "react";
import { getAllWarehouses, updateWarehouse, Warehouse, Product } from "@/lib/services/warehouse";
import { useProfile } from "@/lib/hooks/useProfile";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AddYieldFormProps {
  cropName: string;
  onSave?: (yieldValue: number, unit: string) => void;
  onClose: () => void;
}

const AddYieldForm: React.FC<AddYieldFormProps> = ({ cropName, onSave, onClose }) => {
  const { profile } = useProfile();
  const [yieldValue, setYieldValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    
    setLoadingWarehouses(true);
    getAllWarehouses(profile.id)
      .then((data) => {
        const whs = data || [];
        setWarehouses(whs);
        if (whs.length > 0) {
          setSelectedWarehouseId(whs[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch warehouses:", err);
      })
      .finally(() => {
        setLoadingWarehouses(false);
      });
  }, [profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWarehouseId) {
      toast.error("Please select a warehouse first.");
      return;
    }
    
    const amount = Number(yieldValue);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid yield amount greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId);
      if (!selectedWh) {
        toast.error("Selected warehouse not found.");
        setSaving(false);
        return;
      }

      // Check if product already exists in warehouse (case-insensitive)
      const existingProductIdx = selectedWh.products.findIndex(
        (p) => p.name.trim().toLowerCase() === cropName.trim().toLowerCase()
      );

      let updatedProducts = [...(selectedWh.products || [])];

      if (existingProductIdx > -1) {
        const existingProd = updatedProducts[existingProductIdx];
        updatedProducts[existingProductIdx] = {
          ...existingProd,
          quantity: Number(existingProd.quantity || 0) + amount,
        };
      } else {
        updatedProducts.push({
          id: Math.random().toString(36).substring(2, 9),
          name: cropName.toLowerCase(),
          quantity: amount,
          unit: unit,
          description: `Harvested crop yield from crop records`,
        });
      }

      // Call API to update the warehouse products list
      await updateWarehouse(selectedWarehouseId, {
        products: updatedProducts,
      });

      toast.success(`Added ${amount} ${unit} of ${cropName} to warehouse "${selectedWh.name}"!`);
      
      if (onSave) {
        onSave(amount, unit);
      }
      onClose();
    } catch (err) {
      console.error("Failed to update warehouse with crop yield:", err);
      toast.error("Failed to save crop yield to warehouse.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">
          Add Yield for <span className="capitalize text-green-700 font-extrabold">"{cropName}"</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Deduct seeds, harvest maturity crops, and log yields directly to your storage warehouses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Yield Amount</label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={yieldValue}
            onChange={(e) => setYieldValue(e.target.value)}
            required
            disabled={saving}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800"
            placeholder="Enter yield (e.g. 150)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={saving}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="tons">Tons</option>
            <option value="bags">Bags</option>
            <option value="litres">Litres</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Store in Warehouse</label>
          {loadingWarehouses ? (
            <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" />
              <span>Loading warehouses...</span>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              No warehouses found. Please create a warehouse in the Inventory/Warehouse tab first.
            </div>
          ) : (
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              disabled={saving}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.location})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || warehouses.length === 0}
            className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:bg-gray-400"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Yield...</span>
              </>
            ) : (
              "Save Yield"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddYieldForm;
