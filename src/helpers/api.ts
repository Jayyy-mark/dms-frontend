import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export const API_SERVER = import.meta.env.VITE_API_SERVER;

const api = axios.create({
    baseURL: `${API_SERVER}/api/`,
    withCredentials: true,
});

let refreshPromise: Promise<AxiosResponse> | null = null;
const inFlightMutations = new Map<string, Promise<AxiosResponse>>();

const getRequestPath = (url?: string) => {
    if (!url) return "";

    try {
        return new URL(url, `${API_SERVER}/api/`).pathname;
    } catch {
        return url;
    }
};

const runDeduplicatedMutation = <T = unknown>(
    method: string,
    url: string,
    executor: () => Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T>> => {
    const key = `${method.toUpperCase()}:${getRequestPath(url)}`;
    const existing = inFlightMutations.get(key) as Promise<AxiosResponse<T>> | undefined;
    if (existing) {
        return existing;
    }

    const promise = executor().finally(() => {
        inFlightMutations.delete(key);
    });
    inFlightMutations.set(key, promise as Promise<AxiosResponse>);
    return promise;
};

const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalPatch = api.patch.bind(api);
const originalDelete = api.delete.bind(api);

api.post = (<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
): Promise<R> =>
    runDeduplicatedMutation<T>("POST", url, () =>
        originalPost<T, AxiosResponse<T>, D>(url, data, config)
    ) as unknown as Promise<R>) as typeof api.post;

api.put = (<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
): Promise<R> =>
    runDeduplicatedMutation<T>("PUT", url, () =>
        originalPut<T, AxiosResponse<T>, D>(url, data, config)
    ) as unknown as Promise<R>) as typeof api.put;

api.patch = (<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
): Promise<R> =>
    runDeduplicatedMutation<T>("PATCH", url, () =>
        originalPatch<T, AxiosResponse<T>, D>(url, data, config)
    ) as unknown as Promise<R>) as typeof api.patch;

api.delete = (<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
): Promise<R> =>
    runDeduplicatedMutation<T>("DELETE", url, () =>
        originalDelete<T, AxiosResponse<T>, D>(url, config)
    ) as unknown as Promise<R>) as typeof api.delete;

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
