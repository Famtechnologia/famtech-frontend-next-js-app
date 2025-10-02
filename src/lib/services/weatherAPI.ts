import apiClient, { API_URL } from "../api/apiClient";
import axios from "axios";

// Base URLs for the new endpoints
const WEATHER_URL = `${API_URL}/api/weather/current`;

export const getWeather = async (country: string, state: string) => {
  try {
    const response = await apiClient.get(`${WEATHER_URL}/${country}/${state}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch weather data"; // Removed API_URL from here
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching weather data");
  }
};