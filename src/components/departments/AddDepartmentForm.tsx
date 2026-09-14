import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import { AddDepartment } from "../../interfaces/department";
import { departmentApi } from "../../api/departmentApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils";
import { Room } from "../../interfaces/room";
import Select from "../form/Select.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

export default function AddDepartmentForm() {
  const { t } = useTranslation();

    const navigate = useNavigate();
    const { errors, validate } = useFormErrors<AddDepartment>();
    const [form, setForm] = useState<AddDepartment>({
        department_name:"",
        room_id:"",
    });

    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await helper.fetchRooms();
                setRooms(data);
            } catch (error) {
                toast.error("Failed to load rooms.");
            }
        };

        fetchRooms();
    }, []);

    const roomOptions = rooms.map((b) => ({
        value: String(b.id),
        label: b.room_name,
    }));

    const handleSelectChange = (value:string)=>{
        setForm({...form, room_id:value});
    };

    const handleSubmit = async () => {
        const valid = validate([
            { field: "department_name", value: form.department_name, label: "Department name", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await departmentApi.create(form);
            toast.success(data?.message || "Created successfully!");
            navigate('/departments/');
        } catch (error: any) {
            toast.error(parseApiError(error, "Failed to create department!"));
        }
    };

    return (
        <ComponentCard title="Add Departments">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <Label>Department Name:</Label>
                    <Input
                        type="text"
                        placeholder="Enter department name"
                        value={form.department_name}
                        onChange={(e) => setForm({ ...form, department_name: e.target.value })}
                    />
                    <FieldError message={errors.department_name} />
                </div>
                <div>
                <Label>Room</Label>
                <Select
                    options={roomOptions}
                    value={form.room_id}
                    placeholder="Select room"
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                />
                </div>                
                <div className="md:col-span-3 flex">
                    <button
                        onClick={handleSubmit}
                        className="
      flex items-center gap-2 
      px-4 py-2 
      bg-gradient-to-r from-blue-500 to-blue-600 
      text-white text-sm font-medium 
      rounded-md 
      shadow-sm 
      hover:from-blue-600 hover:to-blue-700 
      transition-all duration-200 
      transform hover:-translate-y-0.5 active:scale-95 
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
    "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        {t("Create department")}
                    </button>
                </div>
            </div>
        </ComponentCard>
    );
}