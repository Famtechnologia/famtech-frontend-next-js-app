import apiClient, { API_URL } from "../api/apiClient";
import axios from "axios";

const WEATHER_URL = `${API_URL}/api/weather/current`;

export const getWeather = async (country: string, state: string) => {
  try {
    const endpoint = `${WEATHER_URL}/${country}/${state}`;

    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch weather data";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching weather data");
  }
};

export const getWeatherByLga = async (lga?: string) => {
  try {
    const endpoint = `${WEATHER_URL}/${lga}`;

    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch weather data";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred while fetching weather data");
  }
};
