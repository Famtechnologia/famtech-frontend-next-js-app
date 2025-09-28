// 1. Define the specific data structures for Tools and Equipment Parts
// This helps keep the main interface cleaner and allows for potential re-use.

export interface ToolData {
    toolType?: string;
    brand?: string;
    model?: string;
    condition?: string;
    lastServiced?: string;
    warrantyExpiry?: string;
    price?: string; // Assuming price should be a number
}

export interface EquipmentPartData {
    partNumber?: string;
    manufacturer?: string;
    warrantyExpiry?: string;
    price?: string; // Assuming price should be a number
    condition?: string;
}

// 2. Define the main unified Inventory Item
// This structure reflects your new JSON layout.
export interface UnifiedInventoryItem {
    // Common Fields
    id: string; // Keep 'id' from the base interface, it's essential for any item.
    userId: string;
    category: 'seeds' | 'feed' | 'fertilizer' | 'tools' | 'equipment parts';
    name: string;
    quantity: number;

    // Fields that apply ONLY to 'seeds', 'fertilizer', 'feed' (made optional in the main interface)
    reorderLevel?: number; // Optional across all, but generally used by the consumables
    usageRate?: string; // Optional, consumable data
    expireDate?: string; // Optional, consumable data
    
    // Specific Consumable Details (Added for completeness based on old types)
    type?: 'Concentrate' | 'Hay' | 'Silage' | 'Liquid' | 'Granular'; // Used by 'feed' and 'fertilizer'
    n?: number; // Used by 'fertilizer'
    p?: number; // Used by 'fertilizer'
    k?: number; // Used by 'fertilizer'

    // Category-Specific Nested Data (Optional objects that contain their own fields)
    toolData?: ToolData;
    equipmentPartData?: EquipmentPartData;

    // Other base fields you had (made optional)
    timestamp?: string;
    model?: string; // If 'model' is separate from 'toolData.model', keep it. If not, rely on toolData.
}