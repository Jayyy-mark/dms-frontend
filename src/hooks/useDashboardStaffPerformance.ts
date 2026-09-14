import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { DashboardStaffPerformanceResponse } from "../api/dashboardApi";

export const useDashboardStaffPerformance = () => {
    const { data, error, isLoading, mutate } = useSWR<DashboardStaffPerformanceResponse>(
        "dashboard/staff-performance/",
        swrFetcher
    );

    return {
        performance: data?.performance,
        error,
        isLoading,
        mutate,
    };
};
