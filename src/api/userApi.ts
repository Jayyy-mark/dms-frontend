//<!--============================
// USER API HANDLER
//==============================-->

import api, { deleteApi, getApi, postApi } from "../helpers/api"
import { AddUserForm, UserApiByIdResponse, UserApiDeleteResponse } from "../interfaces/user";


export const userApi = {
    async all():Promise<any>{
        const res = await getApi("auth/users/");
        return res;
    },
    async create(form : AddUserForm) : Promise<any>{
        const response = await postApi("auth/register/",{
            username:form.username,
            email:form.email,
            password1:form.password1,
            password2:form.password2,
            role:form.role,
            staff_id:form.staff_id,
        });
        console.log("this is user create response : ",response);
        return response;
    },
    async getById(id:string):Promise<any>{
        const response = await getApi<UserApiByIdResponse>(`auth/users/${id}/`);
        return response.user;
    },
    async delete(id : number): Promise<string>{
        const response = await deleteApi<UserApiDeleteResponse>(`auth/users/${id}/`);
        return response.message;
    },
    async update(id: number, data: {username: string, email: string, role: string}): Promise<any>{
        const response = await api.put(`auth/users/${id}/`, data);
        return response.data;
    }
}