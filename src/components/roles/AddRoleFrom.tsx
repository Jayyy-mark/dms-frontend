import { useTranslation } from "react-i18next";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import { AddRole } from "../../interfaces/role";
import { roleApi } from "../../api/roleApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

export default function AddRoleForm() {
  const { t } = useTranslation();

    const navigate = useNavigate();
    const { errors, validate } = useFormErrors<AddRole>();
    const [form, setForm] = useState<AddRole>({
        role_name: "",
    });

    const handleSubmit = async() =>{
        const valid = validate([
            { field: "role_name", value: form.role_name, label: "Role name", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await roleApi.create(form);
            toast.success(data?.message || "Created successfully!");
            navigate('/roles/');
        } catch (error : any) {
            toast.error(parseApiError(error, "Failed to create role!"));
        }
    };

    return (
        <ComponentCard title="Add Role">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <Label>Role Name:</Label>
                    <Input
                        type="text"
                        placeholder="Enter Role name"
                        value={form.role_name}
                        onChange={(e) => setForm({ ...form, role_name: e.target.value })}
                    />
                    <FieldError message={errors.role_name} />
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
                        {t("Create Role")}
                    </button>
                </div>
            </div>
        </ComponentCard>
    );
}