import React from 'react';
// Assuming these are imported from your type file
import { UnifiedInventoryItem, ToolData, EquipmentPartData } from '@/types/inventory'; 

// --- TYPE DEFINITIONS ---

// This type covers both the creation form data (no id) and the update form data (with id)
type InventoryFormData = Omit<UnifiedInventoryItem, 'id' | 'timestamp' | 'userId'> | UnifiedInventoryItem;

// Define props for the InputField helper
interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    // FIX APPLIED HERE: Replaced 'any' with a more specific union type
    value: string | number | null | undefined;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean;
}

// Helper component for a generic text/number/date input
const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', value, placeholder, onChange, required = false }) => {
    // If the value is a date, strip the timestamp part for the input field
    const displayValue = type === 'date' && typeof value === 'string' ? value.split('T')[0] : value ?? '';

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                value={displayValue}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                required={required}
                placeholder={placeholder}
            />
        </div>
    );
};


// --- 1. Fields common to Seeds, Feed, and Fertilizer (Consumables) ---
const ConsumableFields = ({ data, handleChange }: { 
    data: InventoryFormData, 
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void 
}) => {
    return (
        <>
            {/* Usage Rate (Seeds/Fertilizer/Feed) */}
            <InputField
                label="Usage Rate (Optional)"
                name="usageRate"
                type="text"
                value={data.usageRate}
                onChange={handleChange}
                placeholder="e.g., 10 kg/week or 5 L/acre"
            />

            {/* Expiry Date (Seeds/Fertilizer/Feed) */}
            <InputField
                label="Expiry Date"
                name="expireDate"
                type="date"
                value={data.expireDate}
                onChange={handleChange}
            />
        </>
    );
};

// --- 2. Fields specific to Tools ---
const ToolSpecificFields = ({ toolData, handleChange }: { 
    toolData: ToolData, 
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void 
}) => {
    return (
        <div className="border-t pt-4 mt-4 border-gray-200 space-y-3">
            <h3 className="text-md font-semibold mb-2">Tool Details</h3>
            
            {/* NOTE: Names use dot notation (e.g., toolData.toolType) for nested state handling in the parent component */}
            <InputField label="Tool Type" name="toolData.toolType" value={toolData.toolType} onChange={handleChange} placeholder="e.g., Handheld, Motorized"/>
            <InputField label="Brand" name="toolData.brand" value={toolData.brand} onChange={handleChange} />
            <InputField label="Model" name="toolData.model" value={toolData.model} onChange={handleChange} />
            <InputField label="Condition" name="toolData.condition" value={toolData.condition} onChange={handleChange} placeholder="e.g., Good, Fair, Needs Repair"/>
            
            {/* Date Fields */}
            <InputField label="Last Serviced Date" name="toolData.lastServiced" type="date" value={toolData.lastServiced} onChange={handleChange} />
            <InputField label="Warranty Expiry Date" name="toolData.warrantyExpiry" type="date" value={toolData.warrantyExpiry} onChange={handleChange} />
            
            {/* Price Field (text for currency input) */}
            <InputField 
                label="Purchase Price" 
                name="toolData.price" 
                type="text" 
                value={toolData.price} 
                onChange={handleChange} 
                placeholder="e.g., $150.00 or KSh 2,500" 
            />
        </div>
    );
};

