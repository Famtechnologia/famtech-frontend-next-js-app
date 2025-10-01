import apiClient, { API_URL } from "../api/croplivestock";

// Base URLs for the new endpoints
const CROP_BASE_URL = `${API_URL}/api/crop-record`;
const LIVESTOCK_BASE_URL = `${API_URL}/api/livestock-record`;

// --- NEW TYPE: Structure for an Image Object in the Response Array ---
export interface RecordImage {
    url: string;
    fileId: string;
    _id: string; // The database ID for the image entry
}

// --- Crop Record Types ---
export interface CropRecord {
    userId: string; 
    cropName: string;
    variety: string;
    location: string;
    plantingDate: Date;
    expectedHarvestDate: Date;
    currentGrowthStage: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
    area: { value: number; unit: string };
    seedQuantity: { value: number; unit: string };
    note: string;
    cropImages: RecordImage[]; 
    _id: string; 
    id: string; 
    createdAt: string;
    updatedAt: string;
    __v: number; 
}

// --- Livestock Record Types (MUST BE EXPORTED) ---
export interface LivestockRecord {
    userId: string; 
    specie: string;
    numberOfAnimal: number;
    ageGroup: string;
    acquisitionDate: Date;
    breed: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
    feedSchedule?: string;
    livestockImages: RecordImage[]; 
    note?: string; 
    _id: string; 
    id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Interfaces for API responses that include a message
export interface ApiResponse {
    message: string;
}

// Interface for a response when adding images
export interface ImageResponse extends ApiResponse {
    record: CropRecord | LivestockRecord; 
}

// === UPDATE PAYLOADS (MUST BE EXPORTED) ===

export interface UpdateCropPayload {
    cropName: string;
    variety: string;
    location: string;
    plantingDate: string;
    expectedHarvestDate: string;
    currentGrowthStage: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
    area: {
        value: number;
        unit: string;
    };
    seedQuantity: {
        value: number;
        unit: string;
    };
    note: string;
}

// 🚀 CORRECTION: HealthStatus should be the literal type, not 'string'
export interface UpdateLivestockPayload {
    specie: string;
    numberOfAnimal: number;
    ageGroup: string;
    acquisitionDate: string;
    breed: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor'; 
    feedSchedule?: string;
    note?: string;
}

// --- Crop Record API Functions ---

export const getCropRecords = async (id: string): Promise<CropRecord[]> => {
    const response = await apiClient.get(`${CROP_BASE_URL}/user/${id}`);
    return response.data;
};

export const createCropRecord = async (data: FormData): Promise<CropRecord> => {
    // Log FormData entries for debugging
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }
    const response = await apiClient.post(CROP_BASE_URL, data);
        return response.data;
};

export const getCropRecordById = async (id: string): Promise<CropRecord> => {
    const response = await apiClient.get(`${CROP_BASE_URL}/${id}`);
    return response.data;
};

export const updateCropRecord = async (
    id: string,
    data: FormData | UpdateCropPayload
): Promise<CropRecord> => {
    const response = await apiClient.put(`${CROP_BASE_URL}/${id}`, data);
    return response.data;
};

export const deleteCropRecord = async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${CROP_BASE_URL}/${id}`);
    return response.data;
};

export const addCropImages = async (
    id: string,
    data: FormData
): Promise<ImageResponse> => {
    const response = await apiClient.post(`${CROP_BASE_URL}/${id}/images`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const deleteCropImages = async (
    id: string,
    fileIds: string[]
): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${CROP_BASE_URL}/${id}/images`, {
        data: { fileIds },
    });
    return response.data;
};

// --- Livestock Record API Functions (ALL EXPORTED) ---

export const getLivestockRecords = async (id: string): Promise<LivestockRecord[]> => {
    const response = await apiClient.get(`${LIVESTOCK_BASE_URL}/user/${id}`);
    return response.data;
};

export const createLivestockRecord = async (
    data: FormData
): Promise<LivestockRecord> => {
    const response = await apiClient.post(LIVESTOCK_BASE_URL, data);
        return response.data;};

export const getLivestockRecordById = async (
    id: string
): Promise<LivestockRecord> => {
    const response = await apiClient.get(`${LIVESTOCK_BASE_URL}/${id}`);
    return response.data;
};

export const updateLivestockRecord = async (
    id: string,
    data: FormData | UpdateLivestockPayload
): Promise<LivestockRecord> => {
    const response = await apiClient.put(`${LIVESTOCK_BASE_URL}/${id}`, data);
    return response.data;
};

export const deleteLivestockRecord = async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${LIVESTOCK_BASE_URL}/${id}`);
    return response.data;
};

export const addLivestockImages = async (
    id: string,
    data: FormData
): Promise<ImageResponse> => {
    const response = await apiClient.post(
        `${LIVESTOCK_BASE_URL}/${id}/images`,
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};

export const deleteLivestockImages = async (
    id: string,
    fileIds: string[]
): Promise<ApiResponse> => {
    const response = await apiClient.delete(
        `${LIVESTOCK_BASE_URL}/${id}/images`,
        {
            data: { fileIds },
        }
    );
    return response.data;
};