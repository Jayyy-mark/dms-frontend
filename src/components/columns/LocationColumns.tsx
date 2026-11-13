import { ColumnDef } from "@tanstack/react-table";
import { Location } from "../../interfaces/location";
import { MoreHorizontal } from "lucide-react";
import { API_SERVER } from "../../helpers/api";
import { helper } from "../../helpers/utils";

const parseDateLocal = (dateStr: string): Date => {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(dateStr);
};

const formatUnit = (value: number, unit: string) =>
  `${value} ${unit}${value === 1 ? "" : "s"} ago`;

const timeAgo = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  const date = parseDateLocal(dateStr);
  if (isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((todayStart.getTime() - targetStart.getTime()) / 86400000);

  if (diffDays < 0) return date.toLocaleDateString();
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatUnit(diffDays, "day");
};

export const LocationColumns = (
  onOpenMenu: (doc: Location, e: React.MouseEvent<HTMLButtonElement>) => void,
  options?: { mode?: "active" | "recycle" }
): ColumnDef<Location>[] => {
  const isRecycle = options?.mode === "recycle";

  return [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center items-center">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all locations"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select ${row.original.location_name || "location"}`}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
    ),
    enableGlobalFilter: false,
    size: 40,
  },
  {
    id: "sl",
    header: "SL",
    enableGlobalFilter: false,
    cell: ({ row }) => <span className="text-sm font-semibold text-gray-700">{row.index + 1}</span>,
    size: 50,
  },
  {
    id: "icon",
    header: "Icon",
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const photos: string[] = [];
      if (row.original.photo && typeof row.original.photo === "string") {
        photos.push(row.original.photo);
      }
      if (Array.isArray(row.original.photos)) {
        row.original.photos.forEach((p) => {
          if (p.photo && typeof p.photo === "string" && !photos.includes(p.photo)) {
            photos.push(p.photo);
          }
        });
      }
      const primaryPhoto = photos[0];
      const photoUrl = primaryPhoto ? `${API_SERVER}${primaryPhoto}` : "";
      return photoUrl ? (
        <div className="relative inline-block">
          <img
            src={photoUrl}
            alt="icon"
            className="w-10 h-10 rounded-md object-cover border border-gray-200"
          />
          {photos.length > 1 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-[#B88E2F] text-white text-[10px] font-bold shadow-xs">
              {photos.length}
            </span>
          )}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 text-xs text-gray-400">
          N/A
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "location_name",
    header: "File Name",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 font-medium">
        {row.original.location_name || "Unknown"}
      </span>
    ),
  },
  {
    id: "file_type",
    header: "File Type",
    accessorFn: (row) => {
      if (row.file_type) return row.file_type;
      const photoStr = typeof row.photo === "string" ? row.photo : "";
      if (photoStr && typeof photoStr === 'string') {
        const parts = photoStr.split(".");
        if (parts.length > 1) return parts[parts.length - 1].toLowerCase();
      }
      return "image";
    },
    enableGlobalFilter: true,
    cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() as string}</span>,
  },
  {
    id: "department",
    header: "Department",
    accessorFn: (row) => {
      if (row.department_name) return String(row.department_name);
      if (row.department && typeof row.department === "object") {
        const deptObj = row.department as Record<string, unknown>;
        if (typeof deptObj.department_name === "string" && deptObj.department_name) {
          return deptObj.department_name;
        }
      }
      if (typeof row.department === "string" && row.department) return row.department;
      if (row.department_id) return `Dept #${row.department_id}`;
      return "—";
    },
    enableGlobalFilter: true,
    cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() as string}</span>,
  },
  {
    id: "uploaded",
    header: isRecycle ? "Deleted" : "Uploaded",
    enableGlobalFilter: false,
    cell: ({ row }) => {
      if (isRecycle) {
        const deletedAt = row.original.deleted_time;
        return (
          <span
            className="text-sm text-gray-600"
            title={deletedAt ? helper.formatStrDate(deletedAt) : ""}
          >
            {deletedAt ? helper.formatStrDate(deletedAt) : timeAgo(row.original.date)}
          </span>
        );
      }
      return (
        <span className="text-sm text-gray-600">
          {timeAgo(row.original.date)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableGlobalFilter: false,
    size: 60,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={(e) => onOpenMenu(row.original, e)}
          aria-label="Open actions"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    ),
  }
];
};

