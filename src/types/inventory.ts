export interface ToolData {
    name: string;
    toolType?: string;
    brand?: string;
    model?: string;
    condition?: string;
    lastServiced?: Date;
    warrantyExpiry?: Date;
    price?: number; 
}

export interface EquipmentPartData {
    
    model?: string; 
    partNumber?: string;
    manufacturer?: string;
    warrantyExpiry?: string;
    price?: number;
    condition?: string;
}

export interface UnifiedInventoryItem {
    
    id: string;
    userId: string;
    category: 'seeds' | 'feed' | 'fertilizer' | 'tools' | 'equipment parts';
    name: string;
    quantity: number;
    reorderLevel: number;
    usageRate?: string;
    expireDate?: string; 
    
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