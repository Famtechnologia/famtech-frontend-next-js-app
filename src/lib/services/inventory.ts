import apiClient, { API_URL } from "../api/inventory";

// Import the new, refined types
import {UnifiedInventoryItem } from '@/types/inventory';
const INVENTORY_BASE_URL = `${API_URL}/api/inventory-management`;

export interface DeleteResponse {
    message: string;
}

/**
 * Fetches all inventory items from the API.
 * The return type is now the specific `InventoryItem` union type.
 */
export const getInventoryItems = async (): Promise<UnifiedInventoryItem []> => {
    const response = await apiClient.get(INVENTORY_BASE_URL);
    return response.data;
};

/**
 * Creates a new inventory item.
 * The input data is now a more precise `Omit` type.
 */
// service
export const createInventoryItem = async (
  item: Omit<UnifiedInventoryItem , 'id' | 'timestamp' | '_id'>
): Promise<UnifiedInventoryItem > => {
  const res = await apiClient.post(INVENTORY_BASE_URL, item);
  return res.data;
};


/**
 * Fetches a single inventory item by its ID.
 * The return type is the specific `InventoryItem` union type.
 */
export const getInventoryItemById = async (id: string): Promise<UnifiedInventoryItem > => {
    const response = await apiClient.get(`${INVENTORY_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Updates an existing inventory item by its ID.
 * Uses a Partial of the precise `InventoryItem` type.
 */
export const updateInventoryItem = async (id: string, inventoryData: Partial<Omit<UnifiedInventoryItem , '_id' | 'timestamp'>>): Promise<InventoryItem> => {
    const response = await apiClient.put(`${INVENTORY_BASE_URL}/${id}`, inventoryData);
    return response.data;
};

/**
 * Deletes an inventory item by its ID.
 */
export const deleteInventoryItem = async (id: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete(`${INVENTORY_BASE_URL}/${id}`);
    return response.data;
};