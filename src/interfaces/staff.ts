import { Department } from "./department";
import { Rank } from "./ranks";
import { Role } from "./role";
import { Stype } from "./stype";

export interface Staff{
    id:number;
    staff_id:string;
    staff_name:string;
    staff_email:string;
    staff_ph_number:string;
    staff_address:string;
    staff_gender:string;

    department_id:string;
    role_id:string;
    rank_id:string;
    stype_id:string;

    department?:Department;
    role?:Role;
    rank?:Rank;   
    stype?:Stype;
}

export interface StaffSearch {
  staff_id: string;
  staff_name: string;
  staff_email: string;
  department_id: string;
  role_id: string;
  rank_id: string;
  stype_id: string;
}



export interface AddStaff{
    staff_name:string;
    staff_email:string;
    staff_phone:string;
    staff_address:string;
    staff_gender:string;

    department_id:string;
    role_id:string;
    rank_id:string;
    stype_id:string;
}