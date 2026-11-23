import api from "../helpers/api";

export const moduleApi = {
    async getModules(roleId?: number): Promise<any> {
        const url = roleId !== undefined ? `auth/modules/?role_id=${roleId}` : "auth/modules/";
        const res = await api.get(url);
        return res.data;
    },
    async getRoleModules(roleId: number): Promise<any> {
        const res = await api.get(`auth/modules/roles/${roleId}/`);
        return res.data;
    },
    async saveRoleModules(roleId: number, statuses: Record<string, boolean>): Promise<any> {
        const res = await api.put(`auth/modules/roles/${roleId}/`, { statuses });
        return res.data;
    },
    async toggleFeature(featureId: number, status: boolean, roleId?: number): Promise<any> {
        const payload: { status: boolean; role_id?: number } = { status };
        if (roleId !== undefined) payload.role_id = roleId;
        const res = await api.put(`auth/modules/features/${featureId}/`, payload);
        return res.data;
    },
    async bulkAction(
        action: "enable_all" | "disable_all" | "reset",
        roleId?: number
    ): Promise<any> {
        const payload: { action: string; role_id?: number } = { action };
        if (roleId !== undefined) payload.role_id = roleId;
        const res = await api.put("auth/modules/features/bulk/", payload);
        return res.data;
    },
};
