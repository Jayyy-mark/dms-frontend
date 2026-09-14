import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Select from "react-select";
import {
  List, LayoutGrid,
  FileText, Clock, User, RefreshCw,
  ChevronRight, Eye, Building2, Folder
} from "lucide-react";
import { documentApi } from "../../api/documentApi";
import { categoryApi } from "../../api/categoryApi";
import { departmentApi } from "../../api/departmentApi";
import { staffApi } from "../../api/staffApi";
import { Document } from "../../interfaces/document";
import { Category } from "../../interfaces/category";
import { Department } from "../../interfaces/department";
import { Staff } from "../../interfaces/staff";

/* ── helpers ── */
function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function dtypeBadge(dtype?: string) {
  const label = dtype ?? "—";
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap";
  if (!dtype) return <span className={`${base} bg-gray-50 text-gray-400 border-gray-200`}>{label}</span>;
  if (label.toLowerCase().includes("urgent") || label.toLowerCase().includes("compat"))
    return <span className={`${base} bg-rose-50 text-rose-600 border-rose-200`}>{label}</span>;
  if (label.toLowerCase().includes("temp"))
    return <span className={`${base} bg-amber-50 text-amber-600 border-amber-200`}>{label}</span>;
  return <span className={`${base} bg-teal-50 text-teal-600 border-teal-200`}>{label}</span>;
}

type SelectOption = { value: string; label: string };

