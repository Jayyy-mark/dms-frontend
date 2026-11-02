import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useSWR from "swr";
import Select from "react-select";
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderTree,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Type,
  User,
  Users,
  X,
} from "lucide-react";
import { swrFetcher } from "../../helpers/swrFetcher";
import { Document } from "../../interfaces/document";
import { Category } from "../../interfaces/category";
import { Department } from "../../interfaces/department";
import { Staff } from "../../interfaces/staff";
import { API_SERVER } from "../../helpers/api";
import { toast } from "react-toastify";

/* ── Types ── */
type TimeHorizon = "all" | "daily" | "weekly" | "monthly";
type RecordFilter = "all" | "permanent" | "temporary";
type SelectOption = { value: string; label: string };

const DEFAULT_FONT_SCALE = 85;
const FONT_SCALE_STORAGE_KEY = "moge_doc_dashboard_font_scale_v2";
const CACHE_STORAGE_KEY = "moge_doc_dashboard_cache_v1";

interface CachedDashboardData {
  docs: Document[];
  staffs: Staff[];
  depts: Department[];
  cats: Category[];
}

function readCachedData(): CachedDashboardData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedDashboardData;
  } catch {
    return null;
  }
}

function writeCachedData(payload: CachedDashboardData) {
  try {
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
}

const FONT_PRESETS = [
  {
    scale: 85,
    titleKey: "Standard (85%)",
    descKey: "Default compact view (85%)",
    badgeKey: "Default",
  },
  {
    scale: 100,
    titleKey: "Normal (100%)",
    descKey: "Balanced reading size (100%)",
    badgeKey: "Recommended",
  },
  {
    scale: 115,
    titleKey: "Large (115%)",
    descKey: "Senior-friendly comfortable print (115%)",
    badgeKey: "Senior Friendly",
  },
  {
    scale: 130,
    titleKey: "Extra Large (130%)",
    descKey: "Maximum clarity and visibility (130%)",
    badgeKey: "Max Clarity",
  },
];

/* ── Clean Date Helpers ── */
function fmtDate(d?: string) {
  if (!d) return "—";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isWithinHorizon(dateStr: string | undefined, horizon: TimeHorizon): boolean {
  if (horizon === "all") return true;
  if (!dateStr) return false;
  const docDate = new Date(dateStr);
  if (isNaN(docDate.getTime())) return false;

  const now = new Date();
  if (horizon === "daily") {
    return (
      docDate.getFullYear() === now.getFullYear() &&
      docDate.getMonth() === now.getMonth() &&
      docDate.getDate() === now.getDate()
    );
  }
  const diffDays = (now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24);
  if (horizon === "weekly") return diffDays >= -1 && diffDays <= 7;
  if (horizon === "monthly") return diffDays >= -1 && diffDays <= 30;
  return true;
}

function getFileIconMeta(doc: Document, size = 20) {
  const raw = doc.document ? String(doc.document) : doc.document_name || "";
  const ext = raw.split("?")[0].split(".").pop()?.toLowerCase() || "";

  if (ext === "pdf") {
    return {
      icon: <FileText size={size} />,
      bg: "bg-rose-50 dark:bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      label: "PDF",
    };
  }
  if (["doc", "docx"].includes(ext)) {
    return {
      icon: <FileText size={size} />,
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      label: "Word",
    };
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return {
      icon: <FileSpreadsheet size={size} />,
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Excel",
    };
  }
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return {
      icon: <FileImage size={size} />,
      bg: "bg-purple-50 dark:bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      label: "Image",
    };
  }
  return {
    icon: <File size={size} />,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-[#B88E2F] dark:text-amber-400",
    label: "File",
  };
}

function renderCategoryPath(cat?: Category | any): string {
  if (!cat) return "";
  const parts: string[] = [];
  if (cat?.parent?.parent?.category_name) parts.push(cat.parent.parent.category_name);
  if (cat?.parent?.category_name) parts.push(cat.parent.category_name);
  if (cat?.category_name) parts.push(cat.category_name);
  return parts.join(" › ");
}

/* ══════════════ CLEAN & SENIOR-FRIENDLY EXECUTIVE DOCUMENT DASHBOARD ══════════════ */
export default function DashboardDocumentsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const todayStr = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  /* Read initial cached snapshot from sessionStorage for instant load */
  const initialCache = useMemo(() => readCachedData(), []);

  /* SWR Cached Data Fetching */
  const swrOptions = {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
  };

  const {
    data: docRes,
    isLoading: docLoading,
    isValidating: docValidating,
    mutate: mutateDocs,
  } = useSWR<any>("document/all/", swrFetcher, swrOptions);

  const {
    data: staffRes,
    isLoading: staffLoading,
    mutate: mutateStaffs,
  } = useSWR<any>("staff/all/", swrFetcher, swrOptions);

  const {
    data: deptRes,
    isLoading: deptLoading,
    mutate: mutateDepts,
  } = useSWR<any>("department/all/", swrFetcher, swrOptions);

  const {
    data: catRes,
    isLoading: catLoading,
    mutate: mutateCats,
  } = useSWR<any>("category/all/", swrFetcher, swrOptions);

  /* Resolved Data Lists (SWR data -> fallback to sessionStorage cache) */
  const docs = useMemo<Document[]>(() => {
    const raw: Document[] = docRes?.documents ?? docRes ?? initialCache?.docs ?? [];
    if (!Array.isArray(raw)) return [];
    return [...raw].sort(
      (a, b) =>
        new Date(b.created_at || b.updated_at || 0).getTime() -
        new Date(a.created_at || a.updated_at || 0).getTime()
    );
  }, [docRes, initialCache]);

  const staffList = useMemo<Staff[]>(() => {
    const raw = staffRes?.staffs ?? staffRes ?? initialCache?.staffs ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [staffRes, initialCache]);

  const deptList = useMemo<Department[]>(() => {
    const raw = deptRes?.departments ?? deptRes ?? initialCache?.depts ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [deptRes, initialCache]);

  const catList = useMemo<Category[]>(() => {
    const raw = catRes?.categories ?? catRes ?? initialCache?.cats ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [catRes, initialCache]);

  /* Persist latest data into sessionStorage cache */
  useEffect(() => {
    if (docRes || staffRes || deptRes || catRes) {
      writeCachedData({
        docs,
        staffs: staffList,
        depts: deptList,
        cats: catList,
      });
    }
  }, [docRes, staffRes, deptRes, catRes, docs, staffList, deptList, catList]);

  const hasCachedData = Boolean(
    initialCache &&
      (initialCache.docs.length > 0 ||
        initialCache.depts.length > 0 ||
        initialCache.staffs.length > 0)
  );

  const isInitialLoading =
    !hasCachedData && (docLoading || staffLoading || deptLoading || catLoading);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsManualRefreshing(true);
    try {
      await Promise.all([mutateDocs(), mutateStaffs(), mutateDepts(), mutateCats()]);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  /* Simple, Clear Filters */
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("all");
  const [recordFilter, setRecordFilter] = useState<RecordFilter>("all");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /* Detail Drawer */
  const [inspectedDoc, setInspectedDoc] = useState<Document | null>(null);

  /* Page-Scoped Font Size State & Side Drawer (Default: 85%) */
  const [isFontDrawerOpen, setIsFontDrawerOpen] = useState(false);
  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(FONT_SCALE_STORAGE_KEY));
      if (saved && saved >= 75 && saved <= 140) return saved;
    } catch {
      /* ignore storage errors */
    }
    return DEFAULT_FONT_SCALE;
  });

  const updateFontScale = (next: number) => {
    const clamped = Math.min(140, Math.max(75, next));
    setFontScale(clamped);
    try {
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(clamped));
    } catch {
      /* ignore storage errors */
    }
  };

  /* Senior-friendly react-select styles that scale with fontScale */
  const selectStyles = useMemo(() => {
    const px = Math.round(14 * (fontScale / 100));
    return {
      control: (base: any, state: any) => ({
        ...base,
        minHeight: "42px",
        fontSize: `${px}px`,
        borderRadius: "12px",
        borderColor: state.isFocused ? "#B88E2F" : "#e5e7eb",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(184,142,47,0.18)" : "none",
        backgroundColor: "#ffffff",
        "&:hover": { borderColor: "#B88E2F" },
        cursor: "pointer",
      }),
      option: (base: any, state: any) => ({
        ...base,
        fontSize: `${px}px`,
        padding: "10px 14px",
        backgroundColor: state.isSelected
          ? "#B88E2F"
          : state.isFocused
          ? "#FEF3C7"
          : "white",
        color: state.isSelected ? "white" : "#1f2937",
        fontWeight: state.isSelected ? 700 : 500,
        cursor: "pointer",
      }),
      placeholder: (base: any) => ({ ...base, color: "#9ca3af", fontSize: `${px}px` }),
      singleValue: (base: any) => ({
        ...base,
        fontSize: `${px}px`,
        fontWeight: 600,
        color: "#111827",
      }),
      clearIndicator: (base: any) => ({ ...base, padding: "6px", cursor: "pointer" }),
      menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    };
  }, [fontScale]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeHorizon, recordFilter, selectedDeptId, selectedStaffId, selectedCatId, searchQuery]);

  /* 1. Time-filtered documents */
  const horizonDocs = useMemo(
    () => docs.filter((d) => isWithinHorizon(d.created_at || d.updated_at, timeHorizon)),
    [docs, timeHorizon]
  );

  /* Counts per period for the period filter bar */
  const periodCounts = useMemo(() => {
    let daily = 0;
    let weekly = 0;
    let monthly = 0;
    docs.forEach((d) => {
      const dt = d.created_at || d.updated_at;
      if (isWithinHorizon(dt, "daily")) daily++;
      if (isWithinHorizon(dt, "weekly")) weekly++;
      if (isWithinHorizon(dt, "monthly")) monthly++;
    });
    return { all: docs.length, daily, weekly, monthly };
  }, [docs]);

  /* 4 Clear Summary Numbers */
  const summaryStats = useMemo(() => {
    let permanent = 0;
    let temporary = 0;
    horizonDocs.forEach((d) => {
      const dtype = (d.dtype?.dtype_name || "").toLowerCase();
      if (dtype.includes("temp")) temporary++;
      else permanent++;
    });
    return {
      total: horizonDocs.length,
      permanent,
      temporary,
      todayNew: periodCounts.daily,
    };
  }, [horizonDocs, periodCounts.daily]);

  /* 2. Clean Department List with Document Counts */
  const departmentSummary = useMemo(() => {
    const counts = new Map<string, number>();
    horizonDocs.forEach((d) => {
      const id = String(d.staff?.department?.id ?? d.staff?.department_id ?? "");
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });

    return deptList
      .map((d) => ({
        id: String(d.id),
        name: d.department_name,
        count: counts.get(String(d.id)) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [horizonDocs, deptList]);

  /* 3. Clean Staff List (Scoped to Selected Department if chosen) */
  const staffSummary = useMemo(() => {
    const counts = new Map<string, number>();
    horizonDocs.forEach((d) => {
      const dId = String(d.staff?.department?.id ?? d.staff?.department_id ?? "");
      if (selectedDeptId && dId !== selectedDeptId) return;
      const sId = String(d.staff?.id ?? d.staff_id ?? "");
      if (sId) counts.set(sId, (counts.get(sId) || 0) + 1);
    });

    const baseStaffs = selectedDeptId
      ? staffList.filter(
          (s) => String(s.department?.id ?? s.department_id ?? "") === selectedDeptId
        )
      : staffList;

    return baseStaffs
      .map((s) => ({
        id: String(s.id),
        name: s.staff_name,
        deptName: s.department?.department_name || "—",
        count: counts.get(String(s.id)) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [horizonDocs, staffList, selectedDeptId]);

  /* 4. Final Filtered Documents for the Table */
  const filteredDocs = useMemo(() => {
    const cleanQ = searchQuery.trim().toLowerCase().normalize("NFKC");

    return horizonDocs.filter((doc) => {
      if (selectedDeptId) {
        const dId = String(doc.staff?.department?.id ?? doc.staff?.department_id ?? "");
        if (dId !== selectedDeptId) return false;
      }
      if (selectedStaffId) {
        const sId = String(doc.staff?.id ?? doc.staff_id ?? "");
        if (sId !== selectedStaffId) return false;
      }
      if (selectedCatId) {
        const cId = String(doc.category?.id ?? doc.category_id ?? "");
        if (cId !== selectedCatId) return false;
      }
      if (recordFilter !== "all") {
        const isTemp = (doc.dtype?.dtype_name || "").toLowerCase().includes("temp");
        if (recordFilter === "temporary" && !isTemp) return false;
        if (recordFilter === "permanent" && isTemp) return false;
      }
      if (cleanQ) {
        const fields = [
          doc.document_id,
          doc.document_name,
          doc.description,
          doc.staff?.staff_name,
          doc.staff?.department?.department_name,
          doc.category?.category_name,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase().normalize("NFKC"));

        if (!fields.some((f) => f.includes(cleanQ))) return false;
      }
      return true;
    });
  }, [
    horizonDocs,
    selectedDeptId,
    selectedStaffId,
    selectedCatId,
    recordFilter,
    searchQuery,
  ]);

  const catOptions = useMemo<SelectOption[]>(
    () => catList.map((c) => ({ value: String(c.id), label: c.category_name })),
    [catList]
  );

  const hasActiveFilters =
    timeHorizon !== "all" ||
    recordFilter !== "all" ||
    Boolean(selectedDeptId) ||
    Boolean(selectedStaffId) ||
    Boolean(selectedCatId) ||
    Boolean(searchQuery.trim());

  const resetFilters = () => {
    setTimeHorizon("all");
    setRecordFilter("all");
    setSelectedDeptId("");
    setSelectedStaffId("");
    setSelectedCatId("");
    setSearchQuery("");
  };

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const paginatedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredDocs, currentPage]
  );

  /* Open Document File */
  const getDocUrl = (docField?: any): string => {
    if (!docField) return "";
    const str = typeof docField === "string" ? docField : docField?.url || String(docField);
    if (str.startsWith("http://") || str.startsWith("https://")) return str;
    const base = (API_SERVER || "").replace(/\/$/, "");
    const cleanPath = str.startsWith("/") ? str : `/${str}`;
    return `${base}${cleanPath}`;
  };

  const handleViewDocument = (doc: Document) => {
    const rawDoc = doc.document || (doc as any).file_url || (doc as any).file;
    if (!rawDoc) {
      toast.info(t("No document file attached."));
      return;
    }
    const fullUrl = getDocUrl(rawDoc);
    if (!fullUrl) {
      toast.info(t("Invalid document URL."));
      return;
    }
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const selectedDeptObj = deptList.find((d) => String(d.id) === selectedDeptId);
  const selectedStaffObj = staffList.find((s) => String(s.id) === selectedStaffId);
  const isRefreshing = isManualRefreshing || docValidating;

  return (
    <div
      className="moge-doc-dashboard-scope space-y-6 pb-12"
      style={{ ["--doc-font-scale" as any]: fontScale / 100 }}
    >
      {/* Scoped Font Scaling CSS — applies ONLY inside .moge-doc-dashboard-scope */}
      <style>{`
        .moge-doc-dashboard-scope .text-\\[10px\\] {
          font-size: calc(10px * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.5 !important;
        }
        .moge-doc-dashboard-scope .text-\\[11px\\] {
          font-size: calc(11px * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.5 !important;
        }
        .moge-doc-dashboard-scope .text-xs {
          font-size: calc(0.75rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.5 !important;
        }
        .moge-doc-dashboard-scope .text-sm {
          font-size: calc(0.875rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.55 !important;
        }
        .moge-doc-dashboard-scope .text-base {
          font-size: calc(1rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.55 !important;
        }
        .moge-doc-dashboard-scope .text-lg {
          font-size: calc(1.125rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.5 !important;
        }
        .moge-doc-dashboard-scope .text-xl {
          font-size: calc(1.25rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.45 !important;
        }
        .moge-doc-dashboard-scope .text-2xl {
          font-size: calc(1.5rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.4 !important;
        }
        .moge-doc-dashboard-scope .text-3xl {
          font-size: calc(1.875rem * var(--doc-font-scale, 0.85)) !important;
          line-height: 1.3 !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          CARD 1: TOP HEADER BANNER CARD (Matches Overview "Welcome Admin" Card)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/40 text-[10px] font-semibold text-[#B88E2F]">
            <Sparkles size={12} />
            <span>{t("MOGE Document Overview")}</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
            {t("Document Dashboard")}
          </h1>
          <p className="text-[11px] text-gray-400 font-normal leading-normal">
            {t("View documents submitted across all departments and staffs by daily, weekly, or monthly periods")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-[11px] font-medium text-gray-600 dark:text-gray-300 shrink-0">
          <Calendar size={13} className="text-[#B88E2F]" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CARD 2: DOCUMENT ANALYTICS CARD (Matches "System Analytics" Card)
          - Row 1 (Above): Big 4 Stats Cards (Total, Permanent, Temporary, Today)
          - Row 2 (Below): All, Today, This Week, This Month, Clear Filter, Refresh
         ══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6">
        {/* Container Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {t("Document Analytics")}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {t("Overview of in-house documents and archival stats across all departments")}
              </p>
            </div>
          </div>
        </div>

        {/* ROW 1 (ABOVE): Big 4 Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Documents */}
          <button
            type="button"
            onClick={() => setRecordFilter("all")}
            className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 hover:shadow-md md:px-5 md:py-4 cursor-pointer ${
              recordFilter === "all"
                ? "border-[#B88E2F] bg-amber-50/30 dark:bg-amber-500/10"
                : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-[#B88E2F]" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 ml-1">
              <FileText className="h-5 w-5 text-[#B88E2F] dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t("Total Documents")}
              </p>
              {isInitialLoading ? (
                <div className="mt-1.5 h-6 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <h3 className="mt-0.5 text-xl font-extrabold text-gray-900 dark:text-white">
                  {summaryStats.total} {t("files")}
                </h3>
              )}
            </div>
          </button>

          {/* 2. Permanent Documents */}
          <button
            type="button"
            onClick={() => setRecordFilter(recordFilter === "permanent" ? "all" : "permanent")}
            className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 hover:shadow-md md:px-5 md:py-4 cursor-pointer ${
              recordFilter === "permanent"
                ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10"
                : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 ml-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t("Permanent Records")}
              </p>
              {isInitialLoading ? (
                <div className="mt-1.5 h-6 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <h3 className="mt-0.5 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {summaryStats.permanent} {t("files")}
                </h3>
              )}
            </div>
          </button>

          {/* 3. Temporary Documents */}
          <button
            type="button"
            onClick={() => setRecordFilter(recordFilter === "temporary" ? "all" : "temporary")}
            className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 hover:shadow-md md:px-5 md:py-4 cursor-pointer ${
              recordFilter === "temporary"
                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-500/10"
                : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 ml-1">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t("Temporary Records")}
              </p>
              {isInitialLoading ? (
                <div className="mt-1.5 h-6 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <h3 className="mt-0.5 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {summaryStats.temporary} {t("files")}
                </h3>
              )}
            </div>
          </button>

          {/* 4. Today Uploaded Documents */}
          <button
            type="button"
            onClick={() => setTimeHorizon(timeHorizon === "daily" ? "all" : "daily")}
            className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 hover:shadow-md md:px-5 md:py-4 cursor-pointer ${
              timeHorizon === "daily"
                ? "border-teal-500 bg-teal-50/40 dark:bg-teal-500/10"
                : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-teal-500" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/10 ml-1">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t("Uploaded Today")}
              </p>
              {isInitialLoading ? (
                <div className="mt-1.5 h-6 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <h3 className="mt-0.5 text-xl font-extrabold text-teal-600 dark:text-teal-400">
                  {summaryStats.todayNew} {t("files")}
                </h3>
              )}
            </div>
          </button>
        </div>

        {/* ROW 2 (BELOW BIG 4 CARDS): All, Today, This Week, This Month + Clear Filter + Refresh in One Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            {(
              [
                { id: "all", label: t("All"), count: periodCounts.all },
                { id: "daily", label: t("Today"), count: periodCounts.daily },
                { id: "weekly", label: t("This Week"), count: periodCounts.weekly },
                { id: "monthly", label: t("This Month"), count: periodCounts.monthly },
              ] as { id: TimeHorizon; label: string; count: number }[]
            ).map((btn) => {
              const active = timeHorizon === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTimeHorizon(btn.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? "bg-[#B88E2F] text-white border-[#B88E2F] shadow-xs"
                      : "bg-gray-50/70 border-gray-100/80 text-gray-700 hover:border-amber-300 hover:bg-amber-50/40 dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-200"
                  }`}
                >
                  <span className="text-xs font-bold truncate">{btn.label}</span>
                  {isInitialLoading ? (
                    <span className="h-5 w-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0 ml-2" />
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold shrink-0 ml-2 ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs"
                      }`}
                    >
                      {btn.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clear Filter & Refresh Buttons on the same row */}
          <div className="flex items-center gap-2.5 shrink-0">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-4 py-3.5 text-xs font-bold text-rose-600 transition cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>{t("Clear Filter")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200/80 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 px-4 py-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition cursor-pointer disabled:opacity-60"
              title={t("Refresh")}
            >
              <RefreshCw
                size={15}
                className={isRefreshing ? "animate-spin text-[#B88E2F]" : ""}
              />
              <span>{t("Refresh")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: EASY 1-CLICK DEPARTMENT & STAFF SELECTOR CARDS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Choose Department */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {t("1. View by Department")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("Click a department to filter its documents")}
                </p>
              </div>
            </div>

            {selectedDeptId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDeptId("");
                  setSelectedStaffId("");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition cursor-pointer"
              >
                <RotateCcw size={13} />
                {t("Show All Departments")}
              </button>
            )}
          </div>

          <div
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {isInitialLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-4 py-3.5 animate-pulse"
                  >
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))
              : departmentSummary.map((dept) => {
                  const active = selectedDeptId === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(active ? "" : dept.id);
                        setSelectedStaffId("");
                      }}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                        active
                          ? "border-teal-600 bg-teal-600 text-white shadow-xs"
                          : "border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50 text-gray-800 dark:text-gray-100 hover:border-teal-400 hover:bg-teal-50/40"
                      }`}
                    >
                      <span className="text-sm font-bold truncate">{dept.name}</span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                          active
                            ? "bg-white/25 text-white"
                            : dept.count > 0
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {dept.count}
                      </span>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Right: Choose Staff Member */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {t("2. View by Staff")}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedDeptObj
                    ? t("Staffs in selected department", {
                        dept: selectedDeptObj.department_name,
                      })
                    : t("Click a staff member to view their uploaded documents")}
                </p>
              </div>
            </div>

            {selectedStaffId && (
              <button
                type="button"
                onClick={() => setSelectedStaffId("")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-[#997524] hover:bg-amber-100 transition cursor-pointer"
              >
                <RotateCcw size={13} />
                {t("Show All Staffs")}
              </button>
            )}
          </div>

          <div
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {isInitialLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-4 py-3 animate-pulse"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-5 w-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))
              : staffSummary.map((stf) => {
                  const active = selectedStaffId === stf.id;
                  return (
                    <button
                      key={stf.id}
                      type="button"
                      onClick={() => setSelectedStaffId(active ? "" : stf.id)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                        active
                          ? "border-[#B88E2F] bg-[#B88E2F] text-white shadow-xs"
                          : "border-gray-200/80 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50 text-gray-800 dark:text-gray-100 hover:border-amber-400 hover:bg-amber-50/40"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{stf.name}</p>
                        <p
                          className={`text-xs truncate ${
                            active ? "text-white/80" : "text-gray-400"
                          }`}
                        >
                          {stf.deptName}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                          active
                            ? "bg-white/25 text-white"
                            : stf.count > 0
                            ? "bg-amber-100 text-[#997524] dark:bg-amber-500/20 dark:text-amber-300"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {stf.count}
                      </span>
                    </button>
                  );
                })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: CLEAN, LARGE-PRINT DOCUMENT LIST TABLE
         ══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
        {/* Simple Search & Category Bar */}
        <div className="border-b border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {t("3. Documents List")}
              </h2>
              <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 px-3 py-1 text-sm font-extrabold text-[#B88E2F]">
                {filteredDocs.length} {t("files")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Large Search Input */}
              <div className="relative sm:w-80">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("Search by document name, ID, or staff name...")}
                  className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-9 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#B88E2F] focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="sm:w-64">
                <Select
                  isClearable
                  options={catOptions}
                  value={catOptions.find((o) => o.value === selectedCatId) || null}
                  onChange={(opt) =>
                    setSelectedCatId((opt as SelectOption | null)?.value || "")
                  }
                  placeholder={t("Select category...")}
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 h-11 text-sm font-bold text-rose-600 transition cursor-pointer shrink-0"
                >
                  <RotateCcw size={15} />
                  {t("Reset")}
                </button>
              )}
            </div>
          </div>

          {/* Active Selection Banner (if Department or Staff is selected) */}
          {(selectedDeptObj || selectedStaffObj || timeHorizon !== "all") && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 px-4 py-2.5 text-sm">
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {t("Currently Viewing")}:
              </span>
              {timeHorizon !== "all" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-gray-800 px-3 py-1 font-bold text-[#B88E2F] shadow-2xs">
                  {timeHorizon === "daily"
                    ? t("Today")
                    : timeHorizon === "weekly"
                    ? t("This Week")
                    : t("This Month")}
                </span>
              )}
              {selectedDeptObj && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-gray-800 px-3 py-1 font-bold text-teal-700 dark:text-teal-300 shadow-2xs">
                  <Building2 size={14} />
                  {selectedDeptObj.department_name}
                </span>
              )}
              {selectedStaffObj && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-gray-800 px-3 py-1 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
                  <User size={14} />
                  {selectedStaffObj.staff_name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table Content (with Skeleton Loader while loading) */}
        {isInitialLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Document")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Department")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Uploaded By")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Category")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Date")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                        <div className="space-y-2">
                          <div className="h-4 w-44 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-6 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-8 w-16 rounded-xl bg-gray-200 dark:bg-gray-700" />
                        <div className="h-8 w-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-gray-400 px-4 text-center">
            <FileText className="h-14 w-14 opacity-25" />
            <p className="text-base font-bold text-gray-700 dark:text-gray-200">
              {t("No documents found for the selected period or department")}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 rounded-xl bg-[#B88E2F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#997524] transition cursor-pointer"
              >
                {t("View All Documents")}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Document")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Department")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Uploaded By")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Category")}
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Date")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {t("Action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedDocs.map((doc) => {
                  const fileMeta = getFileIconMeta(doc, 22);
                  const isTemp = (doc.dtype?.dtype_name || "").toLowerCase().includes("temp");

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setInspectedDoc(doc)}
                      className="transition-colors hover:bg-amber-50/40 dark:hover:bg-gray-800/50 cursor-pointer"
                    >
                      {/* Document Name & ID */}
                      <td className="px-6 py-4 max-w-[300px]">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${fileMeta.bg} ${fileMeta.text}`}
                          >
                            {fileMeta.icon}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="truncate text-sm sm:text-base font-bold text-gray-900 dark:text-white"
                              title={doc.document_name}
                            >
                              {doc.document_name}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#B88E2F]">
                                {doc.document_id}
                              </span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                  isTemp
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                }`}
                              >
                                {isTemp ? t("Temporary") : t("Permanent")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {doc.staff?.department?.department_name || "—"}
                        </span>
                      </td>

                      {/* Staff */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {doc.staff?.staff_name || "—"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        {doc.category?.category_name ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-bold text-[#997524] dark:text-amber-300">
                            <Folder size={13} />
                            {doc.category.category_name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {fmtDate(doc.created_at || doc.updated_at)}
                        </span>
                      </td>

                      {/* Clear, Large Action Buttons */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedDoc(doc);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition cursor-pointer"
                          >
                            {t("Details")}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(doc);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                          >
                            <Eye size={15} />
                            {t("Open File")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Simple, Large Pagination Footer */}
        {!isInitialLoading && filteredDocs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {t("Showing")} <strong>{(currentPage - 1) * pageSize + 1}</strong> {t("to")}{" "}
              <strong>{Math.min(currentPage * pageSize, filteredDocs.length)}</strong>{" "}
              {t("of")} <strong>{filteredDocs.length}</strong> {t("entries")}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
                {t("Previous")}
              </button>
              <span className="px-3 text-sm font-bold text-gray-800 dark:text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                {t("Next")}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FLOATING RIGHT-EDGE SIDE TAB BUTTON (Matches LocationGuidelineDrawer UI)
         ══════════════════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => setIsFontDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white dark:bg-gray-900 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-2xl shadow-xl py-3 px-2 flex flex-col items-center gap-2 hover:bg-amber-50/60 dark:hover:bg-gray-800 transition-all cursor-pointer group hover:pl-3"
        title={t("Font Size Settings")}
      >
        <div className="w-7 h-7 rounded-xl bg-[#0052cc] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
          <Type size={14} />
        </div>
        <span className="[writing-mode:vertical-lr] text-xs font-extrabold text-gray-800 dark:text-gray-200 tracking-wide group-hover:text-[#B88E2F] transition-colors">
          {t("Font Size")}
        </span>
      </button>

      {/* ══════════════════════════════════════════════════════════════════
          OFF-CANVAS SIDE DRAWER FOR FONT SIZE ADJUSTMENT (SCOPED TO THIS PAGE)
         ══════════════════════════════════════════════════════════════════ */}
      {isFontDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFontDrawerOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-800">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="text-base font-extrabold text-[#0f172a] dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0052cc] text-white flex items-center justify-center">
                    <Type size={15} />
                  </div>
                  <span>{t("Font Size Settings")}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {t("Adjust font size for this Document Dashboard page only")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFontDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* 1. Interactive Stepper & Slider */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {t("Current Size")}
                  </span>
                  <span className="rounded-lg bg-[#0052cc] px-2.5 py-1 text-xs font-extrabold text-white">
                    {fontScale}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={fontScale <= 75}
                    onClick={() => updateFontScale(fontScale - 5)}
                    className="flex h-11 w-14 shrink-0 items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-extrabold text-gray-800 dark:text-white hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer shadow-2xs"
                    title={t("Decrease Font")}
                  >
                    <Minus size={15} />
                    <span>A</span>
                  </button>

                  <input
                    type="range"
                    min={75}
                    max={140}
                    step={5}
                    value={fontScale}
                    onChange={(e) => updateFontScale(Number(e.target.value))}
                    className="w-full accent-[#0052cc] cursor-pointer h-2 rounded-lg bg-gray-200"
                  />

                  <button
                    type="button"
                    disabled={fontScale >= 140}
                    onClick={() => updateFontScale(fontScale + 5)}
                    className="flex h-11 w-14 shrink-0 items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base font-extrabold text-gray-800 dark:text-white hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer shadow-2xs"
                    title={t("Increase Font")}
                  >
                    <Plus size={16} />
                    <span>A</span>
                  </button>
                </div>
              </div>

              {/* 2. Quick Preset Cards */}
              <div className="space-y-2.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("Quick Presets")}
                </p>

                <div className="space-y-2.5">
                  {FONT_PRESETS.map((preset) => {
                    const active = fontScale === preset.scale;
                    return (
                      <button
                        key={preset.scale}
                        type="button"
                        onClick={() => updateFontScale(preset.scale)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          active
                            ? "border-[#0052cc] bg-blue-50/60 dark:bg-blue-500/10 shadow-xs"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-blue-300 hover:bg-gray-50/70"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                              {t(preset.titleKey)}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                                active
                                  ? "bg-[#0052cc] text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {t(preset.badgeKey)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t(preset.descKey)}
                          </p>
                        </div>

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-extrabold text-xs ${
                            active
                              ? "bg-[#0052cc] text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {preset.scale}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Live Preview Box */}
              <div className="rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5 p-4 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B88E2F]">
                  {t("Live Preview")}
                </p>
                <div
                  className="rounded-xl bg-white dark:bg-gray-900 p-3.5 border border-gray-200/80 dark:border-gray-800 space-y-1"
                  style={{
                    fontSize: `${Math.round(14 * (fontScale / 100))}px`,
                    lineHeight: 1.55,
                  }}
                >
                  <p className="font-extrabold text-gray-900 dark:text-white">
                    ကိုယ်ရေးမှတ်တမ်းများ (DOC-001)
                  </p>
                  <p
                    className="text-gray-600 dark:text-gray-300 font-medium"
                    style={{ fontSize: `${Math.round(12.5 * (fontScale / 100))}px` }}
                  >
                    ဦးဆောင်ညွှန်ကြားရေးမှူးရုံး • U Myat Zaw
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateFontScale(DEFAULT_FONT_SCALE)}
                disabled={fontScale === DEFAULT_FONT_SCALE}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
              >
                <RotateCcw size={14} />
                {t("Default (85%)")}
              </button>

              <button
                type="button"
                onClick={() => setIsFontDrawerOpen(false)}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#0052cc] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                {t("Done")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          CLEAN RIGHT-SIDE DOCUMENT DETAILS DRAWER
         ══════════════════════════════════════════════════════════════════ */}
      {inspectedDoc &&
        (() => {
          const fileMeta = getFileIconMeta(inspectedDoc, 26);
          const categoryPath = renderCategoryPath(inspectedDoc.category);
          const docFileUrl = getDocUrl(inspectedDoc.document);

          return (
            <>
              <div
                className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs"
                onClick={() => setInspectedDoc(null)}
              />
              <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-bold text-[#B88E2F]">
                      {t("Document Details")}
                    </p>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {inspectedDoc.document_id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedDoc(null)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${fileMeta.bg} ${fileMeta.text}`}
                    >
                      {fileMeta.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                        {inspectedDoc.document_name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {inspectedDoc.description || t("No description provided")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 p-5 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400">{t("Department")}</p>
                      <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 size={16} className="text-teal-600" />
                        {inspectedDoc.staff?.department?.department_name || "—"}
                      </p>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                    <div>
                      <p className="text-xs font-bold text-gray-400">
                        {t("Uploaded By")}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <User size={16} className="text-indigo-600" />
                        {inspectedDoc.staff?.staff_name || "—"}
                      </p>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                    <div>
                      <p className="text-xs font-bold text-gray-400">
                        {t("Category")}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-[#997524] dark:text-amber-300 flex items-center gap-2">
                        <FolderTree size={16} />
                        {categoryPath || inspectedDoc.category?.category_name || "—"}
                      </p>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400">{t("Uploaded Date")}</p>
                        <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">
                          {fmtDate(inspectedDoc.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">{t("Record Type")}</p>
                        <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">
                          {inspectedDoc.dtype?.dtype_name || t("Permanent")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 p-5 flex items-center gap-3 bg-gray-50 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() => handleViewDocument(inspectedDoc)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 py-3 px-4 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    {t("Open File")}
                  </button>

                  {docFileUrl && (
                    <a
                      href={docFileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 transition"
                      title={t("Download")}
                    >
                      <Download size={16} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setInspectedDoc(null);
                      navigate(`/documents/edit/${inspectedDoc.id}`);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 transition cursor-pointer"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </>
          );
        })()}
    </div>
  );
}
