import api from "../helpers/api";

export const userRoleApi = {
    async getRoles(): Promise<any> {
        const res = await api.get("auth/user-roles/");
        return res.data;
    },
    async createRole(name: string): Promise<any> {
        const res = await api.post("auth/user-roles/", { name });
        return res.data;
    },
    async deleteRole(id: number): Promise<any> {
        const res = await api.delete(`auth/user-roles/${id}/`);
        return res.data;
    },
    async getPermissions(roleId: number): Promise<any> {
        const res = await api.get(`auth/permissions/${roleId}/`);
        return res.data;
    },
    async savePermissions(roleId: number, permissions: Record<string, any>): Promise<any> {
        const res = await api.put(`auth/permissions/${roleId}/`, { permissions });
        return res.data;
    },
    async getMyPermissions(): Promise<any> {
        const res = await api.get("auth/permissions/my/");
        return res.data;
    },
};
