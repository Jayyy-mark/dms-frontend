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
    async globalSearch(q: string, limit = 5, signal?: AbortSignal): Promise<GlobalSearchResponse> {
        const clean = q.trim();
        if (!clean) {
            return EMPTY_GLOBAL_SEARCH;
        }
        const cacheKey = `${clean.toLowerCase()}:${limit}`;
        const cached = globalSearchCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < 30_000) {
            return cached.data;
        }
        const res = await api.get("dashboard/global-search/", {
            params: { q: clean, limit },
            signal,
        });
        const data: GlobalSearchResponse = res.data;
        if (globalSearchCache.size > 60) {
            const firstKey = globalSearchCache.keys().next().value;
            if (firstKey) globalSearchCache.delete(firstKey);
        }
        globalSearchCache.set(cacheKey, { ts: Date.now(), data });
        return data;
    },
};

export interface GlobalSearchResultItem {
    id: number;
    code: string;
    title: string;
    subtitle: string;
    status?: "active" | "archived" | "recycled";
    file_url?: string | null;
    url: string;
    type: "document" | "location" | "staff" | "department" | "category" | "building" | "room" | "user";
}

export interface GlobalSearchResponse {
    query: string;
    total: number;
    results: {
        documents: GlobalSearchResultItem[];
        locations: GlobalSearchResultItem[];
        staffs: GlobalSearchResultItem[];
        departments: GlobalSearchResultItem[];
        categories: GlobalSearchResultItem[];
        facilities: GlobalSearchResultItem[];
        users: GlobalSearchResultItem[];
    };
}

const EMPTY_GLOBAL_SEARCH: GlobalSearchResponse = {
    query: "",
    total: 0,
    results: {
        documents: [],
        locations: [],
        staffs: [],
        departments: [],
        categories: [],
        facilities: [],
        users: [],
    },
};

const globalSearchCache = new Map<string, { ts: number; data: GlobalSearchResponse }>();




