import useSWR from "swr";
import { getDashboardData, getInsights, compareFarms } from "../services/dashboard";

export const useDashboardData = (farmId?: string, p0?: { refreshInterval: number; }) => {
  const key = farmId ? [`/dashboard/${farmId}`] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () => getDashboardData(farmId!));
  return { data, isLoading, error, mutate };
};

export const useInsights = (farmId?: string, params?: any) => {
  const key = farmId ? [`/insights/${farmId}`, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    getInsights(farmId!, params)
  );
  return { data, isLoading, error, mutate };
};

export const useFarmComparison = (params?: any) => {
  const key = params ? [`/compare`, params] : null;
  const { data, error, isLoading } = useSWR(key, () => compareFarms(params));
  return { data, isLoading, error };
};
