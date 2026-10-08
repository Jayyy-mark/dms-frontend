import api from "../helpers/api";
import { Log } from "../interfaces/log";

export const auditLogApi = {
    async all(): Promise<Log[]> {
        const res = await api.get("log/all/");
        return res.data.logs;
    },
    async exportPdf(params?: { date?: string; action?: string; role?: string; search?: string }): Promise<Blob> {
        const res = await api.get("log/export-pdf/", {
            params,
            responseType: "blob",
        });
        return res.data;
    },
};