// --- 3. Fields specific to Equipment Parts ---
const EquipmentPartSpecificFields = ({ equipmentPartData, handleChange }: { 
    equipmentPartData: EquipmentPartData, 
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void 
}) => {
    return (
        <div className="border-t pt-4 mt-4 border-gray-200 space-y-3">
            <h3 className="text-md font-semibold mb-2">Equipment Part Details</h3>
            
            {/* NOTE: Names use dot notation (e.g., equipmentPartData.partNumber) for nested state handling in the parent component */}
            <InputField label="Part Number" name="equipmentPartData.partNumber" value={equipmentPartData.partNumber} onChange={handleChange} placeholder="e.g., 7789-A" />
            <InputField label="Manufacturer" name="equipmentPartData.manufacturer" value={equipmentPartData.manufacturer} onChange={handleChange} />
            <InputField label="Condition" name="equipmentPartData.condition" value={equipmentPartData.condition} onChange={handleChange} placeholder="e.g., New, Used, Refurbished"/>
            
            {/* Price Field (text for currency input) */}
            <InputField 
                label="Unit Price" 
                name="equipmentPartData.price" 
                type="text" 
                value={equipmentPartData.price} 
                onChange={handleChange} 
                placeholder="e.g., $450.00 or KSh 9,000" 
            />
            
            {/* Date Field */}
            <InputField label="Warranty Expiry Date" name="equipmentPartData.warrantyExpiry" type="date" value={equipmentPartData.warrantyExpiry} onChange={handleChange} />
        </div>
    );
};

// --- Main Render Function ---

export const renderFormFields = (
    data: InventoryFormData,
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
) => {
    
    // Determine if the current category is a consumable that uses the common fields
    const isConsumable = ['seeds', 'feed', 'fertilizer'].includes(data.category);
    
    // Determine the field label for quantity based on category
    const quantityLabel = 
        data.category === 'seeds' ? 'Quantity (kg/units)' :
        data.category === 'feed' ? 'Quantity (Bags/Units)' :
        data.category === 'fertilizer' ? 'Quantity (Bags/Liters)' :
        'Quantity (Units)';

    return (
        <div className="space-y-4">
            {/* ---------------------------------- */}
            {/* --- 1. Common Fields for ALL Categories --- */}
            {/* ---------------------------------- */}

            <InputField label="Item Name" name="name" value={data.name} onChange={handleChange} required placeholder="e.g., High-Yield Maize, Shovel" />
            <InputField label={quantityLabel} name="quantity" type="number" value={data.quantity} onChange={handleChange} required placeholder="e.g., 250" />
            
            {/* REORDER LEVEL MOVED HERE to be a Common Field for ALL Categories */}
            <InputField
                label="Reorder Level"
                name="reorderLevel"
                type="number"
                value={data.reorderLevel}
                onChange={handleChange}
                placeholder="e.g., 50 (when to re-order)"
            />

            {/* ---------------------------------- */}
            {/* --- 2. Conditional Fields based on Category --- */}
            {/* ---------------------------------- */}

            {/* ** A. Consumable Fields (UsageRate, ExpireDate) ** */}
            {isConsumable && <ConsumableFields data={data} handleChange={handleChange} />}
            
            {/* ** B. Fertilizer Specific Fields (N-P-K and Type) ** */}
            {data.category === 'fertilizer' && (
                <>
                    <InputField label="Fertilizer Type" name="type" value={data.type} onChange={handleChange} placeholder="e.g., Liquid, Granular" />
                    <div className="grid grid-cols-3 gap-3">
                        {/* N-P-K inputs */}
                        {['n', 'p', 'k'].map(key => (
                            <InputField key={key} label={`${key.toUpperCase()} %`} name={key} type="number" value={data[key as 'n' | 'p' | 'k']} onChange={handleChange} placeholder="e.g., 10" />
                        ))}
                    </div>
                </>
            )}

            {/* ** C. Feed Type Select ** */}
            {data.category === 'feed' && (
                <InputField label="Feed Type" name="type" value={data.type} onChange={handleChange} placeholder="e.g., Concentrate, Hay" />
            )}

            {/* ** D. Tool Specific Nested Fields ** */}
            {data.category === 'tools' && data.toolData && (
                <ToolSpecificFields 
                    toolData={data.toolData} 
                    handleChange={handleChange} 
                />
            )}

            {/* ** E. Equipment Part Specific Nested Fields ** */}
            {data.category === 'equipment parts' && data.equipmentPartData && (
                <EquipmentPartSpecificFields 
                    equipmentPartData={data.equipmentPartData} 
                    handleChange={handleChange} 
                />
            )}
        </div>
    );
};

export default renderFormFields;