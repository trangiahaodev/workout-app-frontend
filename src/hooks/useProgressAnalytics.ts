import { useCallback, useEffect, useState } from "react";
import { ProgressAnalyticsData } from "../types";
import { fetchPlanAnalytics } from "../services/analyticsService";

export function useProgressAnalytics(planId?: string, profileId?: string) {
  const [data, setData] = useState<ProgressAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const result = await fetchPlanAnalytics(planId, profileId);
        setData(result);
      } catch (err: any) {
        setError(err?.message || "Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [planId, profileId],
  );

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const refetch = useCallback(async () => {
    await loadAnalytics(true);
  }, [loadAnalytics]);

  return {
    data,
    loading,
    isRefreshing,
    error,
    refetch,
  };
}
