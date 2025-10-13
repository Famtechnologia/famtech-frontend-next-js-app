import apiClient, { API_URL } from "../api/apiClient";
import axios from "axios";

// Base URLs for the new endpoints
const ADVISORY_URL = `${API_URL}/api/advisory`;

export const getAdvice = async (question: string, context: object) => {
  try {
    const response = await apiClient.post(`${ADVISORY_URL}`, { question, context});
    return response.data;
  } catch (error) {
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