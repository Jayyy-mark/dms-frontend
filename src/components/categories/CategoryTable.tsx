'use client';

import { useNavigate } from "react-router";
import { Category } from "../../interfaces/category";
import { categoryApi } from "../../api/categoryApi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import {
    MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, Search,
    LayoutGrid, List, X, FolderOpen
} from "lucide-react";
import Select from "react-select";

export default function CategoryTable({
    categorys, setCategories,
}: {
    categorys: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}) {
    const navigate = useNavigate();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<Category | null>(null);

    // Inline Edit State for detail panel
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [editName, setEditName] = useState("");
    const [editParentId, setEditParentId] = useState<string>("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

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

    const handleDeleteClick = (item: Category) => {
        setDeleteTarget(item); setDeleteOpen(true); setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const msg = await categoryApi.delete(deleteTarget.id);
            toast.success(msg || "Deleted.");
            setCategories((prev) => prev.filter((i) => i.id !== deleteTarget.id));
            setDeleteOpen(false); setDeleteTarget(null);
        } catch (err: any) { toast.error(err?.message || "Delete failed!"); }
    };

    const confirmBulkDelete = async () => {
        try {
            await Promise.all([...selectedIds].map(id => categoryApi.delete(id)));
            toast.success(`${selectedIds.size} category(s) deleted.`);
            setCategories(prev => prev.filter(i => !selectedIds.has(i.id)));
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

    const handleSaveEdit = async () => {
        if (!detailItem) return;
        if (!editName.trim()) {
            toast.error("Category name cannot be empty");
            return;
        }
        setIsSavingEdit(true);
        try {
            await categoryApi.update({
                id: detailItem.id,
                category_id: detailItem.category_id,
                category_name: editName,
                parent_id: editParentId === "" ? "" : editParentId
            });
            toast.success("Category updated successfully!");
            const updatedParent = editParentId ? safeCategories.find(c => String(c.id) === editParentId) : undefined;
            const newValues = { 
                category_name: editName, 
                parent_id: editParentId === "" ? "" : editParentId,
                parent: updatedParent
            };
            setCategories(prev => prev.map(i => i.id === detailItem.id ? { ...i, ...newValues } : i));
            setDetailItem(prev => prev ? { ...prev, ...newValues } : null);
            setIsEditingDetail(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update category");
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Filter Logic
    const safeCategories = Array.isArray(categorys) ? categorys : [];
    const filteredItems = safeCategories.filter(item => {
        // Tab filter
        if (activeTab === 'main' && item.parent_id) return false;
        if (activeTab === 'sub' && !item.parent_id) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const match =
                item.category_name?.toLowerCase().includes(query) ||
                item.category_id?.toLowerCase().includes(query) ||
                item.parent?.category_name?.toLowerCase().includes(query);
            if (!match) return false;
        }
        return true;
    });

    // Stats for tabs
    const stats = {
        all: safeCategories.length,
        main: safeCategories.filter(c => !c.parent_id).length,
        sub: safeCategories.filter(c => !!c.parent_id).length,
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
                        placeholder="Search by category name, ID, or parent..."
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
                            onClick={() => { setActiveTab('main'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'main' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'main' ? 'bg-white' : 'bg-[#3b82f6]'}`}></span>
                            Main <span className={`text-[12px] font-bold ${activeTab === 'main' ? 'text-white/90' : 'text-gray-400'}`}>{stats.main}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('sub'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'sub' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'sub' ? 'bg-white' : 'bg-[#22c55e]'}`}></span>
                            Sub <span className={`text-[12px] font-bold ${activeTab === 'sub' ? 'text-white/90' : 'text-gray-400'}`}>{stats.sub}</span>
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
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Category Name</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Parent Category</th>
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
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(item.category_name || "C")}`}>
                                                    {item.category_name?.[0]?.toUpperCase() || "C"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-[#0f172a] truncate max-w-[180px]">{item.category_name}</span>
                                                    <span className="text-[12px] font-medium text-gray-400 truncate max-w-[180px]">ID: #{item.category_id || item.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${!item.parent_id ? 'bg-[#eff6ff] text-[#3b82f6]' : 'bg-[#f0fdf4] text-[#22c55e]'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${!item.parent_id ? 'bg-[#3b82f6]' : 'bg-[#22c55e]'}`}></span>
                                                {!item.parent_id ? 'MAIN' : 'SUB'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.parent_id ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-md text-[13px] font-semibold border border-gray-100">
                                                    <FolderOpen size={14} className="text-gray-400" />
                                                    {item.parent?.category_name || "—"}
                                                </div>
                                            ) : (
                                                <span className="text-[13px] font-medium text-gray-400">—</span>
                                            )}
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
                                        <td colSpan={5} className="px-6 py-12 text-center text-[13px] font-bold text-gray-400">No categories found.</td>
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
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(item.category_name || "C")}`}>
                                        {item.category_name?.[0]?.toUpperCase() || "C"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-extrabold text-[#0f172a] truncate max-w-[150px]">{item.category_name}</span>
                                        <span className="text-[13px] font-medium text-gray-500 truncate max-w-[150px]">ID: #{item.category_id || item.id}</span>
                                    </div>
                                </div>
                                <div onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => toggleDropdown(item.id, e)} className="p-1 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${!item.parent_id ? 'bg-[#eff6ff] text-[#3b82f6]' : 'bg-[#f0fdf4] text-[#22c55e]'}`}>
                                    {!item.parent_id ? 'Main Category' : 'Subcategory'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {item.parent_id && (
                                    <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-semibold">
                                        <FolderOpen size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate">Parent: {item.parent?.category_name || "—"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[13px] font-bold text-gray-400 bg-white rounded-xl border border-gray-100">
                            No categories found.
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
                                onClick={(e) => { e.stopPropagation(); navigate(`/categories/edit/${item.id}`); setOpenDropdownId(null); setDropdownPos(null); }}
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
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteTarget?.category_name}"?`}
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
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete {selectedIds.size} categor{selectedIds.size > 1 ? 'ies' : 'y'}?</h2>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">These records will be permanently removed. This can't be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setBulkDeleteOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={confirmBulkDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Category detail slide panel */}
            {detailItem && (() => {
                const avatarClass = getAvatarColor(detailItem.category_name || "C");
                return (
                    <>
                        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm" onClick={() => { setDetailItem(null); setIsEditingDetail(false); }} />
                        <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="text-[15px] font-extrabold text-gray-900">{isEditingDetail ? 'Edit Category' : 'Category Details'}</span>
                                <button onClick={() => { setDetailItem(null); setIsEditingDetail(false); }} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                                {/* Avatar + name */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0 ${avatarClass}`}>
                                        {detailItem.category_name?.[0]?.toUpperCase() || "C"}
                                    </div>
                                    <div className="flex-1">
                                        {isEditingDetail ? (
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full text-[15px] font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F]"
                                                disabled={isSavingEdit}
                                            />
                                        ) : (
                                            <h2 className="text-[17px] font-extrabold text-gray-900 leading-tight">{detailItem.category_name}</h2>
                                        )}
                                        <p className="text-[13px] text-gray-400 font-medium mt-1">ID: {detailItem.category_id || `#${detailItem.id}`}</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                {!isEditingDetail && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${!detailItem.parent_id ? 'bg-[#eff6ff] text-[#3b82f6]' : 'bg-[#f0fdf4] text-[#22c55e]'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${!detailItem.parent_id ? 'bg-[#3b82f6]' : 'bg-[#22c55e]'}`}></span>
                                            {!detailItem.parent_id ? 'MAIN CATEGORY' : 'SUBCATEGORY'}
                                        </span>
                                    </div>
                                )}

                                <div className="h-px bg-gray-100 mb-6"></div>

                                {/* Detail fields */}
                                <div className="flex flex-col gap-4">
                                    {isEditingDetail ? (
                                        <div>
                                            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Parent Category</p>
                                            <Select
                                                options={[
                                                    { value: "", label: "None (Make Main Category)" },
                                                    ...safeCategories.filter(c => c.id !== detailItem.id).map(parent => ({ value: String(parent.id), label: parent.category_name }))
                                                ]}
                                                value={
                                                    editParentId
                                                        ? { value: String(editParentId), label: safeCategories.find(c => String(c.id) === String(editParentId))?.category_name || "Unknown" }
                                                        : { value: "", label: "None (Make Main Category)" }
                                                }
                                                onChange={(selected: any) => setEditParentId(selected ? selected.value : "")}
                                                isDisabled={isSavingEdit}
                                                isSearchable
                                                placeholder="Search parent category..."
                                                maxMenuHeight={170}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        borderRadius: '0.75rem',
                                                        padding: '0.1rem',
                                                        borderColor: state.isFocused ? '#B88E2F' : '#e5e7eb',
                                                        boxShadow: state.isFocused ? '0 0 0 4px rgba(14, 165, 233, 0.3)' : 'none',
                                                        fontSize: '14px',
                                                        backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
                                                        cursor: state.isDisabled ? 'not-allowed' : 'default'
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        fontSize: '14px',
                                                        backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f3f4f6' : 'white',
                                                        color: state.isSelected ? '#1d4ed8' : '#374151',
                                                        padding: '10px 16px',
                                                        cursor: 'pointer'
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        borderRadius: '0.75rem',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                                    })
                                                }}
                                            />
                                        </div>
                                    ) : detailItem.parent_id ? (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Parent Category</p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><FolderOpen size={14} className="text-gray-500" /></div>
                                                <p className="text-[13px] font-bold text-gray-800">{detailItem.parent?.category_name || "—"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-[13px] font-medium text-gray-500">This is a top-level category with no parent.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                                {isEditingDetail ? (
                                    <>
                                        <button onClick={() => setIsEditingDetail(false)} disabled={isSavingEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                                        <button onClick={handleSaveEdit} disabled={isSavingEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#B88E2F] hover:bg-[#997524] text-white text-[13px] font-bold transition-colors disabled:opacity-50 shadow-sm">Save Changes</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { 
                                                setIsEditingDetail(true); 
                                                setEditName(detailItem.category_name); 
                                                setEditParentId(detailItem.parent_id || ""); 
                                            }}
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
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );
}
