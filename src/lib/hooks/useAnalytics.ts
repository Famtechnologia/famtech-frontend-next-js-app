import useSWR from "swr";
import { getAnalyticsHistory, getAnalyticsById } from "../services/analytics";
import { useAuthStore } from "@/lib/store/authStore";

// Fetcher for history
const historyFetcher = async (key: string, params?: any) => {
  return await getAnalyticsHistory(params);
};

// SWR for Analytics History
export const useAnalyticsHistory = (params?: any) => {
  const userId = useAuthStore((s) => s.user?.id);
  const key = userId ? [`/analytics/history`, userId, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    historyFetcher(userId!, params)
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
