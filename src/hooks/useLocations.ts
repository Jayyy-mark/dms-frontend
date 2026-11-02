import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { Location, LocationSearch } from "../interfaces/location";
import { ServerPaginationMeta } from "../components/common/ServerPaginationBar";

export interface LocationFolderStat {
    name: string;
    count: number;
}

export interface LocationStats {
    total: number;
    folders: LocationFolderStat[];
}

export interface LocationListParams extends Partial<LocationSearch> {
    limit: number;
    offset: number;
    search?: string;
    folder?: string;
    snapshot_id?: number;
}

export interface LocationPaginatedResponse {
    locations: Location[];
    pagination: ServerPaginationMeta;
    stats: LocationStats;
}

const buildLocationListKey = (params: Record<string, any>) => {
    const search = new URLSearchParams();
    Object.keys(params)
        .sort()
        .forEach((key) => {
            const value = params[key];
            if (value === undefined || value === null || value === "") return;
            search.append(key, String(value));
        });
    return `location/list/?${search.toString()}`;
};

export const usePaginatedLocations = (params: LocationListParams) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<LocationPaginatedResponse>(
        buildLocationListKey(params),
        swrFetcher,
        { keepPreviousData: true }
    );

    return {
        locations: data?.locations || [],
        pagination: data?.pagination,
        stats: data?.stats,
        error,
        isLoading: isLoading && !data,
        isValidating,
        mutate,
    };
};

