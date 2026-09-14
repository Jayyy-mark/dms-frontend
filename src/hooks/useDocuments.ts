import useSWR from "swr";
import { swrFetcher } from "../helpers/swrFetcher";
import { DocumentApiResponse } from "../interfaces/document";

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
