import api from "../helpers/api";
import { helper } from "../helpers/utils";
import { AddStaff, Staff, StaffSearch } from "../interfaces/staff";


export const staffApi = {
    async all():Promise<any>{
        const res = await api.get("staff/all/");
        return res.data; 
    },
    async create(data : AddStaff):Promise<any>{
        const res = await api.post("staff/create/",{
            staff_name:data.staff_name,
            staff_email:data.staff_email,
            staff_ph_number:data.staff_phone,
            staff_gender:data.staff_gender,
            staff_address:data.staff_address,

            department_id:data.department_id,
            role_id:data.role_id,
            rank_id:data.rank_id,
            stype_id:data.stype_id,
        });
        return res.data;
    },
    async update(data: Staff):Promise<any>{
        const res = await api.put(`staff/update/${data.id}/`,{
            id:data.id,
            staff_id:data.staff_id,
            staff_name:data.staff_name,
            staff_email:data.staff_email,
            staff_ph_number:data.staff_ph_number,
            staff_gender:data.staff_gender,
            staff_address:data.staff_address,

            department_id:data.department_id,
            role_id:data.role_id,
            rank_id:data.rank_id,
            stype_id:data.stype_id,
        });
        return res.data;
    },
    async delete(id:number):Promise<any>{
        const res = await api.delete(`staff/delete/${id}/`);
        return res.data;
    },
    async getById(id : string):Promise<any>{
        const res = await api.get(`staff/search/${id}/`);
        return res.data;
    },
    async search(data:StaffSearch):Promise<Staff[]>{
        const cleanData = helper.cleanSearchParams(data);
        const res = await api.get("/staff/search/",{
            params:cleanData
        });

        return res.data.staffs;
    }
}