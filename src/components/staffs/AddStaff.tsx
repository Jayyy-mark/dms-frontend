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
import Select from "react-select";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import TextArea from "../form/input/TextArea.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";
import ActionButton from "../ui/button/ActionButton";

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

    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            borderRadius: "0.5rem",
            minHeight: "44px",
            borderColor: state.isFocused ? "#B88E2F" : "#d0d5dd",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(184, 142, 47, 0.15)" : "none",
            fontSize: "0.875rem",
            backgroundColor: "#ffffff",
            "&:hover": {
                borderColor: "#B88E2F",
            },
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        menu: (base: any) => ({
            ...base,
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            zIndex: 9999,
        }),
        option: (base: any, state: any) => ({
            ...base,
            fontSize: "0.875rem",
            backgroundColor: state.isSelected ? "#FEF3C7" : state.isFocused ? "#fffbe0" : "#ffffff",
            color: state.isSelected ? "#B88E2F" : "#1e293b",
            cursor: "pointer",
            fontWeight: state.isSelected ? 600 : 400,
        }),
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
                        value={genderOptions.find((o) => String(o.value) === String(form.staff_gender)) ?? null}
                        onChange={(option: any) => handleChange("staff_gender", option ? String(option.value) : "")}
                        isSearchable
                        isClearable
                        placeholder="Select gender..."
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={selectStyles}
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
                        value={departmentOptions.find((o) => String(o.value) === String(form.department_id)) ?? null}
                        onChange={(option: any) => handleChange("department_id", option ? String(option.value) : "")}
                        isSearchable
                        isClearable
                        placeholder="Select department..."
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={selectStyles}
                    />
                </div> 
                <div>
                    <Label>Role</Label>
                    <Select
                        options={roleOptions}
                        value={roleOptions.find((o) => String(o.value) === String(form.role_id)) ?? null}
                        onChange={(option: any) => handleChange("role_id", option ? String(option.value) : "")}
                        isSearchable
                        isClearable
                        placeholder="Select role..."
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={selectStyles}
                    />
                </div>   
                <div>
                    <Label>Rank:</Label>
                    <Select
                        options={rankOptions}
                        value={rankOptions.find((o) => String(o.value) === String(form.rank_id)) ?? null}
                        onChange={(option: any) => handleChange("rank_id", option ? String(option.value) : "")}
                        isSearchable
                        isClearable
                        placeholder="Select rank..."
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={selectStyles}
                    />
                </div>
                <div>
                    <Label>Staff type:</Label>
                    <Select
                        options={stypeOptions}
                        value={stypeOptions.find((o) => String(o.value) === String(form.stype_id)) ?? null}
                        onChange={(option: any) => handleChange("stype_id", option ? String(option.value) : "")}
                        isSearchable
                        isClearable
                        placeholder="Select staff type..."
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        styles={selectStyles}
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
                    <ActionButton
                        onClick={handleSubmit}
                        loadingText={`${t("Create staff")}...`}
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
                    </ActionButton>
                </div>
            </div>
        </ComponentCard>
    );
}