/* react-select shared styles */
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "38px",
    fontSize: "13px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#14b8a6" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(20,184,166,0.2)" : "none",
    backgroundColor: "#f9fafb",
    "&:hover": { borderColor: "#14b8a6" },
    cursor: "pointer",
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: "13px",
    backgroundColor: state.isSelected ? "#14b8a6" : state.isFocused ? "#f0fdfa" : "white",
    color: state.isSelected ? "white" : "#374151",
    cursor: "pointer",
  }),
  placeholder: (base: any) => ({ ...base, color: "#9ca3af", fontSize: "13px" }),
  singleValue: (base: any) => ({ ...base, fontSize: "13px", color: "#374151" }),
  clearIndicator: (base: any) => ({ ...base, padding: "4px", cursor: "pointer" }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

/* ══════════════ COMPONENT ══════════════ */
export default function DashboardDocumentsTab() {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  /* filter state */
  const [filterStaff, setFilterStaff] = useState<SelectOption | null>(null);
  const [filterDept, setFilterDept] = useState<SelectOption | null>(null);
  const [filterCategory, setFilterCategory] = useState<SelectOption | null>(null);

  /* dropdown data */
  const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
  const [deptOptions, setDeptOptions] = useState<SelectOption[]>([]);
  const [catOptions, setCatOptions] = useState<SelectOption[]>([]);

  /* fetch all */
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const [docData, staffData, deptData, catData] = await Promise.all([
        documentApi.all(),
        staffApi.all(),
        departmentApi.all(),
        categoryApi.all(),
      ]);
      const list: Document[] = docData.documents ?? docData ?? [];
      setDocs(list);
      setFiltered(list);

      const staffs: Staff[] = staffData.staffs ?? staffData ?? [];
      setStaffOptions(staffs.map(s => ({ value: String(s.id), label: s.staff_name })));

      const depts: Department[] = deptData.departments ?? deptData ?? [];
      setDeptOptions(depts.map(d => ({ value: String(d.id), label: d.department_name })));

      const cats: Category[] = catData.categories ?? catData ?? [];
      setCatOptions(cats.map(c => ({ value: String(c.id), label: c.category_name })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  /* live filter */
  useEffect(() => {
    let result = [...docs];
    if (filterStaff)
      result = result.filter(d => String(d.staff?.id ?? d.staff_id ?? "") === filterStaff.value);
    if (filterDept)
      result = result.filter(d => String(d.staff?.department_id ?? "") === filterDept.value ||
        d.staff?.department?.department_name === filterDept.label);
    if (filterCategory)
      result = result.filter(d => String(d.category?.id ?? d.category_id ?? "") === filterCategory.value);
    setFiltered(result);
  }, [filterStaff, filterDept, filterCategory, docs]);

  const resetFilters = () => {
    setFilterStaff(null);
    setFilterDept(null);
    setFilterCategory(null);
  };

  const hasActiveFilter = filterStaff || filterDept || filterCategory;

  /* ── render ── */
  return (
    <div className="space-y-6 pb-10">
      {/* ── Top Header Banner (Small, Compact & Elegant) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/40 text-[10px] font-semibold text-[#B88E2F]">
            <FileText size={12} />
            <span>MOGE Document Management</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
            {t("Document Analytics & Catalog")}
          </h1>
          <p className="text-[11px] text-gray-400 font-normal leading-normal">
            {t("Monitor your document archives, category distribution, and file catalog")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchDocs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl transition cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>{t("Refresh")}</span>
          </button>
        </div>
      </div>

      {/* ── Top Analytics Card Container 1 (Matching Reference Template Kit) ── */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {t("Document Analytics")}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {t("Overview of in-house documents and archival stats")}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#B88E2F] bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-500/10">
            {docs.length} {t("Total Files")}
          </span>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">{t("Total Documents")}</p>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{docs.length}</h3>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">{t("Permanent Records")}</p>
            <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {docs.filter(d => d.dtype?.dtype_name === "Permanent").length}
            </h3>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">{t("Temporary Records")}</p>
            <h3 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {docs.filter(d => d.dtype?.dtype_name === "Temporary").length}
            </h3>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-bold uppercase text-gray-400">{t("Categories")}</p>
            <h3 className="text-xl font-extrabold text-[#B88E2F] dark:text-amber-400 mt-1">{catOptions.length}</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-6">

        {/* ════ LEFT: Filter Panel ════ */}
        <div className="w-64 shrink-0">
          <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
                <svg className="h-4 w-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                Filter
              </span>
            </div>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-3 w-3" /> {t("Reset")}
              </button>
            )}
          </div>

          <div className="space-y-5 p-5">

            {/* Filter: Staff */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <User className="h-3.5 w-3.5" /> Uploaded By
              </label>
              <Select
                isClearable
                options={staffOptions}
                value={filterStaff}
                onChange={v => setFilterStaff(v as SelectOption | null)}
                placeholder="Select staff..."
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>

            {/* Filter: Department */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <Building2 className="h-3.5 w-3.5" /> Department
              </label>
              <Select
                isClearable
                options={deptOptions}
                value={filterDept}
                onChange={v => setFilterDept(v as SelectOption | null)}
                placeholder="Select department..."
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>

            {/* Filter: Category */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <Folder className="h-3.5 w-3.5" /> Category
              </label>
              <Select
                isClearable
                options={catOptions}
                value={filterCategory}
                onChange={v => setFilterCategory(v as SelectOption | null)}
                placeholder="Select category..."
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>

          </div>

          {/* Active filter chips */}
          {hasActiveFilter && (
            <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-5 pb-4 pt-3 dark:border-gray-800">
              {filterStaff && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <User className="h-3 w-3" /> {filterStaff.label}
                </span>
              )}
              {filterDept && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                  <Building2 className="h-3 w-3" /> {filterDept.label}
                </span>
              )}
              {filterCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  <Folder className="h-3 w-3" /> {filterCategory.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════ RIGHT: Document List ════ */}
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div>
              <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-800 dark:text-white/90">
                Archive Catalog
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                  {loading ? "..." : filtered.length}
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">မော်ကွန်းထိန်းသိမ်းမှုစာရင်း</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDocs}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all
                    ${viewMode === "table" ? "bg-white text-gray-700 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <List className="h-4 w-4" /> Table
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all
                    ${viewMode === "grid" ? "bg-white text-gray-700 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <LayoutGrid className="h-4 w-4" /> Grid
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <RefreshCw className="h-7 w-7 animate-spin" />
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-gray-400">
              <FileText className="h-12 w-12 opacity-20" />
              <p className="text-sm">No documents found</p>
              {hasActiveFilter && (
                <button onClick={resetFilters} className="text-xs font-semibold text-teal-500 hover:underline">
                  {t("Clear filters")}
                </button>
              )}
            </div>
          ) : viewMode === "table" ? (

            /* ─── TABLE VIEW ─── */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["ID", "Document", "Category", "Department", "Uploaded By", "Date", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/80">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                          {doc.document_id}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-5 py-3.5">
                        <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">{doc.document_name}</p>
                        {doc.description && (
                          <p className="mt-0.5 truncate text-[11px] text-gray-400">{doc.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {doc.category?.category_name ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            <Folder className="h-3 w-3" /> {doc.category.category_name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {doc.staff?.department?.department_name ?? doc.staff?.department?.department_name ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-black text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                            {(doc.staff?.staff_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate text-xs text-gray-600 dark:text-gray-300">
                            {doc.staff?.staff_name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(doc.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 opacity-0 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 group-hover:opacity-100 dark:border-gray-700">
                          <Eye className="h-3.5 w-3.5" /> {t("View")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (

            /* ─── GRID VIEW ─── */
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(doc => (
                <div
                  key={doc.id}
                  className="group relative flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-5 transition-all hover:border-teal-200 hover:bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/10">
                      <FileText className="h-5 w-5 text-teal-500" />
                    </div>
                    {dtypeBadge(doc.dtype?.dtype_name)}
                  </div>

                  <div>
                    <p className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                      {doc.document_name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-teal-600 dark:text-teal-400">{doc.document_id}</p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-700">
                    {doc.category?.category_name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Folder className="h-2.5 w-2.5" /> {doc.category.category_name}
                      </span>
                    )}
                    {(doc.staff?.department?.department_name ?? doc.staff?.department?.department_name) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Building2 className="h-2.5 w-2.5" /> {doc.staff?.department?.department_name ?? doc.staff?.department?.department_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate">{doc.staff?.staff_name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{fmtDate(doc.created_at)}</span>
                    </div>
                  </div>

                  <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-gray-300 opacity-0 transition group-hover:opacity-100 dark:text-gray-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
