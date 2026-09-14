'use client';

import { useNavigate } from "react-router";
import { Staff } from "../../interfaces/staff";
import { staffApi } from "../../api/staffApi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import {
    MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, Search,
    LayoutGrid, List, X, Mail, Phone, MapPin, Briefcase, User, BadgeCheck
} from "lucide-react";

export default function StaffTable({
    staffs, setStaffs,
}: {
    staffs: Staff[];
    setStaffs: React.Dispatch<React.SetStateAction<Staff[]>>;
}) {
    const navigate = useNavigate();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<Staff | null>(null);

    const toggleDropdown = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null); setDropdownPos(null);
        } else {
            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const topPos = spaceBelow < 200 ? rect.top - 120 : rect.bottom + 4;
            setDropdownPos({ top: topPos, right: window.innerWidth - rect.right });
            setOpenDropdownId(id);
        }
    };

    useEffect(() => {
        if (openDropdownId === null) return;
        const close = () => { setOpenDropdownId(null); setDropdownPos(null); };
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [openDropdownId]);

    const handleDeleteClick = (item: Staff) => {
        setDeleteTarget(item); setDeleteOpen(true); setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const msg = await staffApi.delete(deleteTarget.id);
            toast.success(msg || "Deleted.");
            setStaffs((prev) => prev.filter((i) => i.id !== deleteTarget.id));
            setDeleteOpen(false); setDeleteTarget(null);
        } catch (err: any) { toast.error(err?.message || "Delete failed!"); }
    };

    const confirmBulkDelete = async () => {
        try {
            await Promise.all([...selectedIds].map(id => staffApi.delete(id)));
            toast.success(`${selectedIds.size} staff(s) deleted.`);
            setStaffs(prev => prev.filter(i => !selectedIds.has(i.id)));
            setSelectedIds(new Set()); setBulkDeleteOpen(false);
        } catch (err: any) { toast.error(err?.message || "Bulk delete failed!"); }
    };

    const toggleSelectAll = () => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (isAllSelected) { currentItems.forEach(i => next.delete(i.id)); }
            else { currentItems.forEach(i => next.add(i.id)); }
            return next;
        });
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // Filter Logic
    const filteredItems = staffs.filter(item => {
        // Tab filter
        if (activeTab === 'male' && item.staff_gender?.toLowerCase() !== 'male') return false;
        if (activeTab === 'female' && item.staff_gender?.toLowerCase() !== 'female') return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const match =
                item.staff_name?.toLowerCase().includes(query) ||
                item.staff_email?.toLowerCase().includes(query) ||
                item.department?.department_name?.toLowerCase().includes(query) ||
                item.role?.role_name?.toLowerCase().includes(query);
            if (!match) return false;
        }
        return true;
    });

    // Stats for tabs
    const stats = {
        all: staffs.length,
        male: staffs.filter(s => s.staff_gender?.toLowerCase() === 'male').length,
        female: staffs.filter(s => s.staff_gender?.toLowerCase() === 'female').length,
    };

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const isAllSelected = currentItems.length > 0 && currentItems.every(i => selectedIds.has(i.id));
    const isIndeterminate = !isAllSelected && currentItems.some(i => selectedIds.has(i.id));

    const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    const getAvatarColor = (name: string) => {
        const colors = ['bg-red-100 text-red-600', 'bg-blue-100 text-[#997524]', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600'];
        const charCode = name?.charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    return (
        <div className="w-full">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 mb-6">
                {/* Search Row */}
                <div className="flex items-center mx-2 my-2 px-4 py-1 border border-gray-200 rounded-full bg-white">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name, email, department or role..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-500 px-3 py-2 placeholder-gray-400"
                    />
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Tabs row + view toggle */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 pt-2 pb-1">
                    {/* Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'all' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            All <span className={`text-[12px] font-bold ${activeTab === 'all' ? 'text-white/90' : 'text-gray-400'}`}>{stats.all}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('male'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'male' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'male' ? 'bg-white' : 'bg-[#3b82f6]'}`}></span>
                            Male <span className={`text-[12px] font-bold ${activeTab === 'male' ? 'text-white/90' : 'text-gray-400'}`}>{stats.male}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('female'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'female' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'female' ? 'bg-white' : 'bg-[#a855f7]'}`}></span>
                            Female <span className={`text-[12px] font-bold ${activeTab === 'female' ? 'text-white/90' : 'text-gray-400'}`}>{stats.female}</span>
                        </button>
                    </div>

                    {/* Right side: count + view toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="h-5 w-px bg-gray-200 mx-1"></div>
                        <span className="text-[13px] font-bold text-gray-500">
                            {filteredItems.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} of {filteredItems.length}
                        </span>
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button onClick={() => setViewMode("list")} className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-800 bg-transparent'}`}><List size={15} /></button>
                            <button onClick={() => setViewMode("grid")} className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-800 bg-transparent'}`}><LayoutGrid size={15} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content View */}
            {viewMode === "list" ? (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                        <table className="w-full min-w-[750px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest w-10">
                                        <input type="checkbox" checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={toggleSelectAll} className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer" />
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Department</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Gender</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setDetailItem(item)}
                                        className={`hover:bg-[#FEF3C7]/30 transition-colors group cursor-pointer ${selectedIds.has(item.id) ? 'bg-[#FEF3C7]/50' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelectOne(item.id)} className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer" />
                                        </td>
                                        <td className="px-6 py-4 min-w-[220px]">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(item.staff_name || "S")}`}>
                                                    {item.staff_name?.[0]?.toUpperCase() || "S"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-[#0f172a] truncate max-w-[180px]">{item.staff_name}</span>
                                                    <span className="text-[12px] font-medium text-gray-400 truncate max-w-[180px]">{item.staff_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-medium text-gray-600 truncate max-w-[180px]">{item.department?.department_name || "—"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-[#FEF3C7] text-[#997524]">
                                                {item.role?.role_name || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${item.staff_gender?.toLowerCase() === 'female' ? 'bg-[#fdf4ff] text-[#a855f7]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.staff_gender?.toLowerCase() === 'female' ? 'bg-[#a855f7]' : 'bg-[#3b82f6]'}`}></span>
                                                {item.staff_gender || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                            <button onClick={(e) => toggleDropdown(item.id, e)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[13px] font-bold text-gray-400">No staff found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setDetailItem(item)}
                            className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all cursor-pointer hover:border-blue-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(item.staff_name || "S")}`}>
                                        {item.staff_name?.[0]?.toUpperCase() || "S"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-extrabold text-[#0f172a] truncate max-w-[150px]">{item.staff_name}</span>
                                        <span className="text-[13px] font-medium text-gray-500 truncate max-w-[150px]">{item.staff_email}</span>
                                    </div>
                                </div>
                                <div onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => toggleDropdown(item.id, e)} className="p-1 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-[#FEF3C7] text-[#997524]">
                                    {item.role?.role_name || "—"}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${item.staff_gender?.toLowerCase() === 'female' ? 'bg-[#fdf4ff] text-[#a855f7]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
                                    {item.staff_gender || "—"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-semibold">
                                    <Briefcase size={14} className="text-gray-400 shrink-0" />
                                    <span className="truncate">{item.department?.department_name || "—"}</span>
                                </div>
                                {item.staff_ph_number && (
                                    <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-semibold">
                                        <Phone size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate">{item.staff_ph_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[13px] font-bold text-gray-400 bg-white rounded-xl border border-gray-100">
                            No staff found.
                        </div>
                    )}
                </div>
            )}

            {/* Fixed dropdown portal */}
            {openDropdownId !== null && dropdownPos && (() => {
                const item = currentItems.find(i => i.id === openDropdownId);
                if (!item) return null;
                return (
                    <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setDropdownPos(null); }} />
                        <div className="fixed z-50 w-44 bg-white rounded-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/staff/edit/${item.id}`); setOpenDropdownId(null); setDropdownPos(null); }}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
                            >
                                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center group-hover/item:bg-blue-100 transition-colors"><Pencil size={14} className="text-[#B88E2F]" /></div>
                                Edit
                            </button>
                            <div className="h-px bg-gray-100 my-1 mx-3"></div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors group/item"
                            >
                                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover/item:bg-red-100 transition-colors"><Trash2 size={14} className="text-red-500" /></div>
                                Delete
                            </button>
                        </div>
                    </>
                );
            })()}

            {/* Pagination Controls */}
            {filteredItems.length > 0 && (
                <div className="flex items-center justify-between pt-5">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold text-gray-500">Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30"
                        >
                            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                .reduce<(number | '...')[]>((acc, page, idx, arr) => {
                                    if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                    acc.push(page);
                                    return acc;
                                }, [])
                                .map((item, idx) =>
                                    item === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setCurrentPage(item as number)}
                                            className={`relative inline-flex items-center px-4 py-2 text-[13px] font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 transition-colors ${currentPage === item ? 'z-10 bg-[#B88E2F] text-white' : 'text-gray-900 hover:bg-gray-50'}`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteOpen}
                title="Delete Staff"
                message={`Are you sure you want to delete "${deleteTarget?.staff_name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteOpen(false)}
            />

            {/* Floating bulk-action bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white border border-gray-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] rounded-2xl px-6 py-3 animate-in slide-in-from-bottom-4 duration-200">
                    <span className="text-[14px] font-bold text-gray-800">{selectedIds.size} selected</span>
                    <div className="h-5 w-px bg-gray-200"></div>
                    <button onClick={() => setSelectedIds(new Set())} className="text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">Clear</button>
                    <button onClick={() => setBulkDeleteOpen(true)} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"><Trash2 size={14} />Delete</button>
                </div>
            )}

            {/* Bulk delete modal */}
            {bulkDeleteOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm" onClick={() => setBulkDeleteOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete {selectedIds.size} staff{selectedIds.size > 1 ? 's' : ''}?</h2>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">These records will be permanently removed. This can't be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setBulkDeleteOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={confirmBulkDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Staff detail slide panel */}
            {detailItem && (() => {
                const avatarClass = getAvatarColor(detailItem.staff_name || "S");
                return (
                    <>
                        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
                        <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="text-[15px] font-extrabold text-gray-900">Staff Details</span>
                                <button onClick={() => setDetailItem(null)} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                                {/* Avatar + name */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0 ${avatarClass}`}>
                                        {detailItem.staff_name?.[0]?.toUpperCase() || "S"}
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-extrabold text-gray-900 leading-tight">{detailItem.staff_name}</h2>
                                        <p className="text-[13px] text-gray-400 font-medium mt-0.5">ID: {detailItem.staff_id || `#${detailItem.id}`}</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-[#FEF3C7] text-[#997524]">
                                        <BadgeCheck size={11} />
                                        {detailItem.role?.role_name || "—"}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${detailItem.staff_gender?.toLowerCase() === 'female' ? 'bg-[#fdf4ff] text-[#a855f7]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${detailItem.staff_gender?.toLowerCase() === 'female' ? 'bg-[#a855f7]' : 'bg-[#3b82f6]'}`}></span>
                                        {detailItem.staff_gender || "—"}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-100 mb-6"></div>

                                {/* Detail fields */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Mail size={14} className="text-gray-500" /></div>
                                            <p className="text-[13px] font-bold text-gray-800">{detailItem.staff_email || "—"}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Briefcase size={14} className="text-gray-500" /></div>
                                            <p className="text-[13px] font-bold text-gray-800">{detailItem.department?.department_name || "—"}</p>
                                        </div>
                                    </div>

                                    {detailItem.rank?.rank_name && (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Rank</p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><User size={14} className="text-gray-500" /></div>
                                                <p className="text-[13px] font-bold text-gray-800">{detailItem.rank.rank_name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {detailItem.staff_ph_number && (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Phone size={14} className="text-gray-500" /></div>
                                                <p className="text-[13px] font-bold text-gray-800">{detailItem.staff_ph_number}</p>
                                            </div>
                                        </div>
                                    )}

                                    {detailItem.staff_address && (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><MapPin size={14} className="text-gray-500" /></div>
                                                <p className="text-[13px] font-bold text-gray-800">{detailItem.staff_address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => { navigate(`/staff/edit/${detailItem.id}`); setDetailItem(null); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Pencil size={15} /> Edit
                                </button>
                                <button
                                    onClick={() => { handleDeleteClick(detailItem); setDetailItem(null); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors"
                                >
                                    <Trash2 size={15} /> Delete
                                </button>
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );
}
