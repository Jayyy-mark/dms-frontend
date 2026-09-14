'use client';

import { useNavigate } from "react-router";
import { Dtype } from "../../interfaces/dtype";
import { dtypeApi } from "../../api/dtypeApi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import {
    MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, Search,
    LayoutGrid, List, X
} from "lucide-react";

export default function DtypeTable({
    dtypes, setDtypes,
}: {
    dtypes: Dtype[];
    setDtypes: React.Dispatch<React.SetStateAction<Dtype[]>>;
}) {
    const navigate = useNavigate();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Dtype | null>(null);

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<Dtype | null>(null);
    
    // Inline Edit State for detail panel
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [editName, setEditName] = useState("");
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

    const handleDeleteClick = (item: Dtype) => {
        setDeleteTarget(item); setDeleteOpen(true); setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const msg = await dtypeApi.delete(deleteTarget.id);
            toast.success(msg?.message || "Deleted.");
            setDtypes((prev) => prev.filter((i) => i.id !== deleteTarget.id));
            setDeleteOpen(false); setDeleteTarget(null);
        } catch (err: any) { toast.error(err?.message || "Delete failed!"); }
    };

    const confirmBulkDelete = async () => {
        try {
            await Promise.all([...selectedIds].map(id => dtypeApi.delete(id)));
            toast.success(`${selectedIds.size} item(s) deleted.`);
            setDtypes(prev => prev.filter(i => !selectedIds.has(i.id)));
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
            toast.error("Type name cannot be empty");
            return;
        }
        setIsSavingEdit(true);
        try {
            await dtypeApi.update({
                id: detailItem.id,
                dtype_id: detailItem.dtype_id,
                dtype_name: editName
            });
            toast.success("Type updated successfully!");
            setDtypes(prev => prev.map(i => i.id === detailItem.id ? { ...i, dtype_name: editName } : i));
            setDetailItem(prev => prev ? { ...prev, dtype_name: editName } : null);
            setIsEditingDetail(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update type");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const filteredItems = dtypes.filter(item => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const match = item.dtype_name?.toLowerCase().includes(query) || item.dtype_id?.toLowerCase().includes(query);
            if (!match) return false;
        }
        return true;
    });

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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 mb-6">
                <div className="flex items-center mx-2 my-2 px-4 py-1 border border-gray-200 rounded-full bg-white">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input type="text" placeholder="Search by type name or ID..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-500 px-3 py-2 placeholder-gray-400" />
                </div>
                <div className="h-px bg-gray-100 w-full"></div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 pt-2 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]">
                            All Types <span className="text-[12px] font-bold text-white/90">{filteredItems.length}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button onClick={() => setViewMode("list")} className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-800 bg-transparent'}`}><List size={15} /></button>
                            <button onClick={() => setViewMode("grid")} className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-800 bg-transparent'}`}><LayoutGrid size={15} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === "list" ? (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                        <table className="w-full min-w-[500px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest w-10">
                                        <input type="checkbox" checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={toggleSelectAll} className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer" />
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Type Name</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItems.map((item) => (
                                    <tr key={item.id} onClick={() => setDetailItem(item)} className={`hover:bg-[#FEF3C7]/30 transition-colors group cursor-pointer ${selectedIds.has(item.id) ? 'bg-[#FEF3C7]/50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelectOne(item.id)} className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer" />
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(item.dtype_name || "D")}`}>
                                                    {item.dtype_name?.[0]?.toUpperCase() || "D"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-[#0f172a] truncate max-w-[250px]">{item.dtype_name}</span>
                                                    <span className="text-[12px] font-medium text-gray-400 truncate max-w-[250px]">ID: #{item.dtype_id || item.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                            <button onClick={(e) => toggleDropdown(item.id, e)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-[13px] font-bold text-gray-400">No items found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((item) => (
                        <div key={item.id} onClick={() => setDetailItem(item)} className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all cursor-pointer hover:border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(item.dtype_name || "D")}`}>
                                        {item.dtype_name?.[0]?.toUpperCase() || "D"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-extrabold text-[#0f172a] truncate max-w-[180px]">{item.dtype_name}</span>
                                        <span className="text-[13px] font-medium text-gray-500 truncate max-w-[180px]">ID: #{item.dtype_id || item.id}</span>
                                    </div>
                                </div>
                                <div onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => toggleDropdown(item.id, e)} className="p-1 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && <div className="col-span-full py-12 text-center text-[13px] font-bold text-gray-400 bg-white rounded-xl border border-gray-100">No items found.</div>}
                </div>
            )}

            {openDropdownId !== null && dropdownPos && (() => {
                const item = currentItems.find(i => i.id === openDropdownId);
                if (!item) return null;
                return (
                    <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setDropdownPos(null); }} />
                        <div className="fixed z-50 w-44 bg-white rounded-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/dtypes/edit/${item.id}`); }} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover/item:bg-gray-200 transition-colors"><Pencil size={14} className="text-gray-500" /></div>Edit
                            </button>
                            <div className="h-px bg-gray-100 my-1 mx-3"></div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors group/item">
                                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover/item:bg-red-100 transition-colors"><Trash2 size={14} className="text-red-500" /></div>Delete
                            </button>
                        </div>
                    </>
                );
            })()}

            {filteredItems.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-5 gap-4 sm:gap-0">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold text-gray-500">Rows per page:</span>
                        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30">
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
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
                                        <button key={item} onClick={() => setCurrentPage(item as number)} className={`relative inline-flex items-center px-4 py-2 text-[13px] font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 transition-colors ${currentPage === item ? 'z-10 bg-[#B88E2F] text-white' : 'text-gray-900 hover:bg-gray-50'}`}>
                                            {item}
                                        </button>
                                    )
                                )}
                            <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 transition-colors"><ChevronRight className="h-5 w-5" /></button>
                        </nav>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={deleteOpen} title="Delete Type" message={`Are you sure you want to delete "${deleteTarget?.dtype_name}"?`} confirmText="Delete" cancelText="Cancel" type="danger" onConfirm={confirmDelete} onCancel={() => setDeleteOpen(false)} />

            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white border border-gray-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] rounded-2xl px-6 py-3 animate-in slide-in-from-bottom-4 duration-200">
                    <span className="text-[14px] font-bold text-gray-800">{selectedIds.size} selected</span>
                    <div className="h-5 w-px bg-gray-200"></div>
                    <button onClick={() => setSelectedIds(new Set())} className="text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">Clear</button>
                    <button onClick={() => setBulkDeleteOpen(true)} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"><Trash2 size={14} />Delete</button>
                </div>
            )}

            {bulkDeleteOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm" onClick={() => setBulkDeleteOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5"><Trash2 className="w-7 h-7 text-red-500" /></div>
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete {selectedIds.size} items?</h2>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">These records will be permanently removed. This can't be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setBulkDeleteOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={confirmBulkDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {detailItem && (() => {
                const avatarClass = getAvatarColor(detailItem.dtype_name || "D");
                return (
                    <>
                        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm" onClick={() => { setDetailItem(null); setIsEditingDetail(false); }} />
                        <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="text-[15px] font-extrabold text-gray-900">{isEditingDetail ? 'Edit Type' : 'Type Details'}</span>
                                <button onClick={() => { setDetailItem(null); setIsEditingDetail(false); }} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0 ${avatarClass}`}>
                                        {detailItem.dtype_name?.[0]?.toUpperCase() || "D"}
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
                                            <h2 className="text-[17px] font-extrabold text-gray-900 leading-tight">{detailItem.dtype_name}</h2>
                                        )}
                                        <p className="text-[13px] text-gray-400 font-medium mt-1">ID: {detailItem.dtype_id || `#${detailItem.id}`}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                                {isEditingDetail ? (
                                    <>
                                        <button onClick={() => setIsEditingDetail(false)} disabled={isSavingEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                                        <button onClick={handleSaveEdit} disabled={isSavingEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#B88E2F] hover:bg-[#997524] text-white text-[13px] font-bold transition-colors disabled:opacity-50 shadow-sm">Save Changes</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setIsEditingDetail(true); setEditName(detailItem.dtype_name); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"><Pencil size={15} /> Edit</button>
                                        <button onClick={() => { handleDeleteClick(detailItem); setDetailItem(null); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors"><Trash2 size={15} /> Delete</button>
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
