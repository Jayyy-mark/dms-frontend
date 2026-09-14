import api from "../helpers/api";
import { AddRank, Rank } from "../interfaces/ranks";


export const rankApi = {
    async all():Promise<any>{
        const res = await api.get("rank/all/");
        console.log("Thi is rank data : ", res);
        return res.data; 
    },
    async create(data : AddRank):Promise<any>{
        const res = await api.post("rank/create/",{
            rank_name:data.rank_name,
        });

        console.log("this is result :", res);
        return res.data;
    },
    async update(data: Rank):Promise<any>{
        const res = await api.put(`rank/update/${data.id}/`,{
            id:data.id,
            rank_id:data.rank_id,
            rank_name:data.rank_name,
        });

        console.log("this is update : ",res);

        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`rank/delete/${id}/`);
        console.log("this is delete rank : ", res);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`rank/search/${id}/`);
        return res.data;
    }
}