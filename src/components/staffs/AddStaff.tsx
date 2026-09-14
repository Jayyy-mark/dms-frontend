import { useTranslation } from "react-i18next";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import { AddStaff } from "../../interfaces/staff";
import { staffApi } from "../../api/staffApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils";
import Select from "../form/Select.tsx";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import TextArea from "../form/input/TextArea.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

export default function AddStaffForm() {
  const { t } = useTranslation();

    const navigate = useNavigate();
    const { errors, validate } = useFormErrors<AddStaff>();
    const [form, setForm] = useState<AddStaff>({
        staff_name:"",
        staff_email:"",
        staff_phone:"",
        staff_address:"",
        staff_gender:"",

        department_id:"",
        role_id:"",
        rank_id:"",
        stype_id:"",
    });

    const { options: departmentOptions } = useSelectOptions(
        helper.fetchDepartments,
        "department_name"
    );
    
    const { options: roleOptions } = useSelectOptions(
        helper.fetchRoles,
        "role_name"
    );

    const { options: rankOptions } = useSelectOptions(
        helper.fetchRanks,
        "rank_name"
    );  

    const { options: stypeOptions } = useSelectOptions(
        helper.fetchStypes,
        "stype_name"
    );  

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
    ];
    
    const handleChange = (field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        const valid = validate([
            { field: "staff_name", value: form.staff_name, label: "Staff name", required: true },
            { field: "staff_email", value: form.staff_email, label: "Email", required: true },
            { field: "staff_phone", value: form.staff_phone, label: "Phone number", required: true },
            { field: "staff_address", value: form.staff_address, label: "Address", required: true },
            { field: "staff_gender", value: form.staff_gender, label: "Gender", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await staffApi.create(form);
            toast.success(data?.message || "Created successfully!");
            navigate('/staffs/');
        } catch (error: any) {
            toast.error(parseApiError(error, "Failed to create staff!"));
        }
    };

    return (
        <ComponentCard title="Add staffs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                    <Label>Name:</Label>
                    <Input
                        type="text"
                        placeholder="Enter staff name"
                        value={form.staff_name}
                        onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
                    />
                    <FieldError message={errors.staff_name} />
                </div>
                <div className="md:col-span-2">
                    <Label>Email:</Label>
                    <Input
                        type="text"
                        placeholder="Enter staff email"
                        value={form.staff_email}
                        onChange={(e) => setForm({ ...form, staff_email: e.target.value })}
                    />
                    <FieldError message={errors.staff_email} />
                </div>
                <div className="md:col-span-2">
                    <Label>Gender:</Label>
                    <Select
                        options={genderOptions}
                        value={form.staff_gender}
                        onChange={(v)=>handleChange("staff_gender",v)}
                        className="dark:bg-dark-900"
                    />
                    <FieldError message={errors.staff_gender} />
                </div>
                <div className="md:col-span-2">
                    <Label>Phone Number:</Label>
                    <Input
                        type="text"
                        placeholder="Enter phone number"
                        value={form.staff_phone}
                        onChange={(e) => setForm({ ...form, staff_phone: e.target.value })}
                    />
                    <FieldError message={errors.staff_phone} />
                </div>
                <div>
                    <Label>Department:</Label>
                    <Select
                        options={departmentOptions}
                        value={form.department_id}
                        onChange={(v) => handleChange("department_id", v)}
                        className="dark:bg-dark-900"
                    />
                </div> 
                <div>
                    <Label>Role</Label>
                    <Select
                        options={roleOptions}
                        value={form.role_id}
                        onChange={(v) => handleChange("role_id", v)}
                        className="dark:bg-dark-900"
                    />
                </div>   
                <div>
                    <Label>Rank:</Label>
                    <Select
                        options={rankOptions}
                        value={form.rank_id}
                        onChange={(v) => handleChange("rank_id", v)}
                        className="dark:bg-dark-900"
                    />
                </div>
                <div>
                    <Label>Staff type:</Label>
                    <Select
                        options={stypeOptions}
                        value={form.stype_id}
                        onChange={(v) => handleChange("stype_id", v)}
                        className="dark:bg-dark-900"
                    />
                </div>   
                <div className="md:col-span-3">
                    <Label htmlFor="staffAddress">Address : </Label>
                    <TextArea
                        rows={6}
                        value={form.staff_address}
                        onChange={(value)=>setForm({...form, staff_address:value})}
                    />
                    <FieldError message={errors.staff_address} />
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
                        {t("Create staff")}
                    </button>
                </div>
            </div>
        </ComponentCard>
    );
}