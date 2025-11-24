import apiClient from "../api/farmoperation"; 


const API_BASE_URL = `/api/warehouse`; 

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
    manager: string; 
    createdAt: string;
    updatedAt: string;
    __v: number;
}


export type CreateWarehouseData = {
    name: string;
    manager: string; 
    location: string;
    capacity: number;
    products: Product[];
};


export type UpdateWarehouseData = Partial<CreateWarehouseData>;

// --- API Functions ---


export const createWarehouse = async (
    warehouseData: CreateWarehouseData
): Promise<Warehouse> => {
    const response = await apiClient.post(API_BASE_URL, warehouseData);
    return response.data;
};


export const getAllWarehouses = async (userId: string): Promise<Warehouse[]> => {
    if (!userId) {
        throw new Error("User ID is required to fetch user-specific warehouses.");
    }
    
    // 🎯 Using the confirmed endpoint: /api/warehouse/manager/:id
    const response = await apiClient.get(`${API_BASE_URL}/manager/${userId}`); 
    return response.data;
};


export const getWarehouseById = async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get(`${API_BASE_URL}/${id}`);
    return response.data;
};


export const updateWarehouse = async (
    id: string,
    warehouseData: UpdateWarehouseData
): Promise<Warehouse> => {
    const response = await apiClient.put(`${API_BASE_URL}/${id}`, warehouseData);
    return response.data;
};


export const deleteWarehouse = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
    return response.data;
};