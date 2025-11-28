import useSWR from "swr";
import { getReports } from "../services/report";
import { useAuthStore } from "@/lib/store/authStore";

// Reports fetcher
const reportsFetcher = async (key: string, params?: any) => {
  return await getReports(params);
};

// SWR for Reports
export const useReports = (params?: any) => {
  const userId = useAuthStore((s) => s.user?.id);
  const key = userId ? [`/reports`, userId, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    reportsFetcher(userId!, params)
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
};
