import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { LogApiResponse } from "../interfaces/log";

export const useLogs = () => {
    const { data, error, isLoading, mutate } = useSWR<LogApiResponse>(
        "log/all/",
        swrFetcher
    );

    return {
        logs: data?.logs || [],
        error,
        isLoading,
        mutate,
    };
};
