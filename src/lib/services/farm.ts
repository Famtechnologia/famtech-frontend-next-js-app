import apiClient from "../api/apiClient";

export interface ProfileType {
  userId: string;
  id: string;
  uid: string;
  farmName: string;
  farmType: string;
  farmSize: number;
  farmSizeUnit: string;
  establishedYear: number;
  location: {
    country: string;
    state: string;
    city: string;
    address: string;
    coordinates: string;
  };
  currency: string;
  timezone: string;
  primaryCrops: string[];
  farmingMethods: string[];
  seasonalPattern: string;
  language: string;
  owner: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getFarmProfile = async (id: string): Promise<ProfileType> => {
  const response = await apiClient.get(`/api/get-farm-profile/${id}`);
  return response?.data?.data?.farmProfile;
};
