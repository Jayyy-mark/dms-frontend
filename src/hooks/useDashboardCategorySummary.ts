import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { DashboardCategorySummaryResponse } from "../api/dashboardApi";

export const useDashboardCategorySummary = (departmentName?: string) => {
    const query = departmentName && departmentName !== "အားလုံး" 
        ? `dashboard/category-summary/?department_name=${encodeURIComponent(departmentName)}`
        : "dashboard/category-summary/";

    const { data, error, isLoading, mutate } = useSWR<DashboardCategorySummaryResponse>(
        query,
        swrFetcher
    );

    return {
        summary: data?.category_summary,
        error,
        isLoading,
        mutate,
    };
};
