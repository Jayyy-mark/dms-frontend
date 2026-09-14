import { Building } from "./building";

export interface Room{
    id:number,
    room_id:string;
    room_no:string;
    room_name:string;
    building_id:string;
    building?:Building;
}

export interface AddRoom{
    room_no:string;
    room_name:string;
    building_id:string;
}