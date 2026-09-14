import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import {
  CloudUpload,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  ExternalLink,
  Eye,
  Info,
  Table as TableIcon
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import TextArea from "../form/input/TextArea.tsx";
import FieldError from "../form/FieldError.tsx";

import { AddDocument } from "../../interfaces/document.ts";
import { documentApi } from "../../api/documentApi.ts";
import { helper } from "../../helpers/utils.ts";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";
import { useCurrentStaff } from "../../hooks/useStaff.ts";
import { useAuth } from "../../context/AuthContext.tsx";

const emptyDocument: AddDocument = {
  document_name: "",
  document: null,
  staff_id: "",
  category_id: "",
  dtype_id: "",
  description: "",
  expired_at: null,
};

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function AddDocumentForm() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.staff_id);

  useEffect(() => {
    if (staff) {
      setDocumentData((prev) => ({
        ...prev,
        staff_id: staff.id,
      }));
    }
  }, [staff]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { errors, validate } = useFormErrors<AddDocument>();

  const [documentData, setDocumentData] = useState<AddDocument>(emptyDocument);
  const [selectedDtypeLabel, setSelectedDtypeLabel] = useState<string>("");
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [excelPreviewData, setExcelPreviewData] = useState<any[][]>([]);
  const [excelSheetName, setExcelSheetName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"preview" | "details">("preview");

  // Expiration is only available when document type is "temporary"
  const isTemporary = selectedDtypeLabel.toLowerCase().includes("temporary");
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const expirationOptions = [
    { value: "1", label: t("1 Month") || "1 Month" },
    { value: "2", label: t("2 Months") || "2 Months" },
    { value: "3", label: t("3 Months") || "3 Months" },
    { value: "6", label: t("6 Months") || "6 Months" },
  ];

  const calculateExpiryDate = (months: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split("T")[0];
  };

  const handleDurationChange = (option: { value: string; label: string } | null) => {
    if (option) {
      setSelectedDuration(option.value);
      const expiryDate = calculateExpiryDate(parseInt(option.value));
      setDocumentData((prev) => ({ ...prev, expired_at: expiryDate }));
    } else {
      setSelectedDuration(null);
      setDocumentData((prev) => ({ ...prev, expired_at: null }));
    }
  };

  // Revoke object URL on change/unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0] || "Sheet1";
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        setExcelSheetName(sheetName);
        setExcelPreviewData(rows.slice(0, 20)); // preview first 20 rows
      } catch (err) {
        console.error("Excel parse error", err);
        setExcelPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }

      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        parseExcelFile(file);
      } else {
        setExcelPreviewData([]);
      }

      setDocumentData((prev) => ({
        ...prev,
        document: file,
        document_name: prev.document_name || file.name.replace(/\.[^/.]+$/, ""),
      }));
    }
  };

  const removeFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setExcelPreviewData([]);
    setExcelSheetName("");
    setDocumentData((prev) => ({
      ...prev,
      document: null,
      document_name: "",
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    },
    onDropRejected: () => {
      toast.error(
        t("Only PDF, Word (.doc, .docx), Excel (.xls, .xlsx, .csv), and PowerPoint (.ppt, .pptx) files are supported!")
      );
    },
  });

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
    setDocumentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const valid = validate([
      { field: "document_name", value: documentData.document_name, label: t("Document name"), required: true },
      { field: "document", value: documentData.document, label: t("Document file"), required: true },
      { field: "staff_id", value: documentData.staff_id, label: t("Staff"), required: true },
      { field: "dtype_id", value: documentData.dtype_id, label: t("Document type"), required: true },
      { field: "category_id", value: documentData.category_id, label: t("Category"), required: true },
    ]);
    if (!valid) return;

    try {
      const data = await documentApi.create(documentData);
      toast.success(data.message || t("Document created successfully!"));
      navigate("/documents/");
    } catch (err: any) {
      toast.error(parseApiError(err, t("Failed to upload document!")));
    }
  };

  // Helper to identify file category
  const getFileCategory = (file: File) => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    if (name.endsWith(".pdf") || type.includes("pdf")) return "pdf";
    if (name.endsWith(".docx") || name.endsWith(".doc") || type.includes("word")) return "word";
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv") || type.includes("excel") || type.includes("sheet"))
      return "excel";
    if (name.endsWith(".pptx") || name.endsWith(".ppt") || type.includes("powerpoint") || type.includes("presentation"))
      return "ppt";
    return "other";
  };

  // Helper to render file icon based on file category
  const renderFileIcon = (file: File) => {
    const category = getFileCategory(file);
    if (category === "pdf") return <FileText className="text-rose-500" size={36} />;
    if (category === "excel") return <FileSpreadsheet className="text-emerald-600" size={36} />;
    if (category === "word") return <FileText className="text-blue-600" size={36} />;
    if (category === "ppt") return <Presentation className="text-amber-600" size={36} />;
    return <File className="text-[#B88E2F]" size={36} />;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "pdf":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">PDF Document</span>;
      case "word":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Word Document</span>;
      case "excel":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Excel Spreadsheet</span>;
      case "ppt":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">PowerPoint Presentation</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">Document</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* SECTION 2: Document File Upload & Single File Live Content Preview */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">{t("Document File Upload")}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Select or drop the main document file to upload.")}
            </p>
          </div>
          {documentData.document && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={14} /> {t("File Attached")}
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-5">
            {/* Dropzone area */}
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? "border-[#B88E2F] bg-amber-50/50 scale-[0.99]"
                : "border-gray-300 hover:border-[#B88E2F] bg-white hover:bg-gray-50/50"
                }`}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center justify-center">
                {/* Dynamic Icon Box */}
                {documentData.document ? (
                  getFileCategory(documentData.document) === "pdf" ? (
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-3 shadow-xs animate-in zoom-in-95 duration-200">
                      <FileText size={34} />
                    </div>
                  ) : getFileCategory(documentData.document) === "word" ? (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3 shadow-xs animate-in zoom-in-95 duration-200">
                      <FileText size={34} />
                    </div>
                  ) : getFileCategory(documentData.document) === "excel" ? (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3 shadow-xs animate-in zoom-in-95 duration-200">
                      <FileSpreadsheet size={34} />
                    </div>
                  ) : getFileCategory(documentData.document) === "ppt" ? (
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3 shadow-xs animate-in zoom-in-95 duration-200">
                      <Presentation size={34} />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#B88E2F] flex items-center justify-center mb-3 shadow-xs animate-in zoom-in-95 duration-200">
                      <File size={34} />
                    </div>
                  )
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#B88E2F] flex items-center justify-center mb-3 shadow-xs">
                    <CloudUpload size={32} />
                  </div>
                )}

                {/* Dynamic Title and Subtitle */}
                {documentData.document ? (
                  <>
                    <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="truncate max-w-md">{documentData.document.name}</span>
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        ✓ {t("Attached")}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 max-w-md">
                      {formatFileSize(documentData.document.size)} • {t("Click or drag another file to replace")}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {isDragActive ? t("Drop the file here...") : t("Click to upload or drag and drop")}
                    </h4>
                    <p className="text-xs text-gray-500 max-w-md">
                      {t("Only PDF, Word (.doc, .docx), Excel (.xls, .xlsx, .csv), and PowerPoint (.ppt, .pptx) files supported.")}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Single File Card Header */}
            {documentData.document && (
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 group relative">
                <div className="flex items-center gap-4 min-w-0">
                  {/* File Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 shrink-0 flex items-center justify-center">
                    {renderFileIcon(documentData.document)}
                  </div>

                  {/* File Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-[#0f172a] truncate">
                        {documentData.document.name}
                      </h5>
                      {getCategoryBadge(getFileCategory(documentData.document))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {formatFileSize(documentData.document.size)}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 truncate">
                        {documentData.document.type || "application/octet-stream"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {filePreviewUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(filePreviewUrl, "_blank")}
                      className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-xs flex items-center gap-1 text-xs font-bold"
                      title={t("Open in new tab") || "Open in new tab"}
                    >
                      <ExternalLink size={15} />
                      <span className="hidden sm:inline">{t("Full Screen")}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-bold"
                    title={t("Remove uploaded file") || "Remove uploaded file"}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">{t("Remove")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW VIEW CARD: Show file contents inside the file */}
            {documentData.document && filePreviewUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                {/* Header with View Tabs */}
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-[#B88E2F]" />
                    <span className="text-xs font-bold text-[#0f172a]">
                      {t("Document Content Live Preview")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-xl text-xs font-semibold text-gray-600">
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1 rounded-lg transition ${activeTab === "preview"
                        ? "bg-white text-[#B88E2F] font-bold shadow-xs"
                        : "hover:text-gray-900"
                        }`}
                    >
                      {t("File Content View")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className={`px-3 py-1 rounded-lg transition ${activeTab === "details"
                        ? "bg-white text-[#B88E2F] font-bold shadow-xs"
                        : "hover:text-gray-900"
                        }`}
                    >
                      {t("File Metadata")}
                    </button>
                  </div>
                </div>

                {/* Tab 1: Content Viewer */}
                {activeTab === "preview" && (
                  <div className="p-4 bg-slate-900/5 min-h-[350px]">
                    {/* PDF Viewer */}
                    {getFileCategory(documentData.document) === "pdf" && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-slate-800">
                        <iframe
                          src={filePreviewUrl}
                          title="PDF Preview"
                          className="w-full h-[520px] border-0"
                        />
                      </div>
                    )}

                    {/* Excel Live Spreadsheet Table Viewer */}
                    {getFileCategory(documentData.document) === "excel" && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TableIcon size={16} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">
                              Sheet: {excelSheetName || "Data Table"}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Showing first {excelPreviewData.length} rows
                          </span>
                        </div>

                        {excelPreviewData.length > 0 ? (
                          <div className="overflow-auto max-h-[450px] max-w-full">
                            <table className="w-full text-left text-xs border-collapse table-fixed">
                              <thead>
                                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 sticky top-0 z-10">
                                  <th className="p-2.5 border-r border-gray-200 w-10 text-center bg-gray-200/80">#</th>
                                  {excelPreviewData[0]?.map((col: any, idx: number) => (
                                    <th key={idx} className="p-2.5 border-r border-gray-200 truncate max-w-[200px]" title={String(col || `Col ${idx + 1}`)}>
                                      {String(col || `Col ${idx + 1}`)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {excelPreviewData.slice(1).map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-amber-50/40 transition">
                                    <td className="p-2 border-r border-gray-200 text-center font-mono text-gray-400 bg-gray-50/50">
                                      {rIdx + 1}
                                    </td>
                                    {row.map((cell: any, cIdx: number) => (
                                      <td key={cIdx} className="p-2.5 border-r border-gray-100 text-gray-800 truncate max-w-[200px]" title={String(cell ?? "")}>
                                        {String(cell ?? "")}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-12 text-center text-gray-500">
                            <FileSpreadsheet size={40} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                            <p className="text-xs font-semibold">Spreadsheet File Attached</p>
                            <p className="text-[11px] text-gray-400 mt-1">Ready for server processing and storage.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Word Document Live Content Reader */}
                    {getFileCategory(documentData.document) === "word" && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{documentData.document.name}</h4>
                              <p className="text-xs text-gray-500">Microsoft Word Document (.docx)</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            Document Reader Ready
                          </span>
                        </div>

                        <div className="p-6 bg-gray-50/70 rounded-xl border border-dashed border-gray-200 text-center space-y-3">
                          <FileText size={44} className="mx-auto text-blue-500 opacity-80" />
                          <div>
                            <h5 className="text-xs font-bold text-gray-800">Word Document Content Container</h5>
                            <p className="text-[11px] text-gray-500 max-w-md mx-auto mt-1">
                              Word document ({documentData.document.name}) has been validated and attached to this record.
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => window.open(filePreviewUrl, "_blank")}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                            >
                              <Eye size={14} /> View / Open Document
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PowerPoint Presentation Live Content Reader */}
                    {getFileCategory(documentData.document) === "ppt" && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                              <Presentation size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{documentData.document.name}</h4>
                              <p className="text-xs text-gray-500">Microsoft PowerPoint Presentation (.pptx)</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                            Presentation Slides Ready
                          </span>
                        </div>

                        <div className="p-6 bg-amber-50/30 rounded-xl border border-dashed border-amber-200 text-center space-y-3">
                          <Presentation size={44} className="mx-auto text-amber-600 opacity-80" />
                          <div>
                            <h5 className="text-xs font-bold text-gray-800">PowerPoint Slides Presentation Container</h5>
                            <p className="text-[11px] text-gray-500 max-w-md mx-auto mt-1">
                              Presentation slides ({documentData.document.name}) attached and validated for upload.
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => window.open(filePreviewUrl, "_blank")}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                            >
                              <Eye size={14} /> Open Presentation
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Documents */}
                    {getFileCategory(documentData.document) === "other" && (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <File size={40} className="mx-auto text-[#B88E2F] opacity-70 mb-2" />
                        <h4 className="text-xs font-bold text-gray-800">Document Attached</h4>
                        <p className="text-[11px] text-gray-500 mt-1">{documentData.document.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Metadata */}
                {activeTab === "details" && (
                  <div className="p-5 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("File Name")}</span>
                        <span className="text-xs font-bold text-gray-900 truncate block mt-0.5">
                          {documentData.document.name}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("File Size")}</span>
                        <span className="text-xs font-bold text-gray-900 block mt-0.5">
                          {formatFileSize(documentData.document.size)} ({documentData.document.size} bytes)
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("File Extension")}</span>
                        <span className="text-xs font-bold text-gray-900 uppercase block mt-0.5">
                          {documentData.document.name.split(".").pop()}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("MIME Content Type")}</span>
                        <span className="text-xs font-mono font-bold text-gray-800 block mt-0.5 truncate">
                          {documentData.document.type || "application/octet-stream"}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("Last Modified")}</span>
                        <span className="text-xs font-bold text-gray-900 block mt-0.5">
                          {new Date(documentData.document.lastModified).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-medium">
                      <Info size={16} className="text-emerald-600 shrink-0" />
                      <span>{t("File validation verified: File extension and MIME type match supported document types.")}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <FieldError message={errors.document} />
          </div>
        </div>
      </div>

      {/* SECTION 1: Document Information */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#0f172a]">{t("Document Information")}</h3>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            {t("Basic document details and organizational classification.")}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Document Name */}
            <div className="md:col-span-2">
              <Label htmlFor="document_name">
                {t("Document Name")} <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                id="document_name"
                placeholder={t("Ex: Annual Financial Report 2026") || ""}
                value={documentData.document_name}
                onChange={(e) =>
                  setDocumentData({ ...documentData, document_name: e.target.value })
                }
                className="bg-white border-gray-200"
              />
              <FieldError message={errors.document_name} />
            </div>

            {/* Staff Name */}
            <div>
              <Label htmlFor="staff_id">
                {t("Staff Member")}{" "}
                <span className="text-rose-500">*</span>
              </Label>

              <Select
                options={staffOptions}
                menuPortalTarget={
                  typeof document !== "undefined"
                    ? document.body
                    : null
                }
                menuPosition="fixed"
                value={
                  staffOptions.find(
                    (o) =>
                      String(o.value) ===
                      String(documentData.staff_id)
                  ) || null
                }
                isDisabled
                isSearchable={false}
                placeholder={t("Select staff...")}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    minHeight: "44px",
                    borderColor: "#e5e7eb",
                    padding: "2px",
                    fontSize: "0.875rem",
                    backgroundColor: "#f8fafc",
                  }),

                  singleValue: (base) => ({
                    ...base,
                    color: "#475569",
                  }),

                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

              <FieldError message={errors.staff_id} />
            </div>

            {/* Document Type */}
            <div>
              <Label htmlFor="dtype_id">
                {t("Document Type")} <span className="text-rose-500">*</span>
              </Label>
              <Select
                options={dtypeOptions}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                value={dtypeOptions.find((o) => String(o.value) === String(documentData.dtype_id)) || null}
                onChange={(option) => {
                  handleChange("dtype_id", option?.value || "");
                  const label = option?.label ?? "";
                  setSelectedDtypeLabel(label);
                  if (!label.toLowerCase().includes("temporary")) {
                    setSelectedDuration(null);
                    setDocumentData((prev) => ({ ...prev, expired_at: null }));
                  }
                }}
                isSearchable
                placeholder={t("Select type...")}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    minHeight: "44px",
                    borderColor: state.isFocused ? "#B88E2F" : "#e5e7eb",
                    boxShadow: state.isFocused ? "0 0 0 3px rgba(184, 142, 47, 0.15)" : "none",
                    padding: "2px",
                    fontSize: "0.875rem",
                    backgroundColor: "#ffffff",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected ? "#FEF3C7" : state.isFocused ? "#fffbe0" : "#ffffff",
                    color: state.isSelected ? "#B88E2F" : "#1e293b",
                    cursor: "pointer",
                  }),
                }}
              />
              <FieldError message={errors.dtype_id} />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category_id">
                {t("Category")} <span className="text-rose-500">*</span>
              </Label>
              <Select
                options={categoryOptions}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                value={categoryOptions.find((o) => String(o.value) === String(documentData.category_id)) || null}
                onChange={(option) => handleChange("category_id", option?.value || "")}
                isSearchable
                placeholder={t("Select category...")}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    minHeight: "44px",
                    borderColor: state.isFocused ? "#B88E2F" : "#e5e7eb",
                    boxShadow: state.isFocused ? "0 0 0 3px rgba(184, 142, 47, 0.15)" : "none",
                    padding: "2px",
                    fontSize: "0.875rem",
                    backgroundColor: "#ffffff",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected ? "#FEF3C7" : state.isFocused ? "#fffbe0" : "#ffffff",
                    color: state.isSelected ? "#B88E2F" : "#1e293b",
                    cursor: "pointer",
                  }),
                }}
              />
              <FieldError message={errors.category_id} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Expiration Period (Conditional for Temporary documents) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">{t("Expiration Period")}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Set auto-expiration date (Applicable for Temporary document types).")}
            </p>
          </div>
          {!isTemporary && (
            <span className="text-xs text-gray-400 font-medium italic">
              {selectedDtypeLabel ? t("Disabled (Non-temporary document)") : t("Select Document Type first")}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-3">
            <Label htmlFor="expiration">{t("Select Period")}</Label>
            <Select
              options={expirationOptions}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              value={expirationOptions.find((o) => o.value === selectedDuration) || null}
              onChange={handleDurationChange}
              isDisabled={!isTemporary}
              isClearable
              placeholder={isTemporary ? t("Select expiration period...") : t("Not applicable")}
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  minHeight: "44px",
                  borderColor: state.isFocused ? "#B88E2F" : "#e5e7eb",
                  boxShadow: state.isFocused ? "0 0 0 3px rgba(184, 142, 47, 0.15)" : "none",
                  padding: "2px",
                  fontSize: "0.875rem",
                  backgroundColor: state.isDisabled ? "#f3f4f6" : "#ffffff",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

            {isTemporary && documentData.expired_at && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-[#B88E2F]">
                <Clock size={16} />
                <span>{t("Expires on:")} {String(documentData.expired_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: Description */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#0f172a]">{t("Description & Remarks")}</h3>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            {t("Add detailed descriptions or reference notes for this document.")}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
            <Label htmlFor="description">{t("Write Description")}</Label>
            <TextArea
              id="description"
              rows={5}
              placeholder={t("Write detailed document notes or instructions...") || ""}
              value={documentData.description}
              onChange={(value) =>
                setDocumentData({ ...documentData, description: value })
              }
              className="bg-white border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/documents/")}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
        >
          {t("Cancel")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-[#B88E2F] hover:bg-[#997524] text-white text-xs font-bold rounded-2xl transition shadow-md shadow-amber-200 flex items-center gap-2"
        >
          <Plus size={16} /> {t("Create Document")}
        </button>
      </div>
    </div>
  );
}