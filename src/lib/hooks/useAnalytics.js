import useSWR from "swr";
import { getAnalyticsHistory, getAnalyticsById } from "../services/analytics";
import { useAuth } from "@/lib/hooks/useAuth";

const historyFetcher = async (key, params) => {
  return await getAnalyticsHistory(params);
};

export const useAnalyticsHistory = (params) => {
  const { user } = useAuth();
  const farmId = user?.farmProfile;
  const key = farmId ? ["/analytics/history", farmId, params] : null;

  const { data, error, isLoading, mutate } = useSWR(key, () =>
    historyFetcher(farmId, { ...params, farmId })
  );

  return { data, isLoading, error, mutate };
};

export const useAnalyticsById = (id) => {
  const key = id ? [`/analytics/${id}`] : null;
  const { data, error, isLoading } = useSWR(key, () => getAnalyticsById(id));
  return { data, error, isLoading };
};
