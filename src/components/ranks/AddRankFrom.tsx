import { useTranslation } from "react-i18next";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import { AddRank } from "../../interfaces/ranks";
import { rankApi } from "../../api/rankApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

export default function AddRankForm() {
  const { t } = useTranslation();

    const navigate = useNavigate();
    const { errors, validate } = useFormErrors<AddRank>();
    const [form, setForm] = useState<AddRank>({
        rank_name: "",
    });

    const handleSubmit = async() =>{
        const valid = validate([
            { field: "rank_name", value: form.rank_name, label: "Rank name", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await rankApi.create(form);
            toast.success(data?.message || "Created successfully!");
            navigate('/ranks/');
        } catch (error : any) {
            toast.error(parseApiError(error, "Failed to create rank!"));
        }
    };

    return (
        <ComponentCard title="Add rank">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <Label>Rank Name:</Label>
                    <Input
                        type="text"
                        placeholder="Enter rank name"
                        value={form.rank_name}
                        onChange={(e) => setForm({ ...form, rank_name: e.target.value })}
                    />
                    <FieldError message={errors.rank_name} />
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
                        {t("Create rank")}
                    </button>
                </div>
            </div>
        </ComponentCard>
    );
}