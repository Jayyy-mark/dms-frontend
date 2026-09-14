import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { DashboardAnalyticsResponse } from "../api/dashboardApi";

export const useDashboardAnalytics = () => {
    const { data, error, isLoading, mutate } = useSWR<DashboardAnalyticsResponse>(
        "dashboard/analytics/",
        swrFetcher
    );

    return {
        analytics: data?.analytics,
        error,
        isLoading,
        mutate,
    };
};
