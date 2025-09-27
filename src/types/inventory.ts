// Base interface with common properties for all inventory items
export interface InventoryItemBase {
    id: string; 
    name: string;
    quantity: number;
    reorderLevel: number;
    timestamp?: string; 
    model?:string;
    userId?: string; 
}


export interface SeedItem extends InventoryItemBase {
    category: 'seeds';
    usageRate?: string;
    expireDate?: string;
}

export interface FeedItem extends InventoryItemBase {
    category: 'feed';
    type: 'Concentrate' | 'Hay' | 'Silage';
    expireDate?: string;
}

export interface FertilizerItem extends InventoryItemBase {
    category: 'fertilizer';
    type: 'Liquid' | 'Granular';
    n?: number;
    p?: number;
    k?: number;
    expireDate?: string;
}

export interface ToolItem extends InventoryItemBase {
    category: 'tools';
   
}

export interface EquipmentPartItem extends InventoryItemBase {
    category: 'equipment parts';
    
  
}

// A union type that represents all possible inventory items.
export type InventoryItem = SeedItem | FeedItem | FertilizerItem | ToolItem | EquipmentPartItem;