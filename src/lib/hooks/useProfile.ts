import { useAuthStore } from "@/lib/store/authStore";
import apiClient from "../api/apiClient";

import { useEffect, useCallback, useState } from "react";
import { getMe } from "../api/auth";

export const useProfile = () => {
  const { token } = useAuthStore();
  const [profile, setProfile] = useState<{
    id: string;
    uid: string;
    farmName: string;
    farmType: string;
    farmSize: number;
    farmSizeUnit: string;
    establishedYear: number;
    location: Location;
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
  } | null>(null);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await getMe(token);

      const response = await apiClient.get(
        `/api/get-profile/${userData?.data?._id}`
      );
      setProfile(response?.data?.data?.farmProfile);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    profile,
    setProfile,
  };
};
