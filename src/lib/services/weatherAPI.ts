import apiClient, { API_URL } from "../api/croplivestock";

// Base URLs for the new endpoints
const WEATHER_URL = `${API_URL}/api/weather`;

export const getWeather = async (country: string, state: string) => {
  const response = await apiClient.get(
    `${WEATHER_URL}?country=${country}&state=${state}`
  );
  return response.data;
};