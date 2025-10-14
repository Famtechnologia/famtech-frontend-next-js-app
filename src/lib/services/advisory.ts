import apiClient from "../api/apiClient";
import axios from "axios";
import { API_URL } from "../../../config";
// Base URLs for the new endpoints
const ADVISORY_URL = `${API_URL}/api/advisory`;

export const getAdvice = async (question: string, context: object) => {
  try {
    const response = await apiClient.post(`${ADVISORY_URL}`, {
      question,
      context,
    });
    return response.data;
  } catch (error) {
    console.error("Error in getAdvice:", error);
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch advice";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching advice");
  }
};

export const createAdvice = async (
  type: string,
  produce: string,
  level: string,
  userId: string,
  advice: string
) => {
  try {
    const response = await apiClient.post(`${API_URL}/api/farm-advice`, {
      type,
      produce,
      level,
      userId,
      advice,
      location,
    });
    return response.data;
  } catch (error) {
    console.error("Error in getAdvice:", error);
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch advice";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching advice");
  }
};

export const getUserAdvice = async (id: string) => {
  try {
    const response = await apiClient.get(
      `${API_URL}/api/farm-advice/farmer/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in getAdvice:", error);
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch advice";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching advice");
  }
};

export const deleteAdvice = async (id: string) => {
  try {
    const response = await apiClient.delete(
      `${API_URL}/api/farm-advice/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in getAdvice:", error);
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch advice";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching advice");
  }
};