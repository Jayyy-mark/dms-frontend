'use client';

import { User } from "../../interfaces/user";
import { userApi } from "../../api/userApi";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import ConfirmModal from "../common/ConfirmModal";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    LayoutGrid,
    List,
    ShieldCheck,
    Mail,
    Calendar,
    X,
} from "lucide-react";

export default function UserTable({
    users,
    setUsers,
}: {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
    const navigate = useNavigate();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    // UI States
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
    const btnRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Selection & bulk action states
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    // Detail panel state
    const [detailUser, setDetailUser] = useState<User | null>(null);

    const toggleDropdown = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
            setDropdownPos(null);
        } else {
            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const topPos = spaceBelow < 200 ? rect.top - 180 : rect.bottom + 4;
            setDropdownPos({ top: topPos, right: window.innerWidth - rect.right });
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

    const handleDeleteClick = (user: User) => {
        setDeleteTarget(user);
        setDeleteOpen(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const message = await userApi.delete(deleteTarget.id);
            toast.success(message);
            setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.message || "Delete failed!");
        }
    };

    // Bulk delete
    const confirmBulkDelete = async () => {
        try {
            await Promise.all([...selectedIds].map(id => userApi.delete(id)));
            toast.success(`${selectedIds.size} user(s) deleted.`);
            setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
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
                currentUsers.forEach(u => next.delete(u.id));
            } else {
                currentUsers.forEach(u => next.add(u.id));
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

    const handleEditUser = (user: User) => {
        navigate(`/users/edit/${user.id}`);
        setOpenDropdownId(null);
    };

    const getAvatarColor = (name: string) => {
        const colors = ['bg-red-100 text-red-600', 'bg-blue-100 text-[#997524]', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600'];
        const charCode = name.charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    const getRoleBadge = (role: string) => {
        const r = role?.toLowerCase();
        if (r === 'admin') return 'bg-[#eff6ff] text-[#3b82f6]';
        if (r === 'staff') return 'bg-[#f0fdf4] text-[#22c55e]';
        return 'bg-gray-100 text-gray-600';
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        // Tab filter
        if (activeTab === 'admin' && user.role?.toLowerCase() !== 'admin') return false;
        if (activeTab === 'staff' && user.role?.toLowerCase() !== 'staff') return false;
        if (activeTab === 'active' && user.is_active === false) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (
                !user.username?.toLowerCase().includes(query) &&
                !user.email?.toLowerCase().includes(query) &&
                !user.role?.toLowerCase().includes(query)
            ) {
                return false;
            }
        }

        return true;
    });

    // Stats for tabs
    const stats = {
        all: users.length,
        admin: users.filter(u => u.role?.toLowerCase() === 'admin').length,
        staff: users.filter(u => u.role?.toLowerCase() === 'staff').length,
        active: users.filter(u => u.is_active !== false).length,
    };

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Checkbox helpers
    const isAllSelected = currentUsers.length > 0 && currentUsers.every(u => selectedIds.has(u.id));
    const isIndeterminate = !isAllSelected && currentUsers.some(u => selectedIds.has(u.id));

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
                        placeholder="Search by username, email, or role..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-500 px-3 py-2 placeholder-gray-400"
                    />
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Tabs row + view toggle */}
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
                            onClick={() => { setActiveTab('admin'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'admin' ? 'bg-white' : 'bg-[#3b82f6]'}`}></span>
                            Admin <span className={`text-[12px] font-bold ${activeTab === 'admin' ? 'text-white/90' : 'text-gray-400'}`}>{stats.admin}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('staff'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'staff' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'staff' ? 'bg-white' : 'bg-[#22c55e]'}`}></span>
                            Staff <span className={`text-[12px] font-bold ${activeTab === 'staff' ? 'text-white/90' : 'text-gray-400'}`}>{stats.staff}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'active' ? 'bg-[#B88E2F] text-white shadow-sm border border-[#B88E2F]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'active' ? 'bg-white' : 'bg-[#22c55e]'}`}></span>
                            Active <span className={`text-[12px] font-bold ${activeTab === 'active' ? 'text-white/90' : 'text-gray-400'}`}>{stats.active}</span>
                        </button>
                    </div>

                    {/* Right side: count + view toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="h-5 w-px bg-gray-200 mx-1"></div>

                        {/* Count */}
                        <span className="text-[13px] font-bold text-gray-500">
                            {filteredUsers.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} of {filteredUsers.length}
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
                        <table className="w-full min-w-[600px] text-left border-collapse">
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
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentUsers.map((user) => {
                                    const nameInitial = user.username ? user.username.charAt(0).toUpperCase() : 'U';
                                    const avatarClass = getAvatarColor(user.username || 'U');
                                    return (
                                        <tr
                                            key={user.id}
                                            onClick={() => setDetailUser(user)}
                                            className={`hover:bg-[#FEF3C7]/30 transition-colors group cursor-pointer ${selectedIds.has(user.id) ? 'bg-[#FEF3C7]/50' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(user.id)}
                                                    onChange={() => toggleSelectOne(user.id)}
                                                    className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4 min-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarClass}`}>
                                                        {nameInitial}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-[#0f172a] truncate max-w-[180px]">{user.username}</span>
                                                        <span className="text-[12px] font-medium text-gray-400">ID: #{user.user_id || user.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-[13px] font-medium text-gray-600">{user.email || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${getRoleBadge(user.role)}`}>
                                                    <ShieldCheck size={11} />
                                                    {user.role || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${user.is_active !== false ? 'bg-[#f0fdf4] text-[#22c55e]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></span>
                                                    {user.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                                <button
                                                    ref={el => { btnRefs.current[user.id] = el; }}
                                                    onClick={(e) => toggleDropdown(user.id, e)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[13px] font-bold text-gray-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentUsers.map((user) => {
                        const nameInitial = user.username ? user.username.charAt(0).toUpperCase() : 'U';
                        const avatarClass = getAvatarColor(user.username || 'U');
                        return (
                            <div
                                key={user.id}
                                onClick={() => setDetailUser(user)}
                                className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] transition-all cursor-pointer hover:border-blue-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarClass}`}>
                                            {nameInitial}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-extrabold text-[#0f172a] truncate max-w-[150px]">{user.username}</span>
                                            <span className="text-[13px] font-medium text-gray-500 truncate max-w-[150px]">ID: #{user.user_id || user.id}</span>
                                        </div>
                                    </div>
                                    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => toggleDropdown(user.id, e)}
                                            className="p-1 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${getRoleBadge(user.role)}`}>
                                        {user.role}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${user.is_active !== false ? 'bg-[#f0fdf4] text-[#22c55e]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                        {user.is_active !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-semibold">
                                        <Mail size={15} className="text-gray-400" />
                                        <span className="truncate">{user.email || 'No email'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredUsers.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[13px] font-bold text-gray-400 bg-white rounded-xl border border-gray-100">
                            No users found.
                        </div>
                    )}
                </div>
            )}

            {/* Fixed dropdown portal */}
            {openDropdownId !== null && dropdownPos && (() => {
                const user = currentUsers.find(u => u.id === openDropdownId);
                if (!user) return null;
                return (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdownId(null); setDropdownPos(null); }} />
                        <div
                            className="fixed z-50 w-44 bg-white rounded-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5"
                            style={{ top: dropdownPos.top, right: dropdownPos.right }}
                        >
                            <button
                                onClick={() => handleEditUser(user)}
                                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item"
                            >
                                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center group-hover/item:bg-blue-100 transition-colors">
                                    <Pencil size={14} className="text-[#B88E2F]" />
                                </div>
                                Edit
                            </button>
                            <div className="h-px bg-gray-100 my-1 mx-3"></div>
                            <button
                                onClick={() => handleDeleteClick(user)}
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
            {filteredUsers.length > 0 && (
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
                        <span className="text-[13px] font-bold text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
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
                                            className={`relative inline-flex items-center px-4 py-2 text-[13px] font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 transition-colors ${currentPage === item ? 'z-10 bg-[#B88E2F] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88E2F]' : 'text-gray-900 hover:bg-gray-50'}`}
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
                title="Delete user"
                message={`Are you sure you want to delete "${deleteTarget?.username}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteOpen(false)}
            />

            {/* Floating bulk-action bar */}
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

            {/* Bulk delete confirmation modal */}
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
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Delete {selectedIds.size} user{selectedIds.size > 1 ? 's' : ''}?</h2>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">These users will be permanently removed. This can't be undone.</p>
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

            {/* User detail slide panel */}
            {detailUser && (() => {
                const nameInitial = detailUser.username ? detailUser.username.charAt(0).toUpperCase() : 'U';
                const avatarClass = getAvatarColor(detailUser.username || 'U');
                return (
                    <>
                        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm" onClick={() => setDetailUser(null)} />
                        <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="text-[15px] font-extrabold text-gray-900">User Details</span>
                                <button onClick={() => setDetailUser(null)} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
                                        <h2 className="text-[17px] font-extrabold text-gray-900 leading-tight">{detailUser.username}</h2>
                                        <p className="text-[13px] text-gray-400 font-medium mt-0.5">ID: #{detailUser.user_id || detailUser.id}</p>
                                    </div>
                                </div>

                                {/* Status + role badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${getRoleBadge(detailUser.role)}`}>
                                        <ShieldCheck size={11} />
                                        {detailUser.role}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${detailUser.is_active !== false ? 'bg-[#f0fdf4] text-[#22c55e]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${detailUser.is_active !== false ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></span>
                                        {detailUser.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-100 mb-6"></div>

                                {/* Detail fields */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Mail size={14} className="text-gray-500" />
                                            </div>
                                            <p className="text-[13px] font-bold text-gray-800">{detailUser.email || '—'}</p>
                                        </div>
                                    </div>

                                    {detailUser.last_login && (
                                        <div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Last Login</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={13} className="text-gray-400" />
                                                <p className="text-[13px] font-semibold text-gray-700">{new Date(detailUser.last_login).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Staff Access</p>
                                        <p className="text-[13px] font-semibold text-gray-700">{detailUser.is_staff ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => { handleEditUser(detailUser); setDetailUser(null); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Pencil size={15} /> Edit
                                </button>
                                <button
                                    onClick={() => { handleDeleteClick(detailUser); setDetailUser(null); }}
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
