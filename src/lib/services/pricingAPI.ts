import apiClient from "../api/apiClient";

export interface CropPrice {
  crop: string;
  price: number;
  unit: string;
  region: string;
  change?: number;
  changePercent?: number;
  trend?: "bullish" | "bearish" | "stable";
  supply?: string;
  demand?: string;
  lastUpdated?: string;
}

export interface MarketDashboardResponse {
  success: boolean;
  data: {
    crops: CropPrice[];
    region: string;
    timestamp: string;
  };
}

export interface MarketSummary {
  success: boolean;
  data: {
    sentiment: "bullish" | "bearish" | "mixed";
    averagePrice: number;
    highVolatilityCrops: string[];
    totalCropsTracked: number;
    timestamp: string;
  };
}

export interface CropCategory {
  category: string;
  crops: string[];
}

export interface AvailableCropsResponse {
  success: boolean;
  data: CropCategory[];
}

export interface MarketAlert {
  crop: string;
  alertType: "price_increase" | "price_decrease";
  changePercent: number;
  currentPrice: number;
  previousPrice: number;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface MarketAlertsResponse {
  success: boolean;
  data: MarketAlert[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  region: string;
}

export interface CropPriceHistoryResponse {
  success: boolean;
  data: {
    crop: string;
    history: PriceHistoryPoint[];
    trend: "bullish" | "bearish" | "stable";
    changePercent: number;
  };
}

export interface SingleCropPriceResponse {
  success: boolean;
  data: CropPrice;
}

export const getMarketDashboard = async (
  crops: string[] = ["rice", "maize", "yam", "cassava", "beans", "tomato", "pepper", "onion"]
): Promise<MarketDashboardResponse> => {
  const res = await apiClient.get("/api/market/dashboard", {
    params: { crops: crops.join(",") },
  });
  return res.data;
};

export const getMarketSummary = async (): Promise<MarketSummary> => {
  const res = await apiClient.get("/api/market/summary");
  return res.data;
};

export const getAvailableCrops = async (): Promise<AvailableCropsResponse> => {
  const res = await apiClient.get("/api/market/crops");
  return res.data;
};

export const getMarketAlerts = async (threshold = 15): Promise<MarketAlertsResponse> => {
  const res = await apiClient.get("/api/market/alerts", {
    params: { threshold },
  });
  return res.data;
};

export const getCropPriceHistory = async (
  cropName: string,
  days = 30
): Promise<CropPriceHistoryResponse> => {
  const res = await apiClient.get(`/api/market/crop/${cropName}/history`, {
    params: { days },
  });
  return res.data;
};

export const getCropPrice = async (
  cropName: string,
  region?: string
): Promise<SingleCropPriceResponse> => {
  const url = region
    ? `/api/market/crop/${cropName}/price/${region}`
    : `/api/market/crop/${cropName}/price`;
  const res = await apiClient.get(url);
  return res.data;
};
