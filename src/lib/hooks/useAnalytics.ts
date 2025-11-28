import useSWR from "swr";
import { getAnalyticsHistory, getAnalyticsById } from "../services/analytics";
import { useAuth } from "@/lib/hooks/useAuth";

// Fetcher for history
const historyFetcher = async (key: string, params?: any) => {
  return await getAnalyticsHistory(params);
};

// SWR for Analytics History
export const useAnalyticsHistory = (params?: any) => {
  const { user } = useAuth();
  const farmId = user?.farmProfile;
  const key = farmId ? [`/analytics/history`, farmId, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    historyFetcher(farmId!, { ...params, farmId })
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
};

// SWR for Single Analytics Record
export const useAnalyticsById = (id?: string) => {
  const key = id ? [`/analytics/${id}`] : null;
  const { data, error, isLoading } = useSWR(key, () => getAnalyticsById(id!));
  return { data, error, isLoading };
};
