import useSWR from "swr"
import { swrFetcher } from "../helpers/swrFetcher"

export const useCurrentStaff = (id: any) => {
    const { data, error, isLoading, mutate } =
        useSWR<any>(
            id ? `staff/search/${id}/` : null,
            swrFetcher
        );

    return {
        staff: data?.staff,
        error,
        isLoading,
        mutate,
    };
};