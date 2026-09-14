import api from "../helpers/api";
import { AddStype, Stype } from "../interfaces/stype";


export const stypeApi = {
    async all():Promise<any>{
        const res = await api.get("stype/all/");
        console.log("Thi is stype data : ", res);
        return res.data; 
    },
    async create(data : AddStype):Promise<any>{
        const res = await api.post("stype/create/",{
            stype_name:data.stype_name,
        });

        console.log("this is result :", res);
        return res.data;
    },
    async update(data: Stype):Promise<any>{
        const res = await api.put(`stype/update/${data.id}/`,{
            id:data.id,
            stype_id:data.stype_id,
            stype_name:data.stype_name,
        });

        console.log("this is update : ",res);

        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`stype/delete/${id}/`);
        console.log("this is delete stype : ", res);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`stype/search/${id}/`);
        return res.data;
    }
}