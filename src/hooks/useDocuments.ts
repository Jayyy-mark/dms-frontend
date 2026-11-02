import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { Document, DocumentApiResponse, DocumentSearch } from "../interfaces/document";
import { ServerPaginationMeta } from "../components/common/ServerPaginationBar";

export interface DocumentStats {
    all: number;
    permanent: number;
    temporary: number;
    expired: number;
}

export interface DocumentListParams extends Partial<DocumentSearch> {
    limit: number;
    offset: number;
    tab?: string;
    search?: string;
    categories?: string;
    staff_ids?: string;
    doc_types?: string;
    statuses?: string;
    sort_by?: string;
    snapshot_id?: number;
}

export interface DocumentPaginatedResponse {
    documents: Document[];
    pagination: ServerPaginationMeta;
    stats: DocumentStats;
}

const buildQueryKey = (endpoint: string, params: Record<string, any>) => {
    const search = new URLSearchParams();
    Object.keys(params)
        .sort()
        .forEach((key) => {
            const value = params[key];
            if (value === undefined || value === null || value === "") return;
            search.append(key, String(value));
        });
    return `${endpoint}?${search.toString()}`;
};

export const useDocuments = () => {
    const { data, error, isLoading, mutate } = useSWR<DocumentApiResponse>(
        "document/all/",
        swrFetcher
    );

    return {
        documents: data?.documents || [],
        error,
        isLoading,
        mutate,
    };
};

export const usePaginatedDocuments = (params: DocumentListParams) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<DocumentPaginatedResponse>(
        buildQueryKey("document/list/", params),
        swrFetcher,
        { keepPreviousData: true }
    );

    return {
        documents: data?.documents || [],
        pagination: data?.pagination,
        stats: data?.stats,
        error,
        isLoading: isLoading && !data,
        isValidating,
        mutate,
    };
};

export const usePaginatedArchives = (params: DocumentListParams) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<DocumentPaginatedResponse>(
        buildQueryKey("document/archive/list/", params),
        swrFetcher,
        { keepPreviousData: true }
    );

    return {
        documents: data?.documents || [],
        pagination: data?.pagination,
        stats: data?.stats,
        error,
        isLoading: isLoading && !data,
        isValidating,
        mutate,
    };
};

export const usePaginatedRecycles = (params: DocumentListParams) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<DocumentPaginatedResponse>(
        buildQueryKey("document/recycle/list/", params),
        swrFetcher,
        { keepPreviousData: true }
    );

    return {
        documents: data?.documents || [],
        pagination: data?.pagination,
        stats: data?.stats,
        error,
        isLoading: isLoading && !data,
        isValidating,
        mutate,
    };
};
