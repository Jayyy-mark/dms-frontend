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

// <!--==============================
//   SERVER SIDE PAGINATION
// ================================-->
export interface LogFilterParams {
    date?: string;
    action?: string;
    role?: string;
    search?: string;
    tz?: string;
}

export interface LogQueryParams extends LogFilterParams {
    limit: number;
    offset: number;
    snapshot_id?: number;
}

export interface LogPagination {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    remaining: number;
    remaining_pages: number;
    has_next: boolean;
    has_previous: boolean;
    snapshot_id: number;
}

export interface LogPaginatedResponse {
    logs: Log[];
    pagination: LogPagination;
}

// <!--==============================
//   STATS
// ================================-->
export interface LogStats {
    total: number;
    today: number;
    actions: Record<string, number>;
    roles: Record<string, number>;
    available_roles: string[];
}

export interface LogStatsApiResponse {
    stats: LogStats;
}
