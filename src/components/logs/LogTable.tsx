import { useState, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import { Document as DocxDocument, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { Log, LogFilterParams } from "../../interfaces/log";
import { helper } from "../../helpers/utils";
import { usePaginatedLogs, useLogStats, clientTimeZone } from "../../hooks/useLogs";
import { auditLogApi } from "../../api/auditLogApi";
import { toast } from "react-toastify";
import LogDetailDrawer from "./LogDetailDrawer";
import {
    MoreVertical,
    User,
    Calendar,
    Filter,
    Download,
    Database,
    ShieldAlert,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCw
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Builds page buttons like: 1 … 4 5 6 … 20
const getPageNumbers = (current: number, total: number): (number | "ellipsis")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "ellipsis")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push("ellipsis");

    pages.push(total);
    return pages;
};

export default function LogTable() {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [snapshotId, setSnapshotId] = useState<number | undefined>(undefined);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const exportingRef = useRef(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter States
    const [selectedDate, setSelectedDate] = useState("all");
    const [selectedAction, setSelectedAction] = useState("all");
    const [selectedRole, setSelectedRole] = useState("all");

    const filterParams: LogFilterParams = {
        date: selectedDate,
        action: selectedAction,
        role: selectedRole,
        tz: clientTimeZone,
    };

    // Server side pagination (LIMIT = rows per page, OFFSET = rows of the previous pages)
    const {
        logs: currentLogs,
        pagination,
        isLoading,
        isValidating,
        error,
        mutate,
    } = usePaginatedLogs({
        ...filterParams,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        // Page 1 is always fresh; next pages are anchored to page 1's snapshot so
        // logs created in the meantime don't shift the offsets (no duplicated rows).
        snapshot_id: currentPage > 1 ? snapshotId : undefined,
    });

    const { stats, mutate: mutateStats } = useLogStats();

    // `keepPreviousData` may return the previous page while the next one loads;
    // only trust the pagination meta when it belongs to the current request.
    const isCurrentPageData =
        !!pagination &&
        pagination.limit === itemsPerPage &&
        pagination.offset === (currentPage - 1) * itemsPerPage;

    // Capture the snapshot every time page 1 is (re)loaded
    useEffect(() => {
        if (currentPage === 1 && isCurrentPageData && pagination?.snapshot_id) {
            setSnapshotId(pagination.snapshot_id);
        }
    }, [currentPage, isCurrentPageData, pagination?.snapshot_id]);

    // If the total shrank (e.g. logs removed), go back to the last available page
    useEffect(() => {
        if (isCurrentPageData && pagination && currentPage > pagination.total_pages) {
            setCurrentPage(pagination.total_pages);
        }
    }, [isCurrentPageData, pagination, currentPage]);

    const toggleDropdown = (id: number) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
        } else {
            setOpenDropdownId(id);
        }
    };

    // Roles for the filter dropdown (from the stats endpoint, not only the current page)
    const uniqueRoles = stats?.available_roles ?? [];

    // Pagination logic
    const totalEntries = pagination?.total ?? 0;
    const totalPages = pagination?.total_pages ?? 1;
    const remainingEntries = pagination?.remaining ?? 0;
    const remainingPages = pagination?.remaining_pages ?? 0;
    const showingFrom = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingTo = Math.min((currentPage - 1) * itemsPerPage + currentLogs.length, totalEntries);
    const pageNumbers = getPageNumbers(currentPage, totalPages);
    const isPageLoading = isValidating && !isCurrentPageData;

    const goToPage = (page: number) => {
        const target = Math.min(Math.max(1, page), totalPages);
        if (target !== currentPage) setCurrentPage(target);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleRefresh = async () => {
        // Back to page 1 => a fresh request takes a new snapshot, so the newest logs show up.
        // (Changing the page changes the SWR key, which already triggers a refetch.)
        if (currentPage !== 1) {
            setCurrentPage(1);
            await mutateStats();
            return;
        }
        await Promise.all([mutate(), mutateStats()]);
    };

    // Exports need every filtered row (not only the current page)
    const getExportData = async () => {
        const allFilteredLogs = await auditLogApi.all(filterParams);
        return allFilteredLogs.map(log => ({
            "Log ID": log.id,
            "User": log.user?.username || "Unknown",
            "Role": log.user?.role || "N/A",
            "Event": log.action || "UNKNOWN",
            "Resource": log.model_name || "System",
            "Description": log.description,
            "Date": helper.formatStrDate(log.created_at)
        }));
    };

    const exportToExcel = async () => {
        if (exportingRef.current) return;
        exportingRef.current = true;
        setIsExporting(true);
        try {
            setIsExportMenuOpen(false);
            const data = await getExportData();
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            saveAs(blob, "system_logs.xlsx");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to export Excel";
            toast.error(message);
        } finally {
            exportingRef.current = false;
            setIsExporting(false);
        }
    };

    const exportToTxt = async () => {
        if (exportingRef.current) return;
        exportingRef.current = true;
        setIsExporting(true);
        try {
            setIsExportMenuOpen(false);
            const data = await getExportData();
            let txt = "System Logs\n\n";
            data.forEach(row => {
                txt += `ID: ${row["Log ID"]} | User: ${row.User} (${row.Role}) | Event: ${row.Event} | Resource: ${row.Resource}\n`;
                txt += `Description: ${row.Description}\n`;
                txt += `Date: ${row.Date}\n`;
                txt += "--------------------------------------------------\n";
            });
            const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, "system_logs.txt");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to export text file";
            toast.error(message);
        } finally {
            exportingRef.current = false;
            setIsExporting(false);
        }
    };

    const exportToPdf = async () => {
        if (exportingRef.current) return;
        exportingRef.current = true;
        setIsExporting(true);
        try {
            toast.info("Generating logs PDF report...");
            setIsExportMenuOpen(false);
            const blob = await auditLogApi.exportPdf(filterParams);
            saveAs(blob, "system_logs.pdf");
            toast.success("Logs PDF exported successfully!");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to export PDF";
            toast.error(message);
        } finally {
            exportingRef.current = false;
            setIsExporting(false);
        }
    };

    const exportToDocx = async () => {
        if (exportingRef.current) return;
        exportingRef.current = true;
        setIsExporting(true);
        try {
            setIsExportMenuOpen(false);
            const data = await getExportData();

            const doc = new DocxDocument({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "System Audit Logs", bold: true, size: 32 })
                            ]
                        }),
                        new Paragraph({ text: "" }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            },
                            rows: [
                                new TableRow({
                                    children: ["ID", "User", "Event", "Resource", "Date"].map(h =>
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
                                    )
                                }),
                                ...data.map(row =>
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(String(row["Log ID"]))] }),
                                            new TableCell({ children: [new Paragraph(row.User)] }),
                                            new TableCell({ children: [new Paragraph(row.Event)] }),
                                            new TableCell({ children: [new Paragraph(row.Resource)] }),
                                            new TableCell({ children: [new Paragraph(row.Date)] }),
                                        ]
                                    })
                                )
                            ]
                        })
                    ]
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, "system_logs.docx");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to export Word document";
            toast.error(message);
        } finally {
            exportingRef.current = false;
            setIsExporting(false);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Filter Custom Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenFilterDropdown(openFilterDropdown === 'date' ? null : 'date')}
                            className={`flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] rounded-lg px-3 py-2 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors ${openFilterDropdown === 'date' ? 'ring-2 ring-gray-200 dark:ring-gray-700' : ''}`}
                        >
                            <Calendar size={16} className="text-gray-500 shrink-0" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {selectedDate === 'all' ? 'All Time' : selectedDate === 'today' ? 'Today' : selectedDate === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                            </span>
                            <ChevronDown size={14} className="text-gray-400 ml-1" />
                        </button>

                        {openFilterDropdown === 'date' && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenFilterDropdown(null)}></div>
                                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 z-20 py-2">
                                    {[
                                        { value: 'all', label: 'All Time' },
                                        { value: 'today', label: 'Today' },
                                        { value: '7days', label: 'Last 7 Days' },
                                        { value: '30days', label: 'Last 30 Days' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSelectedDate(opt.value); setCurrentPage(1); setOpenFilterDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedDate === opt.value ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Action Filter Custom Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenFilterDropdown(openFilterDropdown === 'action' ? null : 'action')}
                            className={`flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] rounded-lg px-3 py-2 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors ${openFilterDropdown === 'action' ? 'ring-2 ring-gray-200 dark:ring-gray-700' : ''}`}
                        >
                            <Filter size={16} className="text-gray-500 shrink-0" />
                            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {selectedAction === 'all' ? 'All Actions' : selectedAction.toLowerCase()}
                            </span>
                            <ChevronDown size={14} className="text-gray-400 ml-1" />
                        </button>

                        {openFilterDropdown === 'action' && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenFilterDropdown(null)}></div>
                                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 z-20 py-2">
                                    {[
                                        { value: 'all', label: 'All Actions' },
                                        { value: 'CREATE', label: 'Create' },
                                        { value: 'UPDATE', label: 'Update' },
                                        { value: 'DELETE', label: 'Delete' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSelectedAction(opt.value); setCurrentPage(1); setOpenFilterDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedAction === opt.value ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Role Filter Custom Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenFilterDropdown(openFilterDropdown === 'role' ? null : 'role')}
                            className={`flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] rounded-lg px-3 py-2 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors ${openFilterDropdown === 'role' ? 'ring-2 ring-gray-200 dark:ring-gray-700' : ''}`}
                        >
                            <User size={16} className="text-gray-500 shrink-0" />
                            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {selectedRole === 'all' ? 'All Roles' : selectedRole}
                            </span>
                            <ChevronDown size={14} className="text-gray-400 ml-1" />
                        </button>

                        {openFilterDropdown === 'role' && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenFilterDropdown(null)}></div>
                                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 z-20 py-2">
                                    {[{ value: 'all', label: 'All Roles' }, ...uniqueRoles.map(r => ({ value: r, label: r }))].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSelectedRole(opt.value); setCurrentPage(1); setOpenFilterDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors capitalize ${selectedRole === opt.value ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isValidating}
                        title="Refresh logs"
                        className="flex items-center justify-center w-9 h-9 border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] rounded-lg text-gray-500 shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.05] disabled:opacity-60 transition-colors"
                    >
                        <RefreshCw size={16} className={isValidating ? "animate-spin" : ""} />
                    </button>
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => !isExporting && setIsExportMenuOpen(!isExportMenuOpen)}
                            disabled={isExporting}
                            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                            {isExporting ? "Exporting..." : "Export Report"}
                        </button>
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 z-30 py-2">
                                <button
                                    onClick={exportToPdf}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Export as PDF
                                </button>
                                <button
                                    onClick={exportToDocx}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Export as Word (.docx)
                                </button>
                                <button
                                    onClick={exportToExcel}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Export as Excel (.xlsx)
                                </button>
                                <button
                                    onClick={exportToTxt}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Export as Text (.txt)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Thin loading bar while another page is being fetched */}
                {isPageLoading && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#B88E2F]/70 animate-pulse z-10" />
                )}
                <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">USER INFO</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">ACTION & TIME</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-full">RESOURCE DETAILS</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-100 bg-white transition-opacity ${isPageLoading && !isLoading ? 'opacity-60' : ''}`}>
                            {isLoading && (
                                Array.from({ length: 8 }).map((_, idx) => (
                                    <tr key={`log-skeleton-${idx}`} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="h-3.5 w-28 rounded bg-gray-200" />
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-16 rounded bg-gray-100" />
                                                    <div className="h-3 w-8 rounded bg-gray-100" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="h-3.5 w-24 rounded bg-gray-200" />
                                                <div className="h-5 w-16 rounded-full bg-gray-100" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="h-3.5 w-48 rounded bg-gray-200" />
                                                    <div className="h-3 w-64 rounded bg-gray-100" />
                                                </div>
                                                <div className="h-7 w-7 rounded-lg bg-gray-100 shrink-0" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!isLoading && currentLogs.map((log) => (
                                <tr
                                    key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    onKeyDown={(e) => { if (e.key === "Enter") setSelectedLog(log); }}
                                    tabIndex={0}
                                    className={`hover:bg-[#FEF3C7]/30 transition-colors group cursor-pointer focus:outline-none focus:bg-[#FEF3C7]/30 ${selectedLog?.id === log.id ? 'bg-[#FEF3C7]/40' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-[#0f172a] truncate">
                                                {log.user?.username || "Unknown User"}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded text-gray-600 bg-gray-100">
                                                    <User size={10} className="mr-1" />
                                                    {log.user?.role || "N/A"}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-medium">#{log.user?.id || log.user_id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-[#0f172a]">
                                                {helper.formatStrDate(log.created_at)}
                                            </span>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full ${log.action?.toUpperCase() === 'DELETE' ? 'text-red-600 bg-red-50' :
                                                    log.action?.toUpperCase() === 'UPDATE' ? 'text-[#997524] bg-[#FEF3C7]' :
                                                        log.action?.toUpperCase() === 'CREATE' ? 'text-emerald-600 bg-emerald-50' :
                                                            'text-amber-600 bg-amber-50'
                                                    }`}>
                                                    {log.action?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col pr-8">
                                                <div className="flex items-center gap-2">
                                                    <Database size={13} className="text-gray-400" />
                                                    <span className="text-[13px] font-semibold text-[#0f172a]">
                                                        {log.model_name || "System"}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-[12px] text-gray-500 max-w-lg">
                                                    {log.description}
                                                </div>
                                            </div>

                                            {/* Action Menu (clicks here must not trigger the row click) */}
                                            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleDropdown(log.id)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {openDropdownId === log.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-0" onClick={() => setOpenDropdownId(null)}></div>
                                                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-2">
                                                            <div className="px-4 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                                                                More Action
                                                            </div>
                                                            <button
                                                                onClick={() => { setSelectedLog(log); setOpenDropdownId(null); }}
                                                                className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                                            >
                                                                <ShieldAlert size={14} className="mr-2 text-gray-400" />
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-[13px] font-bold text-red-400">
                                        Failed to load logs. Please try again.
                                    </td>
                                </tr>
                            )}
                            {!isLoading && !error && currentLogs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-[13px] font-bold text-gray-400">
                                        No logs match the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalEntries > 0 && (
                <div className="flex flex-col lg:flex-row items-center justify-between px-6 py-4 mt-2 bg-white rounded-xl border border-gray-200 shadow-sm gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full lg:w-auto justify-between lg:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-500">Show</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-200 bg-white rounded-md text-[13px] py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#B88E2F] cursor-pointer"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <span className="text-[13px] font-bold text-gray-500">entries</span>
                        </div>
                        <div className="flex flex-col items-center sm:items-start">
                            <p className="text-[13px] font-bold text-gray-500">
                                Showing {showingFrom.toLocaleString()} to {showingTo.toLocaleString()} of {totalEntries.toLocaleString()} entries
                            </p>
                            <p className="text-[11px] font-semibold text-gray-400">
                                Page {currentPage} of {totalPages}
                                {remainingEntries > 0
                                    ? ` · ${remainingEntries.toLocaleString()} entries remaining in ${remainingPages} more page${remainingPages > 1 ? 's' : ''}`
                                    : ' · No more entries'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-full lg:w-auto">
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                title="First page"
                                className="rounded-l-md border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                <ChevronsLeft size={14} />
                            </button>
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                title="Previous page"
                                className="border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {pageNumbers.map((p, idx) =>
                                p === "ellipsis" ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="border border-gray-200 px-3 py-1.5 text-[13px] font-semibold text-gray-400 select-none"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => goToPage(p)}
                                        aria-current={p === currentPage ? "page" : undefined}
                                        className={`border px-3 py-1.5 font-semibold text-[13px] transition ${p === currentPage
                                            ? 'relative z-10 bg-[#B88E2F] border-[#B88E2F] text-white'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                                title="Next page"
                                className="border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage >= totalPages}
                                title="Last page"
                                className="rounded-r-md border border-gray-200 px-2 py-1.5 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                <ChevronsRight size={14} />
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Log Detail Right Side Drawer */}
            {selectedLog && (
                <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </div>
    );
}
