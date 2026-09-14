import { ColumnDef } from "@tanstack/react-table";
import { Department } from "../../interfaces/department";
import { MoreVertical, Pencil, Trash2, Building } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const getAvatarColor = (name: string) => {
    const colors = ['bg-red-100 text-red-600', 'bg-blue-100 text-[#997524]', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600'];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
};

const ActionCell = ({ department, onEdit, onDelete, rowIndex, totalRows }: { department: Department, onEdit: (d: Department) => void, onDelete: (d: Department) => void, rowIndex: number, totalRows: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isBottom = rowIndex >= totalRows - 2 && totalRows > 3;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1.5 ${isBottom ? 'bottom-full mb-1' : 'mt-1'}`}>
                    <button
                        onClick={() => { onEdit(department); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <Pencil size={14} className="text-[#B88E2F]" /> Edit
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button
                        onClick={() => { onDelete(department); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 size={14} className="text-red-500" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export const departmentColumns = (
    onEdit: (department: Department) => void,
    onDelete: (department: Department) => void
): ColumnDef<Department>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                        className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="rounded text-[#B88E2F] focus:ring-[#B88E2F] border-gray-300 w-4 h-4 cursor-pointer"
                />
            ),
            size: 40,
        },
        {
            accessorKey: "department_name",
            header: "Department",
            cell: ({ row }) => {
                const nameInitial = row.original.department_name ? row.original.department_name.charAt(0).toUpperCase() : 'D';
                const avatarClass = getAvatarColor(row.original.department_name || 'D');
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClass}`}>
                            {nameInitial}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-[#0f172a]">{row.original.department_name}</span>
                            <span className="text-[12px] font-medium text-gray-400">ID: #{row.original.department_id || row.original.id}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorFn: (row) => row.room?.room_no ?? "No Room assigned",
            header: "Room No",
            cell: ({ row }) => {
                const roomName = row.original.room?.room_no;
                if (!roomName) return <span className="text-[13px] font-medium text-gray-400">No Room Assigned</span>;
                return (
                    <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded text-gray-600 bg-gray-100 border border-gray-200">
                        <Building size={10} className="mr-1" />
                        {roomName}
                    </span>
                );
            }
        },
        {
            id: "actions",
            header: "Action",
            size: 80,
            cell: ({ row, table }) => (
                <ActionCell 
                    department={row.original} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    rowIndex={row.index} 
                    totalRows={table.getRowModel().rows.length} 
                />
            ),
        },
    ];
