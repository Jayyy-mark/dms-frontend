import { ColumnDef } from "@tanstack/react-table";
import { Log } from "../../interfaces/log";
import { helper } from "../../helpers/utils";

export const LogColumns = ():ColumnDef<Log>[]=>[
    {
        id:"select",
        header:({table})=>(
            <div className="flex items-center">
                <input 
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                />
            </div>
        ),
        cell:({row})=>(
            <div className="flex items-center">
                <input 
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()} 
                />
            </div>
        ),
        size:40,
    },
    {
        header:"User",
        cell:({ row }) => row.original.user?.username,
    },
    {
        header:"Resource table",
        cell:({ row }) => row.original.model_name,
    },
    {
        header:"Action",
        cell:({ row }) => row.original.action.toUpperCase(),
    },
    {
        header:"Description",
        cell:({row})=> (
            <div>
                <span className="text-[#B88E2F] hover:underline">
                    {row.original.description}
                </span>
            </div>
        ),    
    },
    {
        header:"Performed Time",
        cell:({ row }) => helper.formatStrDate(row.original.created_at),
    },
];