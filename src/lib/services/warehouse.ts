import apiClient, { API_URL } from "../api/farmoperation"; 
// Note: Ensure this import path matches your actual file structure (e.g., ../api/farmoperation or ../api/apiClient)

const API_BASE_URL = `/api/warehouse`; 
// Note: apiClient usually already has the base URL (http://localhost:5000) configured. 
// If so, we just need the endpoint path here.

// --- Interfaces for Warehouse Data ---

export interface Product {
    id:string;
    
    name: string;
    quantity: number;
    unit?: string;
    description?: string;
}

export interface Warehouse {
    id:string;

    name: string;
    location: string;
    capacity: number;
    products: Product[];
    manager: string; // This is the Manager's NAME (String), not just a User ID
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// 1. UPDATED: 'manager' is now REQUIRED because your backend validates it.
export type CreateWarehouseData = {
    name: string;
    manager: string; // Required string from the form input
    location: string;
    capacity: number;
    products: Product[];
};

// 2. UPDATED: Partial allows updating specific fields, including manager
export type UpdateWarehouseData = Partial<CreateWarehouseData>;

// --- API Functions ---

/**
 * 📝 POST /api/warehouse
 * Creates a new warehouse.
 */
export const createWarehouse = async (
    warehouseData: CreateWarehouseData
): Promise<Warehouse> => {
    const response = await apiClient.post(API_BASE_URL, warehouseData);
    return response.data;
};

/**
 * 📝 GET /api/warehouse
 * Gets all warehouses.
 */
export const getAllWarehouses = async (): Promise<Warehouse[]> => {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
};

/**
 * 📝 GET /api/warehouse/:id
 * Gets a single warehouse by ID.
 */
export const getWarehouseById = async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get(`${API_BASE_URL}/${id}`);
    return response.data;
};

/**
 * 📝 PUT /api/warehouse/:id
 * Updates a warehouse by ID.
 * ✅ CORRECT URL CONSTRUCTION: Appending /${id}
 */
export const updateWarehouse = async (
    id: string,
    warehouseData: UpdateWarehouseData
): Promise<Warehouse> => {
    const response = await apiClient.put(`${API_BASE_URL}/${id}`, warehouseData);
    return response.data;
};

/**
 * 📝 DELETE /api/warehouse/:id
 * Deletes a warehouse by ID.
 */
export const deleteWarehouse = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
    return response.data;
};