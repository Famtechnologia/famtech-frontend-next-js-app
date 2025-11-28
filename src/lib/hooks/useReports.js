import useSWR from "swr";
import { getReports } from "../services/report";
import { useAuth } from "@/lib/hooks/useAuth";

// Reports fetcher
const reportsFetcher = async (key, params) => {
  return await getReports(params);
};

// SWR for Reports
export const useReports = (params) => {
  const { user } = useAuth();
  const farmId = user?.farmProfile;
  const key = farmId ? ["/reports", farmId, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    reportsFetcher(farmId, { ...params, farmId })
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
};
