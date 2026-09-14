import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import { useNavigate, useParams } from "react-router";
import { UpdateDocument } from "../../interfaces/document.ts";
import { documentApi } from "../../api/documentApi.ts";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils.ts";
import Select from "react-select";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import TextArea from "../form/input/TextArea.tsx";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";


const emptydocument: UpdateDocument = {
    id: 0,
    document_id: "",
    document_name: "",
    staff_id: "",
    category_id: "",
    dtype_id: "",
    description: "",
};

export default function EditDocumentdocument() {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const { errors, validate } = useFormErrors<UpdateDocument>();

    const [document, setDocument] = useState<UpdateDocument>(emptydocument);
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (!id) return;

        const fetchDocument = async () => {
            const data = await documentApi.getById(id)
            setDocument(data.document);
            setLoading(false);
        };

        fetchDocument();
    }, [id]);

    const { options: staffOptions } = useSelectOptions(
        helper.fetchStaffs,
        "staff_name"
    );

    const { options: categoryOptions } = useSelectOptions(
        helper.fetchCategories,
        "category_name"
    );

    const { options: dtypeOptions } = useSelectOptions(
        helper.fetchDtypes,
        "dtype_name"
    );

    const handleChange = (field: string, value: string) => {
        setDocument(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        const valid = validate([
            { field: "document_name", value: document.document_name, label: "Document name", required: true },
            { field: "staff_id", value: document.staff_id, label: "Staff", required: true },
            { field: "dtype_id", value: document.dtype_id, label: "Document type", required: true },
            { field: "category_id", value: document.category_id, label: "Category", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await documentApi.update(document);
            toast.success(data.message || "Updated successfully!");
            navigate("/documents/");
        } catch (err: any) {
            toast.error(parseApiError(err, "Something went wrong!"));
        }
    };

    if (loading) return <p>Loading user...</p>;

    return (
        <ComponentCard title={"Edit document"}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <Label>ID</Label>
                    <Input type="text" value={document.id} disabled />
                </div>

                <div>
                    <Label>Document ID</Label>
                    <Input type="text" value={document.document_id}
                        onChange={(e) => setDocument({ ...document, document_id: e.target.value })}
                        disabled
                    />
                </div>
                <div className="md:col-span-2">
                    <Label>Document Name</Label>
                    <Input
                        type="text"
                        value={document.document_name}
                        onChange={(e) =>
                            setDocument({ ...document, document_name: e.target.value })
                        }
                    />
                    <FieldError message={errors.document_name} />
                </div>
                <div>
                    <Label>Staff Name : </Label>
                    <Select
                        options={staffOptions}
                        value={staffOptions.find(o => String(o.value) === String(document.staff_id))}
                        onChange={(option) => handleChange("staff_id", option?.value || "")}
                        isSearchable
                    />
                    <FieldError message={errors.staff_id} />
                </div>
                <div>
                    <Label>Document type : </Label>
                    <Select
                        options={dtypeOptions}
                        value={dtypeOptions.find(o => String(o.value) === String(document.dtype_id))}
                        onChange={(option) => handleChange("dtype_id", option?.value || "")}
                        isSearchable
                    />
                    <FieldError message={errors.dtype_id} />
                </div>
                <div>
                    <Label>Category : </Label>
                    <Select
                        options={categoryOptions}
                        value={categoryOptions.find(o => String(o.value) === String(document.category_id))}
                        onChange={(option) => handleChange("category_id", option?.value || "")}
                        isSearchable
                    />
                    <FieldError message={errors.category_id} />
                </div>
                <div className="md:col-span-4">
                    <Label>Description :</Label>
                    <TextArea
                        rows={6}
                        value={document.description}
                        placeholder="Write Description"
                        onChange={(value) => setDocument({ ...document, description: value })}
                    >
                    </TextArea>
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
