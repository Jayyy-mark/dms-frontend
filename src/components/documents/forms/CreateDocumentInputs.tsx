import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Input from "../../form/input/InputField";
import TextArea from "../../form/input/TextArea";
import Label from "../../form/Label";
import { CloudCheck, CloudUpload, X } from "lucide-react";
import { AddDocument } from "../../../interfaces/document";
import { helper } from "../../../helpers/utils";
import { useSelectOptions } from "../../../hooks/useSelectOptions";
import Select from "react-select";
import { documentApi } from "../../../api/documentApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";


export default function CreateDocumentInputs() {
  const { t } = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState<AddDocument>({
        document_name:"",
        document:null,
        staff_id:"",
        category_id:"",
        dtype_id:"",
        description:"",
    });
    // const [file, setFile] = useState<File | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
            const fileName = file.name;
            setForm((prev)=>({
                ...prev,
                document_name:fileName,
                document:file
            }));
        }
    };

    const removeFile = () => {
        setForm((prev)=>({
            ...prev,
            document_name:"",
            document:null,
        }));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false, // optional: allow only one file
        accept: {
            "application/pdf": [],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
            "application/vnd.ms-excel": [],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
            "application/msword": [],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [],
            "text/csv": [],
        },
    });

    {/* Select Options */}
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
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };    

    const handleSubmit = async () => {
        // if (!form.document_name) {
        //     alert("Please enter document name!");
        //     return;
        // }

        try {
            const data = await documentApi.create(form)
            console.log(data);
            toast.success(data?.message || "Created successfully!");
            navigate('/documents/');
        } catch (error: any) {
            console.log(error);
            toast.error(error?.message || "Falied to create document!");
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 grid-cols-1">
            {/* Dropzone */}
            <div className="md:col-span-4 transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                <form
                    {...getRootProps()}
                    className={`relative rounded-xl border-dashed p-7 lg:p-10
          ${isDragActive
                            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                        }`}
                >
                    {form.document && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // prevents opening file picker
                                removeFile();
                            }}
                            className="absolute top-3 right-3 p-1 rounded-full bg-white shadow hover:bg-red-100 text-red-500"
                        >
                            <X size={18} />
                        </button>
                    )}
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center">
                        {/* Icon Container */}
                        <div className="mb-[22px] flex justify-center">
                            <div className="flex h-[136px] w-[136px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                {!form.document ? (
                                    // ☁️ Upload icon (no file)
                                    <CloudUpload size={100} className="text-[#B88E2F]"/>
                                ) : (
                                    // ☁️ Normal cloud (uploaded)
                                    <CloudCheck size={100} className="text-[#B88E2F]"/>
                                )}
                            </div>
                        </div>
                        <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                        {!form.document ? (isDragActive ? "Drop Files Here" : "Drag & Drop Files Here") : ""}
                        </h4>

                        <span className="text-center mb-5 block text-sm text-gray-700 dark:text-gray-400">
                            {!form.document
                                ? "Drag and Drop to upload your document file"
                                : "File uploaded successfully"
                            }
                        </span>

                        <span className="font-medium underline text-theme-sm text-brand-500">
                            Browse File
                        </span>
                    </div>
                </form>
            </div>
            {/* Document Name */}
            <div className="md:col-span-4">
                <Label htmlFor="document_name">Document Name: </Label>
                <Input
                    name="document_name"
                    id="document_name"
                    value={form.document_name}
                    onChange={(e) => setForm({...form, document_name:e.target.value})}
                    disabled
                />
            </div>
            <div>
                <Label>Staff Name : </Label>
                <Select
                    options={staffOptions}
                    value={staffOptions.find(o => o.value === form.staff_id)}
                    onChange={(option) => handleChange("staff_id", option?.value || "")}
                    isSearchable
                />
            </div>
            <div>
                <Label>Document type : </Label>
                <Select
                    options={dtypeOptions}
                    value={dtypeOptions.find(o => o.value === form.dtype_id)}
                    onChange={(option) => handleChange("dtype_id", option?.value || "")}
                    isSearchable
                />
            </div>
            <div>
                <Label>Category : </Label>
                <Select
                    options={categoryOptions}
                    value={categoryOptions.find(o => o.value === form.category_id)}
                    onChange={(option) => handleChange("category_id", option?.value || "")}
                    isSearchable
                />
            </div>

            {/* Description */}
            <div className="md:col-span-4">
                <Label htmlFor="staffAddress">Description : </Label>
                <TextArea rows={6}
                    value={form.description}
                    onChange={(value)=>setForm({...form, description:value})}
                ></TextArea>
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
                        {t("Create document")}
                    </button>
                </div>
        </div>
    );
}