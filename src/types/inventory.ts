// 1. Define the specific data structures for Tools and Equipment Parts
// The 'price' is a string to accommodate the currency symbol (e.g., "$120.50").

export interface ToolData {
    toolType?: string;
    brand?: string;
    model?: string;
    condition?: string;
    lastServiced?: string;
    warrantyExpiry?: string;
    price?: string; 
}

export interface EquipmentPartData {
    // CORRECTED: 'model' is now a string, representing the equipment's model number/name, 
    // not a recursive EquipmentPartData object.
    model?: string; 
    partNumber?: string;
    manufacturer?: string;
    warrantyExpiry?: string;
    price?: string;
    condition?: string;
}

// 2. Define the main unified Inventory Item
// This structure correctly uses optional fields (?) for conditional data 
// (e.g., toolData only for category 'tools').
export interface UnifiedInventoryItem {
    // Common Fields
    id: string; // Essential for inventory tracking
    userId: string;
    category: 'seeds' | 'feed' | 'fertilizer' | 'tools' | 'equipment parts';
    name: string;
    quantity: number;

    // Fields that apply ONLY to 'seeds', 'fertilizer', 'feed'
    reorderLevel?: number;
    usageRate?: string;
    expireDate?: string; 
    
    // Specific Consumable Details (for 'feed' and 'fertilizer')
    type?: 'Concentrate' | 'Hay' | 'Silage' | 'Liquid' | 'Granular'; 
    n?: number; // Nitrogen percentage (for fertilizer)
    p?: number; // Phosphorus percentage (for fertilizer)
    k?: number; // Potassium percentage (for fertilizer)

    // Category-Specific Nested Data (Optional objects)
    toolData?: ToolData;
    equipmentPartData?: EquipmentPartData;

    // Other base fields
    timestamp?: string;
    // 'model' here can be a general model/variant name, separate from toolData.model
    model?: string; 
}