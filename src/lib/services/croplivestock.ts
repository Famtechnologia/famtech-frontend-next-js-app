import apiClient, { API_URL } from "../api/croplivestock";

// Base URLs for the new endpoints
const CROP_BASE_URL = `${API_URL}/api/crop-record`;
const LIVESTOCK_BASE_URL = `${API_URL}/api/livestock-record`;

// Type definitions for crop and livestock records based on your API documentation.
export interface CropRecord {
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
  image: string | File; // For a single image upload
  id: string; // The ID returned by the API
}

export interface LivestockRecord {
  specie: string;
  numberOfAnimal: number;
  ageGroup: string;
  acquisitionDate: string;
  breed: string;
  healthStatus: 'good' | 'excellent' | 'fair' | 'poor';
  feedSchedule?: string;
  image?: string | File; // Can be a URL string or a File object
  note?: string; // For a single image upload
  id: string;
}

// Interfaces for API responses that include a message
export interface ApiResponse {
  message: string;
}

// Interface for a response when adding images
export interface ImageResponse extends ApiResponse {
  record: CropRecord | LivestockRecord;
}

// === NEW TYPES FOR UPDATE PAYLOADS ===
// These types represent the JSON object you'll send for updates without a file.
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

// 🚀 CORRECTED: The missing UpdateLivestockPayload interface
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
export const getCropRecords = async (): Promise<CropRecord[]> => {
  const response = await apiClient.get(CROP_BASE_URL);
  return response.data;
};

// This function needs to handle `multipart/form-data` for the image file.
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

// 🚀 CORRECTED: Now accepts both FormData and the JSON payload type
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

// 🚀 CORRECTED: Now accepts both FormData and the JSON payload type
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