import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Location } from "../../interfaces/location";
import { MapPin, MoreHorizontal } from "lucide-react";
import { API_SERVER } from "../../helpers/api";
import { helper } from "../../helpers/utils";

const resolveMediaUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_SERVER}${path.startsWith("/") ? "" : "/"}${path}`;
};

function LocationThumbnail({
  primaryPhoto,
  totalPhotos,
  alt,
}: {
  primaryPhoto?: string;
  totalPhotos: number;
  alt: string;
}) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = primaryPhoto ? resolveMediaUrl(primaryPhoto) : "";

  if (!photoUrl || imgError) {
    return (
      <div className="w-10 h-10 rounded-lg bg-amber-50/80 flex items-center justify-center border border-amber-200/70 text-[#B88E2F] shrink-0">
        <MapPin size={16} />
      </div>
    );
  }

  return (
    <div className="relative inline-block shrink-0">
      <img
        src={photoUrl}
        alt={alt}
        onError={() => setImgError(true)}
        className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50"
      />
      {totalPhotos > 1 && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#B88E2F] text-white text-[10px] font-bold leading-none shadow-xs">
          {totalPhotos}
        </span>
      )}
    </div>
  );
}

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
  options?: { mode?: "active" | "recycle"; offset?: number }
): ColumnDef<Location>[] => {
  const isRecycle = options?.mode === "recycle";
  const offset = options?.offset ?? 0;

  return [
  {
    id: "select",
    enableSorting: false,
    header: ({ table }) => (
      <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
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
      <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
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
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-gray-500">{offset + row.index + 1}</span>
    ),
    size: 50,
  },
  {
    id: "icon",
    header: "Photo",
    enableSorting: false,
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
      return (
        <LocationThumbnail
          primaryPhoto={photos[0]}
          totalPhotos={photos.length}
          alt={row.original.location_name || "Location photo"}
        />
      );
    },
    size: 80,
  },
  {
    accessorKey: "location_name",
    header: "Location Name",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="max-w-[260px]">
        <span
          className="text-sm text-gray-800 font-semibold block truncate"
          title={row.original.location_name || "Unknown"}
        >
          {row.original.location_name || "Unknown"}
        </span>
        {row.original.city && (
          <span className="text-[11px] font-medium text-gray-400 block truncate">
            {row.original.city}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "file_type",
    header: "Type",
    accessorFn: (row) => {
      if (row.location_type) return row.location_type;
      if (row.file_type) return row.file_type;
      const photoStr = typeof row.photo === "string" ? row.photo : "";
      if (photoStr && typeof photoStr === "string") {
        const parts = photoStr.split(".");
        if (parts.length > 1) return parts[parts.length - 1].toLowerCase();
      }
      return "—";
    },
    enableGlobalFilter: true,
    cell: ({ getValue }) => {
      const val = getValue() as string;
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#B88E2F] border border-amber-200/70 max-w-[160px] truncate">
          {val}
        </span>
      );
    },
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
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600 max-w-[180px] truncate block">
        {getValue() as string}
      </span>
    ),
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
    enableSorting: false,
    enableGlobalFilter: false,
    size: 60,
    cell: ({ row }) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu(row.original, e);
          }}
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

