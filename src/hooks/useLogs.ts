import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { LogApiResponse, LogPaginatedResponse, LogQueryParams, LogStatsApiResponse } from "../interfaces/log";

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

// Client timezone (e.g. "Asia/Yangon") so the backend can compute "today" correctly
export const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Builds a deterministic SWR key that contains EVERY query param
 * (page, limit, filters, snapshot). Each page / filter combination is cached
 * under its own key, so cached rows of one page can never leak into another.
 */
const buildLogListKey = (params: LogQueryParams) => {
    const search = new URLSearchParams();
    (Object.keys(params) as (keyof LogQueryParams)[])
        .sort()
        .forEach((key) => {
            const value = params[key];
            if (value === undefined || value === null || value === "") return;
            search.append(key, String(value));
        });
    return `log/list/?${search.toString()}`;
};

export const usePaginatedLogs = (params: LogQueryParams) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<LogPaginatedResponse>(
        buildLogListKey(params),
        swrFetcher,
        {
            // keep showing the current page while the next page is loading (no flicker)
            keepPreviousData: true,
        }
    );

    return {
        logs: data?.logs || [],
        pagination: data?.pagination,
        error,
        // true only for the very first load (nothing to display yet)
        isLoading: isLoading && !data,
        isValidating,
        mutate,
    };
};

export const useLogStats = () => {
    const { data, error, isLoading, mutate } = useSWR<LogStatsApiResponse>(
        `log/stats/?tz=${encodeURIComponent(clientTimeZone)}`,
        swrFetcher
    );

    return {
        stats: data?.stats,
        error,
        isLoading,
        mutate,
    };
};
