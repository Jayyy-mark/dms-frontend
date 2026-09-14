import { ColumnDef } from "@tanstack/react-table";
import { Dtype } from "../../interfaces/dtype";
import Button from "../ui/button/Button";
import { Pencil, Trash2 } from "lucide-react";

export const dtypeColumns = (
  onEdit: (dtype: Dtype) => void,
  onDelete: (dtype: Dtype) => void
): ColumnDef<Dtype>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center">
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
      size: 40,
    },
    {
      accessorKey: "dtype_id",
      header: "ID",
    },
    {
      accessorKey: "dtype_name",
      header: "Name",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const dtype = row.original;

        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onEdit(dtype)}
              className="flex items-center gap-1 px-1 py-0.5 text-base" // smaller padding & text
            >
              <Pencil size={12} /> {/* smaller icon */}
              <span className="hidden sm:inline">Edit</span>
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(dtype)}
              className="flex items-center gap-1 px-1 py-0.5 text-base" // smaller padding & text
            >
              <Trash2 size={12} /> {/* smaller icon */}
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>

        );
      },
    },
  ];
