import api from "../helpers/api";

export interface DashboardAnalytics {
    users: number;
    staffs: number;
    documents: number;
    departments: number;
    categories: number;
    buildings: number;
    permanent_documents: number;
    temporary_documents: number;
    recent_uploads: number;
    expired_archives: number;
}

export interface DashboardAnalyticsResponse {
    analytics: DashboardAnalytics;
}

export interface DepartmentTrafficItem {
    name: string;
    value: number;
    percent: number;
    color: string;
}

export interface FileTypeTrafficItem {
    type: string;
    count: number;
    percent: number;
    color: string;
}

export interface PeriodTrafficData {
    departments: DepartmentTrafficItem[];
    fileTypes: FileTypeTrafficItem[];
}

export interface DashboardTrafficResponse {
    traffic: {
        daily: PeriodTrafficData;
        weekly: PeriodTrafficData;
        monthly: PeriodTrafficData;
    };
}

export interface StaffUploaderItem {
    id: number;
    name: string;
    dept: string;
    uploads: number;
    avatar: string;
}

export interface DashboardStaffPerformanceResponse {
    performance: {
        total_staff: number;
        active_users: number;
        departments: string[];
        department_counts: Record<string, number>;
        uploads: {
            daily: StaffUploaderItem[];
            weekly: StaffUploaderItem[];
            monthly: StaffUploaderItem[];
        };
    };
}

export interface CategoryTreeNode {
    id: string;
    category_id: string;
    name: string;
    level: number;
    parent_id: string | null;
    children: CategoryTreeNode[];
}

export interface DashboardCategorySummaryResponse {
    category_summary: {
        tree: CategoryTreeNode[];
        counts: {
            daily: Record<string, number>;
            weekly: Record<string, number>;
            monthly: Record<string, number>;
        };
        departments: string[];
    };
}

export const dashboardApi = {
    async getAnalytics(): Promise<DashboardAnalyticsResponse> {
        const res = await api.get("dashboard/analytics/");
        return res.data;
    },
    async getTraffic(): Promise<DashboardTrafficResponse> {
        const res = await api.get("dashboard/traffic/");
        return res.data;
    },
    async getStaffPerformance(): Promise<DashboardStaffPerformanceResponse> {
        const res = await api.get("dashboard/staff-performance/");
        return res.data;
    },
    async getCategorySummary(departmentName?: string): Promise<DashboardCategorySummaryResponse> {
        const params = departmentName && departmentName !== "အားလုံး" ? { department_name: departmentName } : {};
        const res = await api.get("dashboard/category-summary/", { params });
        return res.data;
    },
};



