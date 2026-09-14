import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import { AddRoom } from "../../interfaces/room";
import { roomApi } from "../../api/roomApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils";
import { Building } from "../../interfaces/building";
import Select from "../form/Select.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

export default function AddRoomForm() {
  const { t } = useTranslation();

    const navigate = useNavigate();
    const { errors, validate } = useFormErrors<AddRoom>();
    const [form, setForm] = useState<AddRoom>({
        room_no:"",
        room_name:"",
        building_id:"",
    });

    const [buildings, setBuildings] = useState<Building[]>([]);

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const data = await helper.fetchBuildings();
                setBuildings(data);
            } catch (error) {
                toast.error("Failed to load buildings");
            }
        };

        fetchBuildings();
    }, []);

    const buildingOptions = buildings.map((b) => ({
        value: String(b.id),
        label: b.building_name,
    }));

    const handleSelectChange = (value:string)=>{
        setForm({...form, building_id:value})
    };

    const handleSubmit = async () => {
        const valid = validate([
            { field: "room_no", value: form.room_no, label: "Room No", required: true },
            { field: "room_name", value: form.room_name, label: "Room name", required: true },
            { field: "building_id", value: form.building_id, label: "Building", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await roomApi.create(form);
            toast.success(data?.message || "Created successfully!");
            navigate('/rooms/');
        } catch (error: any) {
            toast.error(parseApiError(error, "Failed to create room!"));
        }
    };

    return (
        <ComponentCard title="Add Rooms">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <Label>Room No:</Label>
                    <Input
                        type="text"
                        placeholder="Enter room number"
                        value={form.room_no}
                        onChange={(e) => setForm({ ...form, room_no: e.target.value })}
                    />
                    <FieldError message={errors.room_no} />
                </div>
                <div>
                    <Label>Room Name:</Label>
                    <Input
                        type="text"
                        placeholder="Enter room name"
                        value={form.room_name}
                        onChange={(e) => setForm({ ...form, room_name: e.target.value })}
                    />
                    <FieldError message={errors.room_name} />
                </div>
                <div>
                <Label>Building</Label>
                <Select
                    options={buildingOptions}
                    value={form.building_id}
                    placeholder="Select building"
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                />
                <FieldError message={errors.building_id} />
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
                        {t("Create room")}
                    </button>
                </div>
            </div>
        </ComponentCard>
    );
}