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
import { Search, Trash2, FileText, FileSpreadsheet, File, ChevronLeft, ChevronRight, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";


type DataTableProps<T extends { id: number }> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  isLoading?: boolean;
  tableTitle?: string;
  headerActions?: React.ReactNode;
  renderDetailPanel?: (row: T, onClose: () => void) => React.ReactNode;
};

export function DataTable<T extends { id: number }>({
  data,
  columns,
  isLoading = false,
  tableTitle,
  headerActions,
  renderDetailPanel,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const [globalFilter, setGlobalFilter] = useState("");
    const [rowSelection, setRowSelection] = useState({});
    const [detailRow, setDetailRow] = useState<T | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter, rowSelection },

        onGlobalFilterChange: setGlobalFilter,

        globalFilterFn: (row, value) => {
            const search = String(value)
                .toLowerCase()
                .normalize("NFKC");

            const flatten = (obj : unknown):string => {
                if (obj == null) return "";

                if (typeof obj === "string" || typeof obj === "number") {
                    return String(obj);
                }

                if (obj instanceof Date) {
                    return obj.toISOString();
                }

                if (Array.isArray(obj)) {
                    return obj.map(flatten).join(" ");
                }

                if (typeof obj === "object") {
                    return Object.values(obj).map(flatten).join(" ");
                }

                return "";
            };

            const dataString = flatten(row.original)
                .toLowerCase()
                .normalize("NFKC");

            return dataString.includes(search);
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

    const exportPDF = () => {
        const doc = new jsPDF();

        autoTable(doc, {
            head: [Object.keys(exportData[0] || {})],
            body: exportData.map(Object.values),
        });

        doc.save("documents.pdf");
    };
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");

        XLSX.writeFile(workbook, "documents.xlsx");
    };
    const exportWord = async () => {
        const tableRows = exportData.map(
            (row) =>
                new TableRow({
                    children: Object.values(row).map(
                        (cell) =>
                            new TableCell({
                                children: [new Paragraph(String(cell ?? ""))],
                            })
                    ),
                })
        );

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Table({
                            rows: tableRows,
                        }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "documents.docx");
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
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
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
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                                    className="rounded border border-gray-200 px-2 py-1 focus:ring-[#B88E2F] focus:border-[#B88E2F] outline-none bg-white transition-all hover:border-gray-300"
                                >
                                    {[5, 10, 20, 50].map((size) => (
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
                                    // Custom bulk delete hook or prop
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
                            <button onClick={exportPDF} className="p-1 rounded transition-colors text-gray-400 hover:text-red-500 hover:bg-white shadow-sm" title="Export PDF">
                                <FileText size={15} />
                            </button>
                            <button onClick={exportExcel} className="p-1 rounded transition-colors text-gray-400 hover:text-green-600 hover:bg-white shadow-sm" title="Export Excel">
                                <FileSpreadsheet size={15} />
                            </button>
                            <button onClick={exportWord} className="p-1 rounded transition-colors text-gray-400 hover:text-[#997524] hover:bg-white shadow-sm" title="Export Word">
                                <File size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div>
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

                        <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={table.getAllColumns().length} className="text-center py-12 text-[13px] font-bold text-gray-400">
                                        {t("Loading data...")}
                                    </td>
                                </tr>
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
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white">
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <p className="text-[13px] font-semibold text-gray-700">
                            {t("Showing")} <span className="font-bold">{table.getFilteredRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0}</span> {t("to")} <span className="font-bold">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> {t("of")} <span className="font-bold">{table.getFilteredRowModel().rows.length}</span> {t("entries")}
                        </p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0">
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                disabled={!table.getCanPreviousPage()}
                                onClick={() => table.previousPage()}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                disabled={!table.getCanNextPage()}
                                onClick={() => table.nextPage()}
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
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
