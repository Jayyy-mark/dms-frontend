import { Room } from "./room";

export interface Department{
    id:number;
    department_id:string;
    department_name:string;
    room_id:string;
    room?:Room;
}

export interface AddDepartment{
    department_name:string;
    room_id:string;
}