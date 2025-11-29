import useSWR from "swr";
import { getDashboardData, getInsights, compareFarms } from "../services/dashboard";

export const useDashboardData = (farmId, options) => {
  const key = farmId ? [`/dashboard/${farmId}`] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () => getDashboardData(farmId), options);
  return { data, isLoading, error, mutate };
};

export const useInsights = (farmId, params) => {
  const key = farmId ? [`/insights/${farmId}`, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () => getInsights(farmId, params));
  return { data, isLoading, error, mutate };
};

export const useFarmComparison = (params) => {
  const key = params ? [`/compare`, params] : null;
  const { data, error, isLoading } = useSWR(key, () => compareFarms(params));
  return { data, isLoading, error };
};
