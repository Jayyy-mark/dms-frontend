import api from "../helpers/api";
import { AddCategory, Category } from "../interfaces/category";


export const categoryApi = {
    async all(): Promise<any> {
        const res = await api.get("category/all/");
        return res.data;
    },
    async create(data: AddCategory): Promise<any> {
        const res = await api.post("category/create/", {
            category_name: data.category_name,
            parent_id: data.parent_id === "" ? null : data.parent_id,
        });
        return res.data;
    },
    async update(data: Category): Promise<any> {

        const res = await api.put(`category/update/${data.id}/`, {
            id: data.id,
            category_id: data.category_id,
            category_name: data.category_name,
            parent_id: data.parent_id ? Number(data.parent_id) : null,
        });
        return res.data;
    },
    async delete(id: number): Promise<any> {
        const res = await api.delete(`category/delete/${id}/`);
        return res.data;
    },
    async getById(id: string): Promise<any> {
        const res = await api.get(`category/search/${id}/`);
        return res.data;
    }
}