import api from "../helpers/api";
import { AddDtype, Dtype } from "../interfaces/dtype";


export const dtypeApi = {
    async all():Promise<any>{
        const res = await api.get("dtype/all/");
        console.log("Thi is dtype data : ", res);
        return res.data; 
    },
    async create(data : AddDtype):Promise<any>{
        const res = await api.post("dtype/create/",{
            dtype_name:data.dtype_name,
        });

        console.log("this is result :", res);
        return res.data;
    },
    async update(data: Dtype):Promise<any>{
        const res = await api.put(`dtype/update/${data.id}/`,{
            id:data.id,
            dtype_id:data.dtype_id,
            dtype_name:data.dtype_name,
        });

        console.log("this is update : ",res);

        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`dtype/delete/${id}/`);
        console.log("this is delete dtype : ", res);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`dtype/search/${id}/`);
        return res.data;
    }
}