import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { DashboardTrafficResponse } from "../api/dashboardApi";

export const useDashboardTraffic = () => {
    const { data, error, isLoading, mutate } = useSWR<DashboardTrafficResponse>(
        "dashboard/traffic/",
        swrFetcher
    );

    return {
        traffic: data?.traffic,
        error,
        isLoading,
        mutate,
    };
};
