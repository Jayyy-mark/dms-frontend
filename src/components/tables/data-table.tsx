'use client';

import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
import { Search, Trash2, FileText, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import ActionButton from "../ui/button/ActionButton";
import ServerPaginationBar, { PAGE_SIZE_OPTIONS } from "../common/ServerPaginationBar";

export interface DataTableServerPagination {
    currentPage: number;
    itemsPerPage: number;
    totalEntries: number;
    totalPages: number;
    remainingEntries?: number;
    remainingPages?: number;
    isPageLoading?: boolean;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (limit: number) => void;
}

type DataTableProps<T extends { id: number }> = {
    data: T[];
    columns: ColumnDef<T, any>[];
    isLoading?: boolean;
    tableTitle?: string;
    headerActions?: React.ReactNode;
    renderDetailPanel?: (row: T, onClose: () => void) => React.ReactNode;
    onExportPDF?: (currentFilter?: string) => void | Promise<unknown>;
    serverPagination?: DataTableServerPagination;
};

export function DataTable<T extends { id: number }>({
    data,
    columns,
    isLoading = false,
    tableTitle,
    headerActions,
    renderDetailPanel,
    onExportPDF,
    serverPagination,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const [globalFilter, setGlobalFilter] = useState("");
    const [rowSelection, setRowSelection] = useState({});
    const [detailRow, setDetailRow] = useState<T | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const isServerPaginated = Boolean(serverPagination);
    const activeSearch = isServerPaginated ? (serverPagination?.searchValue ?? "") : globalFilter;

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter, rowSelection },
        manualPagination: isServerPaginated,
        manualFiltering: isServerPaginated,
        onGlobalFilterChange: setGlobalFilter,

        globalFilterFn: (row, columnId, filterValue) => {
            const search = String(filterValue ?? "")
                .toLowerCase()
                .trim()
                .normalize("NFKC");

            if (!search) return true;

            const value = row.getValue(columnId);
            if (value != null) {
                const str = String(value).toLowerCase().normalize("NFKC");
                return str.includes(search);
            }
            return false;
        },
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });
    const exportData = table
        .getFilteredRowModel()
        .rows.map((row) => row.original);

    const handleExportPDF = async () => {
        if (onExportPDF) {
            await onExportPDF(activeSearch);
            return;
        }

        const doc = new jsPDF();

        autoTable(doc, {
            head: [Object.keys(exportData[0] || {})],
            body: exportData.map(Object.values),
        });

        doc.save("documents.pdf");
    };

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-2 border-b border-gray-100">
                {/* Search Row */}
                <div className="flex items-center mx-2 my-2 px-4 py-1 border border-gray-200 rounded-full bg-white">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder={t("Search...")}
                        value={activeSearch}
                        onChange={(e) => {
                            if (isServerPaginated && serverPagination?.onSearchChange) {
                                serverPagination.onSearchChange(e.target.value);
                            } else {
                                setGlobalFilter(e.target.value);
                            }
                        }}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-500 px-3 py-2 placeholder-gray-400"
                    />
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Tabs row + filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 pt-2 pb-1">
                    {/* Left Side: Title / Show Entries */}
                    <div className="flex flex-wrap items-center gap-2">
                        {tableTitle ? (
                            <h2 className="text-[13px] font-bold text-gray-800 px-2 py-1">{t(tableTitle)}</h2>
                        ) : (
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 px-2">
                                <span>{t("Show")}</span>
                                <select
                                    value={isServerPaginated ? serverPagination!.itemsPerPage : table.getState().pagination.pageSize}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (isServerPaginated) {
                                            serverPagination!.onItemsPerPageChange(val);
                                        } else {
                                            table.setPageSize(val);
                                        }
                                    }}
                                    className="rounded border border-gray-200 px-2 py-1 focus:ring-[#B88E2F] focus:border-[#B88E2F] outline-none bg-white transition-all hover:border-gray-300"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <span>{t("entries")}</span>
                            </div>
                        )}
                    </div>

                    {/* Right side: Actions & Export */}
                    <div className="flex items-center gap-2 shrink-0">
                        {headerActions}

                        {table.getSelectedRowModel().rows.length > 0 && (
                            <button
                                onClick={() => {
                                    console.log("Bulk delete");
                                }}
                                className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-bold text-red-600 transition hover:bg-red-100 shadow-sm"
                            >
                                <Trash2 size={13} />
                                {t("Delete Selected")}
                            </button>
                        )}

                        {/* Export Buttons */}
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 gap-1">
                            <ActionButton onClick={handleExportPDF} className="p-1 rounded transition-colors text-gray-400 hover:text-red-500 hover:bg-white shadow-sm" title="Export PDF">
                                <FileText size={15} />
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div>
                {serverPagination?.isPageLoading && (
                    <div className="h-0.5 w-full bg-[#B88E2F]/20 overflow-hidden">
                        <div className="h-full w-1/3 bg-[#B88E2F] animate-pulse" />
                    </div>
                )}
                <div className="overflow-x-auto custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    headerGroup.headers.map((header) => {
                                        const headerContent = header.column.columnDef.header;
                                        const renderedHeader = typeof headerContent === "string"
                                            ? t(headerContent)
                                            : flexRender(headerContent, header.getContext());
                                        return (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {renderedHeader}
                                                    {header.column.getIsSorted() === "asc" && " ↑"}
                                                    {header.column.getIsSorted() === "desc" && " ↓"}
                                                </div>
                                            </th>
                                        );
                                    })
                                ))}
                            </tr>
                        </thead>

                        <tbody className={`divide-y divide-gray-100 bg-white transition-opacity ${serverPagination?.isPageLoading ? "opacity-60" : ""}`}>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, rowIdx) => (
                                    <tr key={`skeleton-row-${rowIdx}`} className="animate-pulse">
                                        {table.getAllColumns().map((col, colIdx) => (
                                            <td key={`skeleton-cell-${rowIdx}-${col.id || colIdx}`} className="px-6 py-4 whitespace-nowrap">
                                                {col.id === 'select' ? (
                                                    <div className="w-4 h-4 rounded bg-gray-200" />
                                                ) : col.id === 'actions' ? (
                                                    <div className="w-7 h-7 rounded-md bg-gray-100 ml-auto" />
                                                ) : colIdx === 1 ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                                                        <div className="space-y-1.5">
                                                            <div className="h-3.5 w-32 rounded bg-gray-200" />
                                                            <div className="h-2.5 w-20 rounded bg-gray-100" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-3.5 w-24 rounded bg-gray-200" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => setDetailRow(row.original)}
                                        className={`hover:bg-[#FEF3C7]/30 transition-colors group cursor-pointer ${row.getIsSelected() ? 'bg-[#FEF3C7]/50' : ''}`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                title={String(cell.getValue() ?? "")}
                                                className="px-6 py-4 text-[13px] font-semibold text-[#0f172a] whitespace-nowrap"
                                                onClick={cell.column.id === 'select' || cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={table.getAllColumns().length} className="text-center py-12 text-[13px] font-bold text-gray-400">
                                        {t("No Data Available")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {isServerPaginated && serverPagination ? (
                    !isLoading && serverPagination.totalEntries > 0 && (
                        <ServerPaginationBar
                            currentPage={serverPagination.currentPage}
                            itemsPerPage={serverPagination.itemsPerPage}
                            totalEntries={serverPagination.totalEntries}
                            totalPages={serverPagination.totalPages}
                            remainingEntries={serverPagination.remainingEntries}
                            remainingPages={serverPagination.remainingPages}
                            currentCount={data.length}
                            onPageChange={serverPagination.onPageChange}
                            onItemsPerPageChange={serverPagination.onItemsPerPageChange}
                            className="border-t border-gray-100"
                        />
                    )
                ) : (
                    !isLoading && table.getFilteredRowModel().rows.length > 0 && (
                        <ServerPaginationBar
                            currentPage={table.getState().pagination.pageIndex + 1}
                            itemsPerPage={table.getState().pagination.pageSize}
                            totalEntries={table.getFilteredRowModel().rows.length}
                            totalPages={Math.max(1, table.getPageCount())}
                            currentCount={table.getRowModel().rows.length}
                            onPageChange={(page) => table.setPageIndex(page - 1)}
                            onItemsPerPageChange={(limit) => {
                                table.setPageSize(limit);
                                table.setPageIndex(0);
                            }}
                            className="border-t border-gray-100"
                        />
                    )
                )}
            </div>

            {/* ── Floating bulk-action bar ── */}
            {table.getSelectedRowModel().rows.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white border border-gray-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] rounded-2xl px-6 py-3 animate-in slide-in-from-bottom-4 duration-200">
                    <span className="text-[14px] font-bold text-gray-800">
                        {table.getSelectedRowModel().rows.length} selected
                    </span>
                    <div className="h-5 w-px bg-gray-200"></div>
                    <button
                        onClick={() => setRowSelection({})}
                        className="text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setBulkDeleteOpen(true)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            )}

            {/* ── Bulk delete confirmation modal ── */}
            {bulkDeleteOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm" onClick={() => setBulkDeleteOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete {table.getSelectedRowModel().rows.length} item(s)?</h2>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">This action cannot be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setBulkDeleteOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        console.log("Bulk Delete Placeholder - Implement parent callback here if needed.");
                                        setBulkDeleteOpen(false);
                                        setRowSelection({});
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Row Detail Slide Panel ── */}
            {detailRow && (
                renderDetailPanel ? (
                    renderDetailPanel(detailRow, () => setDetailRow(null))
                ) : (
                    <>
                        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm" onClick={() => setDetailRow(null)} />
                        <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="text-[15px] font-extrabold text-gray-900">Details</span>
                                <button onClick={() => setDetailRow(null)} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                                {Object.entries(detailRow as object)
                                    .filter(([key]) => !['select', 'actions'].includes(key))
                                    .map(([key, val]) => {
                                        if (val === undefined || val === null || val === "") return null;
                                        return (
                                            <div key={key} className="border-b border-gray-50 pb-3">
                                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{key.replace(/_/g, " ")}</p>
                                                <p className="text-[13px] font-semibold text-gray-700">
                                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                )
            )}
        </div>
    );
}
