import { ColumnDef } from "@tanstack/react-table";
import { Document } from "../../interfaces/document";
import { ArchiveIcon, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { helper } from "../../helpers/utils";
import { API_SERVER } from "../../helpers/api";

export const documentColumns = (
  onUpdate: (doc: Document) => void,
  onDelete: (doc: Document) => void,
  onArchive: (doc: Document) => void,
  openActionId: number | null,
  setOpenActionId: React.Dispatch<React.SetStateAction<number | null>>
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
        console.log(`Days left is ${daysLeft} for this document type ${dtype}`);
        return (
          <div className="relative inline-block min-w-[130px]">
            {/* Main text */}
            <span>{dtype}</span>

            {/* Floating badge */}
            {(dtype == "Temporary") && (
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
                {
                  daysLeft < 0 ? "file is already expired!" :
                    daysLeft == 0 ? "file expires today!" :
                      `file expires in ${daysLeft} days`
                }
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
      size: 70,
      minSize: 60,
      maxSize: 80,

      cell: ({ row, table }) => {

        const isOpen = openActionId === row.original.id;

        return (
          <div className="relative">
            {/* Trigger */}
            <button
              onClick={() => {
                setOpenActionId(isOpen ? null : row.original.id);
              }}
              className="p-1 border rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 btn"
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div
                className={`
    absolute left-7 mt-0
    z-[999]
    min-w-[50px]
    rounded-lg border border-gray-200
    bg-white shadow-xl
    dark:bg-gray-900 dark:border-gray-700
    p-1
    ${row.index >= table.getRowModel().rows.length - 2 ? "bottom-0" : "-bottom-8"}
  `}
              >
                {/* Edit */}
                <div className="relative inline-block group">

                  <button
                    onClick={() => {
                      onUpdate(row.original);
                      setOpenActionId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <Pencil size={15} />
                  </button>
                  <span className={`
                    absolute right-2 mb-1
                    -translate-x-1/2
                    hidden group-hover:block
                    bg-white border border-gray-300
                    text-xs px-2 py-1 rounded
                    whitespace-nowrap
                    z-[999999]
                    ${row.index >= table.getRowModel().rows.length - 2 ? "bottom-full mb-2" : "bottom-6"}
                  `}>
                    Edit
                  </span>
                </div>

                {/* Delete */}
                <div className="relative inline-flex group">
                  <button
                    onClick={() => {
                      onDelete(row.original);
                      setOpenActionId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                  <span className={`
                    absolute right-2 mb-1
                    -translate-x-1/2
                    hidden group-hover:block
                    bg-white border border-gray-300
                    text-xs px-2 py-1 rounded
                    whitespace-nowrap
                    z-[999999]
                    ${row.index >= table.getRowModel().rows.length - 2 ? "bottom-full mb-2" : "bottom-6"}
                  `}>
                    Delete
                  </span>
                </div>

                {/* View */}
                <div className="relative inline-flex group">
                  <button
                    onClick={() => {
                      window.open(`${API_SERVER}${row.original.document}`);
                      setOpenActionId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <Eye size={15} />
                  </button>

                  {/* Tooltip */}
                  <span className={`
    absolute right-2 mb-1
    -translate-x-1/2
    hidden group-hover:block
    bg-white border border-gray-300
    text-xs px-2 py-1 rounded
    whitespace-nowrap
    z-[999999]
    ${row.index >= table.getRowModel().rows.length - 2 ? "bottom-full mb-2" : "bottom-6"}
  `}>
                    View
                  </span>
                </div>


                {/* Archive */}
                {row.original.dtype?.dtype_name !== "Temporary" && (
                  <div className="relative inline-block group">
                    <button
                      onClick={() => {
                        onArchive(row.original);
                        setOpenActionId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <ArchiveIcon size={15} />
                    </button>
                    <span className={`
    absolute right-0 mb-1
    -translate-x-1/2
    hidden group-hover:block
    bg-white border border-gray-300
    text-xs px-2 py-1 rounded
    whitespace-nowrap
    z-[999999]
    ${row.index >= table.getRowModel().rows.length - 2 ? "bottom-full mb-2" : "bottom-6"}
  `}>
                      Archive
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    }
  ];
