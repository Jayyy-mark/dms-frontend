import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import { useNavigate, useParams } from "react-router";
import { Department } from "../../interfaces/department.ts";
import { departmentApi } from "../../api/departmentApi.ts";
import { toast } from "react-toastify";
import { Room } from "../../interfaces/room.ts";
import { helper } from "../../helpers/utils.ts";
import Select from "../form/Select.tsx";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";


const emptyDepartment: Department = {
  id: 0,
  department_id:"",
  department_name:"",
  room_id:"",
};

export default function EditDepartmentForm() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<Department>();

  const [department, setDepartment] = useState<Department>(emptyDepartment);
  const [loading, setLoading] = useState(isEditMode);

  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(()=>{
    const fetchRooms = async() =>{
      const data = await helper.fetchRooms();
      setRooms(data);
    };

    fetchRooms();
  }, [])

  const roomOptions = rooms.map((b)=>({
    value:String(b.id),
    label:b.room_no,
  }))

  useEffect(() => {
    if (!id) return;

    const fetchdepartment = async () => {
      const data = await departmentApi.getById(id)
      setDepartment(data.department);
      setLoading(false);
    };

    fetchdepartment();
  }, [id]);

  const handleSubmit = async () => {
    const valid = validate([
      { field: "department_name", value: department.department_name, label: "Department name", required: true },
    ]);
    if (!valid) return;

    try {
        const data = await departmentApi.update(department);
        toast.success(data.message || "Updated successfully!");
        navigate("/departments/");
    } catch (err: any) {
        toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  const handleSelectChange = (value:string)=>{
    setDepartment({...department, room_id:value});
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <ComponentCard title={"Edit department"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <Label>ID</Label>
            <Input type="text" value={department.id} disabled/>
        </div>

        <div>
          <Label>Department ID</Label>
          <Input type="text" value={department.department_id} 
            onChange={(e)=> setDepartment({...department, department_id: e.target.value})}
          />
        </div>
        <div>
          <Label>Department Name</Label>
          <Input
            type="text"
            value={department.department_name}
            onChange={(e) =>
              setDepartment({ ...department, department_name: e.target.value })
            }
          />
          <FieldError message={errors.department_name} />
        </div>
        <div>
          <Label>Room No:</Label>
          <Select 
          options={roomOptions}
          value={department.room_id}
          onChange={handleSelectChange}
          className="dark:bg-dark-900"
          />
        </div>
        {/* Submit Button */}
        <div className="md:col-span-2 flex">
          <button
            onClick={handleSubmit}
            className="
              flex items-center gap-2
              px-4 py-2
              bg-gradient-to-r from-green-500 to-green-600
              text-white text-sm font-medium
              rounded-md
              shadow-sm
              hover:from-green-600 hover:to-green-700
              transition-all duration-200
              transform hover:-translate-y-0.5 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1
            "
          >
            {t("update")}
          </button>
        </div>

      </div>
    </ComponentCard>
  );
}
