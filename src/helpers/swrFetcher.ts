import api, {ApiResponse} from "./api";


export const swrFetcher = async <T>(url:string):ApiResponse<T>=>{
    const response = await api.get<T>(url);
    return response.data;
}
