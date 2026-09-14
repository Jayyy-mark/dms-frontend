import { User } from "./user";

export interface Log{
    id:number;
    user_id:number;
    user:User;
    action:string;
    model_name:string;
    object_id:string;
    description:string;
    created_at:string;
}

export interface LogApiResponse {
    logs: Log[];
}