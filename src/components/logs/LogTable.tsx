import { useState, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document as DocxDocument, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { Log } from "../../interfaces/log";
import { helper } from "../../helpers/utils";
import { useLogs } from "../../hooks/useLogs";
import {
    MoreVertical,
    User,
    Calendar,
    Filter,
    Download,
    Database,
    ShieldAlert,
    ChevronDown
} from "lucide-react";

interface LogTableProps {
    logs?: Log[];
    isLoading?: boolean;
}

export default function LogTable({ logs: propLogs, isLoading: propIsLoading }: LogTableProps = {}) {
    const swr = useLogs();
    const logs = propLogs !== undefined ? propLogs : swr.logs;
    const isLoading = propIsLoading !== undefined ? propIsLoading : swr.isLoading;

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
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

    const toggleDropdown = (id: number) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
        } else {
            setOpenDropdownId(id);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading logs...</div>;
    }

    // Extract unique roles for the filter dropdown
    const uniqueRoles = Array.from(new Set(logs.map(log => log.user?.role).filter(Boolean)));

    // Filtering logic
    const filteredLogs = logs.filter(log => {
        // Date filter
        let dateMatch = true;
        if (selectedDate !== "all") {
            const logDate = new Date(log.created_at);
            const now = new Date();
            if (selectedDate === "today") {
                dateMatch = logDate.toDateString() === now.toDateString();
            } else if (selectedDate === "7days") {
                const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateMatch = logDate >= past;
            } else if (selectedDate === "30days") {
                const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                dateMatch = logDate >= past;
            }
        }

        // Action filter
        let actionMatch = true;
        if (selectedAction !== "all") {
            actionMatch = (log.action?.toUpperCase() === selectedAction);
        }

        // Role filter
        let roleMatch = true;
        if (selectedRole !== "all") {
            roleMatch = (log.user?.role === selectedRole);
        }

        return dateMatch && actionMatch && roleMatch;
    });

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
    const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const getExportData = () => {
        return filteredLogs.map(log => ({
            "Log ID": log.id,
            "User": log.user?.username || "Unknown",
            "Role": log.user?.role || "N/A",
            "Event": log.action || "UNKNOWN",
            "Resource": log.model_name || "System",
            "Description": log.description,
            "Date": helper.formatStrDate(log.created_at)
        }));
    };

    const exportToExcel = () => {
        const data = getExportData();
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, "system_logs.xlsx");
        setIsExportMenuOpen(false);
    };

    const exportToTxt = () => {
        const data = getExportData();
        let txt = "System Logs\n\n";
        data.forEach(row => {
            txt += `ID: ${row["Log ID"]} | User: ${row.User} (${row.Role}) | Event: ${row.Event} | Resource: ${row.Resource}\n`;
            txt += `Description: ${row.Description}\n`;
            txt += `Date: ${row.Date}\n`;
            txt += "--------------------------------------------------\n";
        });
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "system_logs.txt");
        setIsExportMenuOpen(false);
    };

    const exportToPdf = () => {
        const doc = new jsPDF();
        const data = getExportData();

        doc.text("System Audit Logs", 14, 15);

        const tableColumn = ["Log ID", "User", "Role", "Event", "Resource", "Date"];
        const tableRows = data.map(row => [
            row["Log ID"],
            row.User,
            row.Role,
            row.Event,
            row.Resource,
            row.Date
        ]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save("system_logs.pdf");
        setIsExportMenuOpen(false);
    };

    const exportToDocx = async () => {
        const data = getExportData();

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
        setIsExportMenuOpen(false);
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
                                    {[{ value: 'all', label: 'All Roles' }, ...uniqueRoles.map(r => ({ value: r as string, label: r as string }))].map((opt) => (
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
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                    >
                        <Download size={16} />
                        Export Report
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

            {/* Table Area */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">USER INFO</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">ACTION & TIME</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-full">RESOURCE DETAILS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#FEF3C7]/30 transition-colors group">
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
                                                <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                                    log.action?.toUpperCase() === 'DELETE' ? 'text-red-600 bg-red-50' :
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

                                            {/* Action Menu */}
                                            <div className="relative flex-shrink-0">
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
                                                            <button className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
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
                            {filteredLogs.length === 0 && !isLoading && (
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
            {filteredLogs.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 mt-2 bg-white rounded-xl border border-gray-200 shadow-sm gap-4 sm:gap-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
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
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-[13px] font-bold text-gray-500">entries</span>
                        </div>
                        <p className="text-[13px] font-bold text-gray-500 hidden sm:block">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                        </p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="rounded-l-md border border-gray-200 px-3 py-1.5 font-semibold text-[13px] text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="rounded-r-md border-y border-r border-gray-200 px-3 py-1.5 font-semibold text-[13px] text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}