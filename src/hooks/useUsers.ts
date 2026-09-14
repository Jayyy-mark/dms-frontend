import { swrFetcher } from "../helpers/swrFetcher"
import { UserApiResponse } from "../interfaces/user";
import useSWR from "swr";

export const useUsers = ()=>{
    const{ data, error, isLoading, mutate } = useSWR<UserApiResponse>('auth/users/', swrFetcher);
    return {
        data,
        error,
        isLoading,
        mutate,
    }
}