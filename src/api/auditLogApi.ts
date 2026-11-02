import api from "../helpers/api";
import { Log, LogFilterParams, LogPaginatedResponse, LogQueryParams, LogStats } from "../interfaces/log";

export const auditLogApi = {
    async all(params?: LogFilterParams): Promise<Log[]> {
        const res = await api.get("log/all/", { params });
        return res.data.logs;
    },
    async list(params: LogQueryParams): Promise<LogPaginatedResponse> {
        const res = await api.get("log/list/", { params });
        return res.data;
    },
    async stats(params?: Pick<LogFilterParams, "tz">): Promise<LogStats> {
        const res = await api.get("log/stats/", { params });
        return res.data.stats;
    },
    async exportPdf(params?: { date?: string; action?: string; role?: string; search?: string; tz?: string }): Promise<Blob> {
        const res = await api.get("log/export-pdf/", {
            params,
            responseType: "blob",
        });
        return res.data;
    },
};
