export interface UserApi{
    id:number;
    user_id:string;
    username:string;
    email:string;
    role:string;
}



export interface User{
    id:number;
    user_id:string;
    username:string;
    email:string;
    role:string;
    is_active?:boolean;
    is_staff?:boolean;
    last_login?:string;
}

export interface AddUserForm{
    username:string;
    email:string;
    staff_id:string;
    password1:string;
    password2:string;
    role:string;
}

export interface EditUserForm{
    user_id:string;
    username:string;
    email:string;
    role:string;
}

export interface UserApiResponse{
    users:User[];
}

export interface UserApiByIdResponse{
    message?:string;
    user?:User;
}

export interface UserApiDeleteResponse{
    message : string;
}