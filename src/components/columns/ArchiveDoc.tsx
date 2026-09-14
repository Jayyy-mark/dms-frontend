import { ColumnDef } from "@tanstack/react-table";
import { Document } from "../../interfaces/document";
import Button from "../ui/button/Button";
import { RotateCcw, Trash2 } from "lucide-react";
import { helper } from "../../helpers/utils";
import { API_SERVER } from "../../helpers/api";

export const archiveDocumentColumns = (
  onDelete: (doc: Document) => void,
  onRestore: (doc: Document) => void
): ColumnDef<Document>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center items-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 5,
    },
    {
      accessorKey: "document_name",
      header: "Document Name",
      cell: ({ row }) => (
        <a
          href=""
          className="text-[#997524] hover:underline text-xs"
          onClick={() => {
            window.open(`${API_SERVER}${row.original.document}`)
          }}
        >
          {row.original.document_name}
        </a>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorFn: (row) => row, // Pass the whole row to the cell
      cell: ({ row }) => {
        return (
          <div className="flex flex-col max-w-[120px] whitespace-normal break-words">
            {row.original.category?.parent?.parent?.category_name && (
              <span>{row.original.category.parent.parent.category_name}, </span>
            )}
            {row.original.category?.parent?.category_name && (
              <span>{row.original.category.parent.category_name}, </span>
            )}
            {row.original.category?.category_name && (
              <span>{row.original.category.category_name}</span>
            )}
          </div>
        );
      },
      minSize: 200,
      maxSize: 300,
    },
    {
      header: "description",
      cell: ({ row }) => row.original.description ?? "None",
    },
    {
      header: "Staff",
      cell: ({ row }) => {
        const staff = row.original.staff;

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {staff?.staff_name ?? "-"},

            </span>
            <span className="text-xs text-gray-500">
              {staff?.department?.department_name ?? "-"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Document type",
      cell: ({ row }) => {
        const dtype = row.original.dtype?.dtype_name;
        const expiredAt = row.original.expired_at;

        const daysLeft = helper.getDaysLeft(expiredAt || "");

        return (
          <div className="relative inline-block min-w-[130px]">
            {/* Main text */}
            <span>{dtype}</span>

            {/* Floating badge */}
            {daysLeft && (
              <span
                className={`absolute -top-4 -right-2 text-[10px] px-1.5 py-[1px] rounded-full
              ${daysLeft < 0
                    ? "bg-red-500 text-white"
                    : daysLeft <= 3
                      ? "bg-yellow-400 text-black"
                      : "bg-green-500 text-white"
                  }
            `}
              >
                file expires in {daysLeft < 0 ? "!" : daysLeft} days
              </span>
            )}
          </div>
        );
      },
      minSize: 200,
      maxSize: 300,
    },
    {
      header: "Uploaded Time",
      cell: ({ row }) => helper.formatStrDate(row.original.updated_at || "") ?? "None",
    },
    {
      id: "actions",
      header: "Actions",
      size: 160,
      minSize: 140,
      maxSize: 200,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <div className="relative group inline-block">
            <Button
              variant="info"
              onClick={() => onRestore(row.original)}
              className="flex items-center gap-1 px-1 py-0.5 text-[13px]"
            >
              <RotateCcw size={16} />
            </Button>

            {/* Tooltip */}
            <span className="z-99999 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                   hidden group-hover:block 
                   bg-white border border-gray-300 text-gray text-xs px-2 py-1 rounded whitespace-nowrap">
              restore
            </span>
          </div>
          <Button
            variant="danger"
            onClick={() => onDelete(row.original)}
            className="flex items-center gap-1 px-1 py-0.5 text-[13px]"
          >
            <Trash2 size={16} /> {/* smaller icon */}

          </Button>
        </div>
      ),
    },
  ];
