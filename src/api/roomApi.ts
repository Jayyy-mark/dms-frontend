import api from "../helpers/api";
import { AddRoom, Room } from "../interfaces/room";


export const roomApi = {
    async all():Promise<any>{
        const res = await api.get("room/all/");
        console.log("Thi is room data : ", res);
        return res.data; 
    },
    async create(data : AddRoom):Promise<any>{
        const res = await api.post("room/create/",{
            room_no:data.room_no,
            room_name:data.room_name,
            building_id:data.building_id,
        });

        console.log("this is result :", res);
        return res.data;
    },
    async update(data: Room):Promise<any>{
        const res = await api.put(`room/update/${data.id}/`,{
            id:data.id,
            room_id:data.room_id,
            room_no:data.room_no,
            room_name:data.room_name,
            building_id:data.building_id,
        });

        console.log("this is update : ",res);

        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`room/delete/${id}/`);
        console.log("this is delete room : ", res);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`room/search/${id}/`);
        return res.data;
    }
}