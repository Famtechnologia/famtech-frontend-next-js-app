import apiClient, { API_URL } from "../api/inventory";

// Import the new, refined types
import { UnifiedInventoryItem } from '@/types/inventory';
const INVENTORY_BASE_URL = `${API_URL}/api/inventory-management`;

export interface DeleteResponse {
    message: string;
}

/**
 * Fetches all inventory items from the API.
 */
export const getInventoryItems = async (id:string): Promise<UnifiedInventoryItem[]> => {
    const response = await apiClient.get(`${INVENTORY_BASE_URL}/user/${id}`);
    return response.data;
};

/**
 * Creates a new inventory item.
 * Omit ONLY server-generated fields: 'id', '_id', and 'timestamp'.
 * 'userId' is included in the payload type, and the interceptor ensures it's sent.
 */
export const createInventoryItem = async (
    item: Omit<UnifiedInventoryItem, 'id' | 'timestamp' | '_id'>
): Promise<UnifiedInventoryItem> => {
    const res = await apiClient.post(INVENTORY_BASE_URL, item);
    return res.data;
};


/**
 * Fetches a single inventory item by its ID.
 */
export const getInventoryItemById = async (id: string): Promise<UnifiedInventoryItem> => {
    const response = await apiClient.get(`${INVENTORY_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Updates an existing inventory item by its ID.
 * Omit ONLY server-generated fields: 'id', '_id', and 'timestamp'.
 */
export const updateInventoryItem = async (
    id: string, 
    inventoryData: Partial<Omit<UnifiedInventoryItem, 'id' | '_id' | 'timestamp'>>
): Promise<UnifiedInventoryItem> => {
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