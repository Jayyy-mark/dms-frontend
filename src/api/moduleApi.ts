import api from "../helpers/api";

export const moduleApi = {
    async getModules(): Promise<any> {
        const res = await api.get("auth/modules/");
        return res.data;
    },
    async toggleFeature(featureId: number, status: boolean): Promise<any> {
        const res = await api.put(`auth/modules/features/${featureId}/`, { status });
        return res.data;
    },
    async bulkAction(action: "enable_all" | "disable_all" | "reset"): Promise<any> {
        const res = await api.put("auth/modules/features/bulk/", { action });
        return res.data;
    },
};
