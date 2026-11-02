import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { Staff } from "../interfaces/staff";
import { ServerPaginationMeta } from "../components/common/ServerPaginationBar";

export interface StaffStats {
    all: number;
    male: number;
    female: number;
    departments: number;
}

export interface StaffListParams {
    limit: number;
    offset: number;
    tab?: string;
    search?: string;
    snapshot_id?: number;
}

export interface StaffPaginatedResponse {
    staffs: Staff[];
    pagination: ServerPaginationMeta;
    stats: StaffStats;
}

const buildStaffListKey = (params: StaffListParams) => {
    const search = new URLSearchParams();
    (Object.keys(params) as (keyof StaffListParams)[])
        .sort()
        .forEach((key) => {
            const value = params[key];
            if (value === undefined || value === null || value === "") return;
            search.append(key, String(value));
        });
    return `staff/list/?${search.toString()}`;
};

export const usePaginatedStaffs = (params: StaffListParams) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<StaffPaginatedResponse>(
        buildStaffListKey(params),
        swrFetcher,
        { keepPreviousData: true }
    );

    return {
        staffs: data?.staffs || [],
        pagination: data?.pagination,
        stats: data?.stats,
        error,
        isLoading: isLoading && !data,
        isValidating,
        mutate,
    };
};

