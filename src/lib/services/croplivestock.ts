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
    userId: string; // Added based on the provided response payload
    cropName: string;
    variety: string;
    location: string;
    plantingDate: string;
    expectedHarvestDate: string;
    currentGrowthStage: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
    area: { value: number; unit: string };
    seedQuantity: { value: number; unit: string };
    note: string;
    // 🚀 CORRECTION: Image is an array of objects from the backend
    cropImages: RecordImage[]; 
    _id: string; // The database ID
    id: string; // The API returned ID (UUID)
    createdAt: string;
    updatedAt: string;
    __v: number; // Mongoose version key
}

// --- Livestock Record Types ---
export interface LivestockRecord {
    userId: string; // Added based on the common structure
    specie: string;
    numberOfAnimal: number;
    ageGroup: string;
    acquisitionDate: string;
    breed: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
    feedSchedule?: string;
    // 🚀 CORRECTION: Image is an array of objects from the backend (assuming 'livestockImages')
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

// Interface for a response when adding images (The record property needs to align with the return type)
export interface ImageResponse extends ApiResponse {
    // The API is likely returning the updated record, not a union type.
    // If this service file is used for both, the API endpoint is likely split.
    // Assuming the specific endpoint returns the specific record type:
    record: CropRecord | LivestockRecord; 
}

// === UPDATE PAYLOADS (Data sent for a JSON PUT/UPDATE) ===

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

export interface UpdateLivestockPayload {
    specie: string;
    numberOfAnimal: number;
    ageGroup: string;
    acquisitionDate: string;
    breed: string;
    healthStatus: 'good' | 'excellent' | 'fair' | 'poor' | string;
    feedSchedule?: string;
    note?: string;
}

// --- Crop Record API Functions ---

// 📝 Note: Axios's `response.data` is implicitly `any` unless specified, 
// but by using `<CropRecord[]>` in `Promise<CropRecord[]>` we enforce the type.

export const getCropRecords = async (): Promise<CropRecord[]> => {
    const response = await apiClient.get(CROP_BASE_URL);
    return response.data;
};

export const createCropRecord = async (data: FormData): Promise<CropRecord> => {
    const response = await apiClient.post(CROP_BASE_URL, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
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

// --- Livestock Record API Functions ---

export const getLivestockRecords = async (): Promise<LivestockRecord[]> => {
    const response = await apiClient.get(LIVESTOCK_BASE_URL);
    return response.data;
};

export const createLivestockRecord = async (
    data: FormData
): Promise<LivestockRecord> => {
    const response = await apiClient.post(LIVESTOCK_BASE_URL, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

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