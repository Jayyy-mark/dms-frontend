import api from "../helpers/api";
import { AddRole, Role } from "../interfaces/role";


export const roleApi = {
    async all():Promise<any>{
        const res = await api.get("role/all/");
        console.log("Thi is role data : ", res);
        return res.data; 
    },
    async create(data : AddRole):Promise<any>{
        const res = await api.post("role/create/",{
            role_name:data.role_name,
        });

        console.log("this is result :", res);
        return res.data;
    },
    async update(data: Role):Promise<any>{
        const res = await api.put(`role/update/${data.id}/`,{
            id:data.id,
            role_id:data.role_id,
            role_name:data.role_name,
        });

        console.log("this is update : ",res);

        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`role/delete/${id}/`);
        console.log("this is delete role : ", res);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`role/search/${id}/`);
        return res.data;
    }
}