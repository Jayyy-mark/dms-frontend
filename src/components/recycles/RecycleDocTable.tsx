'use client';


import { Document, DocumentSearch } from "../../interfaces/document";
import { documentApi } from "../../api/documentApi";
import { categoryApi } from "../../api/categoryApi";
import { Category } from "../../interfaces/category";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import { helper } from "../../helpers/utils";
import { API_SERVER } from "../../helpers/api";
import FilterModal from "../locations/FilterModal";
import SearchRecycleDocument from "./SearchRecycleDoc";
import {
    MoreHorizontal,
    Trash2,
    Eye,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Search,
    ChevronDown,
    LayoutGrid,
    List,
    Filter,
    Star,
    User,
    Calendar,
    X
} from "lucide-react";

export default function RecycleDocumentTable({
    documents,
    setDocuments,
    searchRef,
    onSearch,
    onClearSearch
}: {
    documents: Document[];
    setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
    searchRef?: React.MutableRefObject<any>;
    onSearch?: (data: DocumentSearch) => void;
    onClearSearch?: () => void;
}) {
    

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

    // UI States
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
    const btnRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState<number[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Selection & bulk action states
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    // Detail panel state
    const [detailDoc, setDetailDoc] = useState<Document | null>(null);

    useEffect(() => {
        categoryApi.all().then(data => setAllCategories(data.categories || [])).catch(console.error);
    }, []);

    const openCategoryModal = () => {
        setTempSelectedCategories(selectedCategories);
        setIsCategoryModalOpen(true);
    };

    const handleApplyCategories = () => {
        setSelectedCategories(tempSelectedCategories);
        setIsCategoryModalOpen(false);
        setCurrentPage(1);
    };


    const toggleDropdown = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
            setDropdownPos(null);
        } else {
            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
            setOpenDropdownId(id);
        }
    };

    // Close dropdown on scroll or resize
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

    const handleDeleteClick = (document: Document) => {
        setDeleteTarget(document);
        setDeleteOpen(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const data = await documentApi.deleteRecycleDocument(deleteTarget.id);
            toast.success(data.message);
            setDocuments((prev) => prev.filter((b) => b.id !== deleteTarget.id));
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.message || "Delete failed!");
        }
    };

    // Bulk delete
    const confirmBulkDelete = async () => {
        try {
            await Promise.all([...selectedIds].map(id => documentApi.deleteRecycleDocument(id)));
            toast.success(`${selectedIds.size} document(s) deleted.`);
            setDocuments(prev => prev.filter(d => !selectedIds.has(d.id)));
            setSelectedIds(new Set());
            setBulkDeleteOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Bulk delete failed!");
        }
    };


    const toggleSelectAll = () => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (isAllSelected) {
                currentDocuments.forEach(d => next.delete(d.id));
            } else {
                currentDocuments.forEach(d => next.add(d.id));
            }
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



    const handleRestoreDocument = async (document: Document) => {
        try {
            const data = await documentApi.restoreRecycleDocument(document.id);
            toast.success(data?.message);
            setDocuments((prev) => prev.filter((b) => b.id !== document.id));
            setOpenDropdownId(null);
        } catch (error: any) {
            toast.error(error?.message);
        }
    }

    const handleSearchSubmit = (data: DocumentSearch) => {
        // Check if any filter is actually active
        const isActive = Object.values(data).some(val => val !== null && val !== "");
        setHasActiveFilters(isActive);

        if (onSearch) onSearch(data);
        setIsFilterModalOpen(false);
        setCurrentPage(1);
    };

    const handleClear = () => {
        setHasActiveFilters(false);
        if (onClearSearch) onClearSearch();
        setIsFilterModalOpen(false);
        setCurrentPage(1);
    };


    const renderCategoryPath = (cat: any) => {
        const parts = [];
        if (cat?.parent?.parent?.category_name) parts.push(cat.parent.parent.category_name);
        if (cat?.parent?.category_name) parts.push(cat.parent.category_name);
        if (cat?.category_name) parts.push(cat.category_name);
        return parts.join(" > ");
    };

    const getDocStatus = (doc: Document) => {
        const dtype = doc.dtype?.dtype_name;
        if (dtype === 'Temporary' && doc.expired_at) {
            const daysLeft = helper.getDaysLeft(doc.expired_at);
            if (daysLeft < 0) return 'expired';
            return 'temporary';
        }
        return 'permanent';
    };

    // Filter Logic
    const filteredDocs = documents.filter(doc => {
        // Tab filter
        
        if (activeTab !== 'all' && status !== activeTab) return false;

        // Category filter
        if (selectedCategories.length > 0) {
            if (!doc.category?.id || !selectedCategories.includes(doc.category.id)) {
                return false;
            }
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!doc.document_name?.toLowerCase().includes(query) && !doc.staff?.staff_name?.toLowerCase().includes(query)) {
                return false;
            }
        }

        return true;
    });

    // Calculate stats for tabs
    const stats = {
        all: documents.length,
        permanent: documents.filter(d => getDocStatus(d) === 'permanent').length,
        temporary: documents.filter(d => getDocStatus(d) === 'temporary').length,
        expired: documents.filter(d => getDocStatus(d) === 'expired').length,
    };

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));
    const currentDocuments = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Checkbox helpers (declared after currentDocuments)
    const isAllSelected = currentDocuments.length > 0 && currentDocuments.every(d => selectedIds.has(d.id));
    const isIndeterminate = !isAllSelected && currentDocuments.some(d => selectedIds.has(d.id));

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const getAvatarColor = (name: string) => {
        const colors = ['bg-red-100 text-red-600', 'bg-blue-100 text-[#997524]', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600'];
        const charCode = name.charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    const renderCategoryTree = (categories: Category[], level: number = 0) => {
        if (!categories || categories.length === 0) return null;
        return (
            <ul className={`space-y-1 ${level > 0 ? "ml-3 mt-1 border-l border-gray-100 pl-3" : ""}`}>
                {categories.map(child => {
                    const isSelected = tempSelectedCategories.includes(child.id);
                    const subChildren = allCategories.filter(c => c.parent_id === child.id?.toString() || c.parent?.id === child.id);
                    return (
                        <li key={child.id}>
                            <button
                                onClick={() => {
                                    if (isSelected) {
                                        setTempSelectedCategories(prev => prev.filter(id => id !== child.id));
                                    } else {
                                        setTempSelectedCategories(prev => [...prev, child.id]);
                                    }
                                }}
                                className={`text-left text-[13.5px] w-full px-2 py-1.5 rounded-md transition-colors leading-relaxed ${isSelected
                                        ? 'bg-[#FEF3C7] text-amber-700 font-bold shadow-sm border border-blue-100'
                                        : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-[#997524]'
                                    }`}
                            >
                                {child.category_name}
                            </button>
                            {subChildren.length > 0 && renderCategoryTree(subChildren, level + 1)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="w-full">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 mb-6">
                {/* Search Row — full width with visible border */}
                <div className="flex items-center mx-2 my-2 px-4 py-1 border border-gray-200 rounded-full bg-white">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name or staff..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-500 px-3 py-2 placeholder-gray-400"
                    />
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Tabs row + filters + view toggle */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 pt-2 pb-1">
                    {/* Status tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'all' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            All <span className={`text-[12px] font-bold ${activeTab === 'all' ? 'text-white/90' : 'text-gray-400'}`}>{stats.all}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('permanent'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'permanent' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'permanent' ? 'bg-white' : 'bg-[#22c55e]'}`}></span>
                            Permanent <span className={`text-[12px] font-bold ${activeTab === 'permanent' ? 'text-white/90' : 'text-gray-400'}`}>{stats.permanent}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('temporary'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'temporary' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'temporary' ? 'bg-white' : 'bg-[#3b82f6]'}`}></span>
                            Temporary <span className={`text-[12px] font-bold ${activeTab === 'temporary' ? 'text-white/90' : 'text-gray-400'}`}>{stats.temporary}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('expired'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'expired' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'expired' ? 'bg-white' : 'bg-[#ef4444]'}`}></span>
                            Expired <span className={`text-[12px] font-bold ${activeTab === 'expired' ? 'text-white/90' : 'text-gray-400'}`}>{stats.expired}</span>
                        </button>
                    </div>

                    {/* Right side: filter buttons + count + view toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Categories filter */}
                        <div className="relative">
                            <button
                                onClick={openCategoryModal}
                                className={`flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-[13px] font-semibold outline-none cursor-pointer transition-all ${
                                    selectedCategories.length > 0
                                        ? 'bg-[#FEF3C7] border-blue-300 text-amber-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                All categories
                                {selectedCategories.length > 0 && <span className="bg-[#B88E2F] text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">{selectedCategories.length}</span>}
                                <ChevronDown size={13} className={selectedCategories.length > 0 ? 'text-blue-400' : 'text-gray-400'} />
                            </button>

                            {isCategoryModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 sm:px-6">
                                    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsCategoryModalOpen(false)}></div>
                                    <div className="relative w-full max-w-[960px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-10 zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                                        {/* Modal Header */}
                                        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 shrink-0">
                                            <h3 className="text-lg font-bold text-gray-900">Select Categories</h3>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategories([]);
                                                        setTempSelectedCategories([]);
                                                        setCurrentPage(1);
                                                        setIsCategoryModalOpen(false);
                                                    }}
                                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${selectedCategories.length > 0 || tempSelectedCategories.length > 0
                                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                                            : 'text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Remove Filter
                                                </button>
                                                <button
                                                    onClick={handleApplyCategories}
                                                    className="px-5 py-2 text-sm font-bold text-white bg-[#B88E2F] hover:bg-[#997524] rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <Search size={15} /> Search
                                                </button>
                                                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                                                <button
                                                    onClick={() => setIsCategoryModalOpen(false)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Category Columns */}
                                        <div
                                            className="overflow-y-auto flex-1"
                                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                                        >
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-gray-100 border-t border-gray-50">
                                                {allCategories.filter(c => !c.parent_id).map((parent) => {
                                                    const children = allCategories.filter(c => c.parent_id === parent.id?.toString() || c.parent?.id === parent.id);
                                                    return (
                                                        <div key={parent.id} className="px-6 py-6 flex flex-col gap-2">
                                                            <p className="text-[13px] font-extrabold text-gray-900 mb-3 tracking-tight">
                                                                {parent.category_name}
                                                            </p>
                                                            {children.length > 0 ? (
                                                                renderCategoryTree(children, 0)
                                                            ) : (
                                                                <p className="text-[13px] text-gray-400 italic">No subcategories</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Advanced Filters */}
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all border ${
                                hasActiveFilters
                                    ? 'bg-[#B88E2F] text-white border-[#B88E2F] hover:bg-[#997524] shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <Filter size={13} className={hasActiveFilters ? 'text-white' : 'text-gray-400'} />
                            <span className="hidden sm:inline">All sources</span>
                            {hasActiveFilters && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                            )}
                            <ChevronDown size={13} className={hasActiveFilters ? 'text-white' : 'text-gray-400'} />
                        </button>

                        <div className="h-5 w-px bg-gray-200 mx-1"></div>

                        {/* Count */}
                        <span className="text-[13px] font-bold text-gray-500">
                            {filteredDocs.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} of {filteredDocs.length}
                        </span>

                        {/* View toggle */}
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-800 bg-transparent'}`}
                            >
                                <List size={15} />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-800 bg-transparent'}`}
                            >
                                <LayoutGrid size={15} />
                            </button>
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
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                            onChange={toggleSelectAll}
                                            className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Document</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Staff</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Updated</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentDocuments.map((doc) => {
                                    
                                    const nameInitial = doc.document_name ? doc.document_name.charAt(0).toUpperCase() : 'D';
                                    const avatarClass = getAvatarColor(doc.document_name || 'D');

                                    return (
                                        <tr
                                            key={doc.id}
                                            onClick={() => setDetailDoc(doc)}
                                            className={`hover:bg-[#FEF3C7]/30 transition-colors group cursor-pointer ${selectedIds.has(doc.id) ? 'bg-[#FEF3C7]/50' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(doc.id)}
                                                    onChange={() => toggleSelectOne(doc.id)}
                                                    className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4 min-w-[250px]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarClass}`}>
                                                        {nameInitial}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-[#0f172a] truncate max-w-[200px]">{doc.document_name}</span>
                                                        <span className="text-[12px] font-medium text-gray-400 truncate max-w-[200px]">{doc.description || "No description"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[13px] font-bold text-gray-600 line-clamp-1">{renderCategoryPath(doc.category) || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${status === 'permanent' ? 'bg-[#f0fdf4] text-[#22c55e]' :
                                                        status === 'temporary' ? 'bg-[#eff6ff] text-[#3b82f6]' :
                                                            'bg-[#fef2f2] text-[#ef4444]'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'permanent' ? 'bg-[#22c55e]' :
                                                            status === 'temporary' ? 'bg-[#3b82f6]' :
                                                                'bg-[#ef4444]'
                                                        }`}></span>
                                                    {status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-[13px] font-bold text-[#0f172a]">{doc.staff?.staff_name || "-"}</div>
                                                <div className="text-[11px] font-semibold text-gray-400">{doc.staff?.department?.department_name || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold text-gray-500">
                                                {helper.formatStrDate(doc.updated_at || doc.created_at || "")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                <button
                                                    ref={el => { btnRefs.current[doc.id] = el; }}
                                                    onClick={(e) => toggleDropdown(doc.id, e)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredDocs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[13px] font-bold text-gray-400">
                                            No documents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentDocuments.map((doc) => {
                        
                        const nameInitial = doc.document_name ? doc.document_name.charAt(0).toUpperCase() : 'D';
                        const avatarClass = getAvatarColor(doc.document_name || 'D');
                        const categoryPath = renderCategoryPath(doc.category) || "-";

                        return (
                            <div
                                key={doc.id}
                                onClick={() => setDetailDoc(doc)}
                                className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all cursor-pointer hover:border-blue-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarClass}`}>
                                            {nameInitial}
                                        </div>
                                        <div className="flex flex-col">
                                            <a
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); window.open(`${API_SERVER}${doc.document}`); }}
                                                className="text-[15px] font-extrabold text-[#0f172a] hover:text-[#B88E2F] transition-colors truncate max-w-[180px]"
                                            >
                                                {doc.document_name}
                                            </a>
                                            <span className="text-[13px] font-medium text-gray-500 truncate max-w-[180px]">{doc.description || "No description"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Star className="text-amber-400 fill-amber-400" size={16} />

                                        <div className="relative inline-block mt-1">
                                            <button
                                                onClick={(e) => toggleDropdown(doc.id, e)}
                                                className="p-1 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {openDropdownId === doc.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                        <button
                                                            onClick={() => { window.open(`${API_SERVER}${doc.document}`); setOpenDropdownId(null); }}
                                                            className="w-full text-left px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#B88E2F] flex items-center transition-colors"
                                                        >
                                                            <Eye size={15} className="mr-2" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => handleRestoreDocument(doc)}
                                                            className="w-full text-left px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#B88E2F] flex items-center transition-colors"
                                                        >
                                                            <RotateCcw size={15} className="mr-2" /> Restore
                                                        </button>

                                                        <div className="h-px bg-gray-100 my-1"></div>
                                                        <button
                                                            onClick={() => handleDeleteClick(doc)}
                                                            className="w-full text-left px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                        >
                                                            <Trash2 size={15} className="mr-2" /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-[#FEF3C7] text-[#997524]`}>
                                        {categoryPath.split(' > ').pop()}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${status === 'permanent' ? 'bg-[#f0fdf4] text-[#22c55e]' :
                                            status === 'temporary' ? 'bg-[#eff6ff] text-[#3b82f6]' :
                                                'bg-[#fef2f2] text-[#ef4444]'
                                        }`}>
                                        {status.toLowerCase()}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-semibold">
                                        <User size={15} className="text-gray-400" />
                                        <span className="truncate">{doc.staff?.staff_name || "Unassigned"}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-semibold">
                                        <Calendar size={15} className="text-gray-400" />
                                        <span>{helper.formatStrDate(doc.updated_at || doc.created_at || "")}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredDocs.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[13px] font-bold text-gray-400 bg-white rounded-xl border border-gray-100">
                            No documents found.
                        </div>
                    )}
                </div>
            )}

            {/* Fixed dropdown portal — outside overflow-hidden, never clipped by the table card */}
            {openDropdownId !== null && dropdownPos && (() => {
                const doc = currentDocuments.find(d => d.id === openDropdownId);
                if (!doc) return null;
                
                return (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdownId(null); setDropdownPos(null); }} />
                        <div
                            className="fixed z-50 w-44 bg-white rounded-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5"
                            style={{ top: dropdownPos.top, right: dropdownPos.right }}
                        >
                            <button
                                onClick={() => { window.open(`${API_SERVER}${doc.document}`); setOpenDropdownId(null); setDropdownPos(null); }}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
                            >
                                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center group-hover/item:bg-blue-100 transition-colors">
                                    <Eye size={14} className="text-[#B88E2F]" />
                                </div>
                                View
                            </button>
                            <button
                                onClick={() => handleRestoreDocument(doc)}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
                            >
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center group-hover/item:bg-emerald-100 transition-colors">
                                    <RotateCcw size={14} className="text-emerald-600" />
                                </div>
                                Restore
                            </button>

                            <div className="h-px bg-gray-100 my-1 mx-3"></div>
                            <button
                                onClick={() => handleDeleteClick(doc)}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors group/item"
                            >
                                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover/item:bg-red-100 transition-colors">
                                    <Trash2 size={14} className="text-red-500" />
                                </div>
                                Delete
                            </button>
                        </div>
                    </>
                );
            })()}

            {/* Pagination Controls */}
            {filteredDocs.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-white/[0.03] px-4 py-3 sm:px-6 rounded-xl border border-gray-200 dark:border-gray-800 mt-4 shadow-sm gap-4 sm:gap-0">

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md text-sm py-1 px-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B88E2F] cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDocs.length)}</span> of <span className="font-medium">{filteredDocs.length}</span> documents
                        </p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <p className="text-sm text-gray-700 dark:text-gray-300 block sm:hidden">
                            <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDocs.length)}</span> of <span className="font-medium">{filteredDocs.length}</span>
                        </p>

                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-gray-700 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-gray-700 dark:hover:bg-gray-800 transition-colors"
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
                title="Delete document"
                message={`Are you sure you want to delete "${deleteTarget?.document_name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteOpen(false)}
            />

            {searchRef && (
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    onClear={handleClear}
                    onSearch={() => searchRef.current?.submit()}
                    hasActiveFilters={hasActiveFilters}
                >
                    <SearchRecycleDocument ref={searchRef} onSearch={handleSearchSubmit} />
                </FilterModal>
            )}

            {/* ── Floating bulk-action bar ── */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white border border-gray-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] rounded-2xl px-6 py-3 animate-in slide-in-from-bottom-4 duration-200">
                    <span className="text-[14px] font-bold text-gray-800">
                        {selectedIds.size} selected
                    </span>
                    <div className="h-5 w-px bg-gray-200"></div>
                    <button
                        onClick={() => setSelectedIds(new Set())}
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
                                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete {selectedIds.size} document{selectedIds.size > 1 ? 's' : ''}?</h2>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">These documents will be permanently removed. This can't be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setBulkDeleteOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBulkDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Document detail slide panel ── */}
            {detailDoc && (() => {
                const status = getDocStatus(detailDoc);
                const nameInitial = detailDoc.document_name ? detailDoc.document_name.charAt(0).toUpperCase() : 'D';
                const avatarClass = getAvatarColor(detailDoc.document_name || 'D');
                const categoryPath = renderCategoryPath(detailDoc.category);
                return (
                    <>
                        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm" onClick={() => setDetailDoc(null)} />
                        <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="text-[15px] font-extrabold text-gray-900">Document Details</span>
                                <button onClick={() => setDetailDoc(null)} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                                {/* Avatar + name */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0 ${avatarClass}`}>
                                        {nameInitial}
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-extrabold text-gray-900 leading-tight">{detailDoc.document_name}</h2>
                                        <p className="text-[13px] text-gray-400 font-medium mt-0.5">{detailDoc.description || 'No description'}</p>
                                    </div>
                                </div>

                                {/* Status + category badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${
                                        status === 'permanent' ? 'bg-[#f0fdf4] text-[#22c55e]' :
                                        status === 'temporary' ? 'bg-[#eff6ff] text-[#3b82f6]' :
                                        'bg-[#fef2f2] text-[#ef4444]'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'permanent' ? 'bg-[#22c55e]' : status === 'temporary' ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'}`}></span>
                                        {status.toUpperCase()}
                                    </span>
                                    {categoryPath && (
                                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#997524]">{categoryPath}</span>
                                    )}
                                </div>

                                <div className="h-px bg-gray-100 mb-6"></div>

                                {/* Detail fields */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Staff</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User size={14} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-800">{detailDoc.staff?.staff_name || '—'}</p>
                                                <p className="text-[11px] text-gray-400 font-medium">{detailDoc.staff?.department?.department_name || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {detailDoc.dtype && (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Document Type</p>
                                            <p className="text-[13px] font-semibold text-gray-700">{detailDoc.dtype.dtype_name}</p>
                                        </div>
                                    )}

                                    {detailDoc.expired_at && (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={13} className="text-gray-400" />
                                                <p className="text-[13px] font-semibold text-gray-700">{helper.formatStrDate(detailDoc.expired_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Last Updated</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={13} className="text-gray-400" />
                                            <p className="text-[13px] font-semibold text-gray-700">{helper.formatStrDate(detailDoc.updated_at || detailDoc.created_at || '')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => window.open(`${API_SERVER}${detailDoc.document}`)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Eye size={15} /> View File
                                </button>
                                <button
                                    onClick={() => { handleRestoreDocument(detailDoc); setDetailDoc(null); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <RotateCcw size={15} /> Restore
                                </button>
                                <button
                                    onClick={() => { handleDeleteClick(detailDoc); setDetailDoc(null); }}
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
