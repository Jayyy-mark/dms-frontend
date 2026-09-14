import api from "../helpers/api";
import { AddDepartment, Department } from "../interfaces/department";


export const departmentApi = {
    async all(): Promise<any> {
        const res = await api.get("department/all/");
        return res.data;
    },
    async create(data: AddDepartment): Promise<any> {
        const res = await api.post("department/create/", {
            department_name: data.department_name,
            room_id: data.room_id,
        });
        return res.data;
    },
    async update(data: Department): Promise<any> {
        console.log("this is department data ; ", data);
        const res = await api.put(`department/update/${data.id}/`, {
            id: data.id,
            department_id: data.department_id,
            department_name: data.department_name,
            room_id: data.room_id,
        });
        return res.data;
    },
    async delete(id: number): Promise<any> {
        const res = await api.delete(`department/delete/${id}/`);
        return res.data;
    },
    async getById(id: string): Promise<any> {
        const res = await api.get(`department/search/${id}/`);
        return res.data;
    }
}