import { useTranslation } from "react-i18next";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import { AddCategory } from "../../interfaces/category";
import { categoryApi } from "../../api/categoryApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils";
import Select from "react-select";
import { useSelectOptions } from "../../hooks/useSelectOptions";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

export default function AddCategoryForm() {
  const { t } = useTranslation();

    const navigate = useNavigate();
    const { errors, validate } = useFormErrors<AddCategory>();
    const [form, setForm] = useState<AddCategory>({
        category_name:"",
        parent_id:"",
    });

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const { options: parentCategoryOptions } = useSelectOptions(
        helper.fetchCategories,
        "category_name"
    );    

    const handleSubmit = async () => {
        const valid = validate([
            { field: "category_name", value: form.category_name, label: "Category name", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await categoryApi.create(form);
            toast.success(data?.message || "Created successfully!");
            navigate('/categories/');
        } catch (error: any) {
            toast.error(parseApiError(error, "Failed to create category!"));
        }
    };

    return (
        <ComponentCard title="Add parentcategories">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <Label>category Name:</Label>
                    <Input
                        type="text"
                        placeholder="Enter category name"
                        value={form.category_name}
                        onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                    />
                    <FieldError message={errors.category_name} />
                </div>
                <div>
                <Label>Parent Category: </Label>
                <Select
                    options={parentCategoryOptions}
                    value={parentCategoryOptions.find(o => o.value === form.parent_id)}
                    onChange={(option) => handleChange("parent_id", option?.value || "")}
                    className="dark:bg-dark-900"
                    isClearable
                    isSearchable
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
                        {t("Create category")}
                    </button>
                </div>
            </div>
        </ComponentCard>
    );
}