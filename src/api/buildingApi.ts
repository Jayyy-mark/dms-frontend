import api from "../helpers/api";
import { AddBuilding, Building } from "../interfaces/building";


export const buildingApi = {
    async all():Promise<any>{
        const res = await api.get("building/all/");
        console.log("Thi is building data : ", res);
        return res.data; 
    },
    async create(data : AddBuilding):Promise<any>{
        const res = await api.post("building/create/",{
            building_name:data.building_name,
        });

        console.log("this is result :", res);
        return res.data;
    },
    async update(data: Building):Promise<any>{
        const res = await api.put(`building/update/${data.id}/`,{
            id:data.id,
            building_id:data.building_id,
            building_name:data.building_name,
        });

        console.log("this is update : ",res);

        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`building/delete/${id}/`);
        console.log("this is delete building : ", res);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`building/search/${id}/`);
        return res.data;
    }
}