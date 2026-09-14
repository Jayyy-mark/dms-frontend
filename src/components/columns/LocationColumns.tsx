import { ColumnDef } from "@tanstack/react-table";
import { Location } from "../../interfaces/location";
import { Eye, Download, Pencil, Trash2 } from "lucide-react";
import { API_SERVER } from "../../helpers/api";

const timeAgo = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
};

export const LocationColumns = (
  onUpdate: (doc: Location) => void,
  onDelete: (doc: Location) => void
): ColumnDef<Location>[] => [
  {
    id: "sl",
    header: "SL",
    cell: ({ row }) => <span className="text-sm font-semibold text-gray-700">{row.index + 1}</span>,
    size: 50,
  },
  {
    id: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const photoUrl = row.original.photo ? `${API_SERVER}${row.original.photo}` : "";
      return photoUrl ? (
        <img
          src={photoUrl}
          alt="icon"
          className="w-10 h-10 rounded-md object-cover border border-gray-200"
        />
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
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 font-medium">
        {row.original.location_name || "Unknown"}
      </span>
    ),
  },
  {
    id: "file_type",
    header: "File Type",
    cell: ({ row }) => {
      let ext = "image";
      const photoStr = row.original.photo as any as string;
      if (photoStr && typeof photoStr === 'string') {
        const parts = photoStr.split(".");
        if (parts.length > 1) ext = parts.pop() || "image";
      }
      return <span className="text-sm text-gray-600">{ext}</span>;
    },
  },
  {
    id: "file_size",
    header: "File Size",
    cell: () => <span className="text-sm text-gray-600">N/A</span>,
  },
  {
    id: "uploaded",
    header: "Uploaded",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {timeAgo(row.original.date)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    size: 100,
    cell: ({ row }) => {
      const handleDownload = () => {
        if (!row.original.photo) return;
        fetch(`${API_SERVER}${row.original.photo}`)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            const ext = (row.original.photo as any as string)?.split('.').pop() || 'jpg';
            a.download = `${row.original.location_name || 'download'}.${ext}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(() => window.open(`${API_SERVER}${row.original.photo}`, '_blank'));
      };

      return (
        <div className="flex items-center gap-2">
          {/* View */}
          <button
            onClick={() => {
              if (row.original.photo) {
                window.open(`${API_SERVER}${row.original.photo}`, "_blank");
              } else if (row.original.latitude && row.original.longitude) {
                window.open(`https://www.google.com/maps?q=${row.original.latitude},${row.original.longitude}`, "_blank");
              }
            }}
            className="p-1.5 rounded bg-[#FEF3C7] text-[#997524] hover:bg-blue-100 transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            title="Download"
          >
            <Download size={16} />
          </button>

          {/* Edit */}
          <button
            onClick={() => onUpdate(row.original)}
            className="p-1.5 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            title="Edit"
          >
            <Pencil size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(row.original)}
            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  }
];

