import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export const API_SERVER = import.meta.env.VITE_API_SERVER;

const api = axios.create({
    baseURL: `${API_SERVER}/api/`,
    withCredentials: true,
});

let refreshPromise: Promise<AxiosResponse> | null = null;

const getRequestPath = (url?: string) => {
    if (!url) return "";

    try {
        return new URL(url, `${API_SERVER}/api/`).pathname;
    } catch {
        return url;
    }
};

const isAuthEndpoint = (url?: string) => {
    const path = getRequestPath(url);

    return [
        "/api/auth/login/",
        "/api/auth/register/",
        "/api/auth/logout/",
        "/api/auth/token/refresh/",
    ].some((endpoint) => path.endsWith(endpoint));
};

const redirectToSignIn = () => {
    if (window.location.pathname !== "/signin") {
        window.location.replace("/signin");
    }
};

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError & { config?: AxiosRequestConfig & { _retry?: boolean } }) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthEndpoint(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                refreshPromise ??= axios.post(
                    `${API_SERVER}/api/auth/token/refresh/`,
                    {},
                    { withCredentials: true }
                ).finally(() => {
                    refreshPromise = null;
                });

                await refreshPromise;

                return api(originalRequest);
            } catch (err) {
                redirectToSignIn();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export type ApiResponse<T> = Promise<T>;

export const getApi = async <T>(url: string): ApiResponse<T> => {
    const response: AxiosResponse = await api.get(url);
    return response.data;
};

export const postApi = async <T, U>(url: string, body: U): ApiResponse<T> => {
    const response = await api.post<T>(url, body);
    return response.data;
};

export const deleteApi = async <T>(url: string): ApiResponse<T> => {
    const response = await api.delete<T>(url);
    return response.data;
};

export const fetchCurrentUser = async () => {
    const res = await getApi("auth/user/");
    return res;
};

export default api;
