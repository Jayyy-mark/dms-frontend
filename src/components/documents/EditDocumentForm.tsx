import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import {
  CloudUpload,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Trash2,
  Clock,
  CheckCircle2,
  ExternalLink,
  Eye,
  Info,
  Table as TableIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import TextArea from "../form/input/TextArea.tsx";
import FieldError from "../form/FieldError.tsx";

import { UpdateDocument } from "../../interfaces/document.ts";
import { documentApi } from "../../api/documentApi.ts";
import { helper } from "../../helpers/utils.ts";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";
import { API_SERVER } from "../../helpers/api.ts";

const emptyDocument: UpdateDocument = {
  id: 0,
  document_id: "",
  document_name: "",
  staff_id: "",
  category_id: "",
  dtype_id: "",
  description: "",
  expired_at: null,
  document: null,
};

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function EditDocumentForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { errors, validate } = useFormErrors<UpdateDocument>();

  const [documentData, setDocumentData] = useState<UpdateDocument>(emptyDocument);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [selectedDtypeLabel, setSelectedDtypeLabel] = useState<string>("");
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [excelPreviewData, setExcelPreviewData] = useState<any[][]>([]);
  const [excelSheetName, setExcelSheetName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"preview" | "details">("preview");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expiration is only allowed when document type is "temporary"
  // If "permanent" is selected, expiration cannot be applied
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

  useEffect(() => {
    if (!id) return;

    const fetchDocument = async () => {
      try {
        const data = await documentApi.getById(id);
        const doc = data.document;
        setDocumentData({
          id: doc.id,
          document_id: doc.document_id || "",
          document_name: doc.document_name || "",
          staff_id: String(doc.staff_id || doc.staff?.id || ""),
          category_id: String(doc.category_id || doc.category?.id || ""),
          dtype_id: String(doc.dtype_id || doc.dtype?.id || ""),
          description: doc.description || "",
          expired_at: doc.expired_at ? String(doc.expired_at).split("T")[0] : null,
          document: null,
        });

        if (doc.document) {
          setExistingFile(doc.document);
        }

        const dLabel = doc.dtype?.dtype_name || "";
        setSelectedDtypeLabel(dLabel);

        // If not temporary (e.g. permanent), ensure expired_at is null
        if (dLabel && !dLabel.toLowerCase().includes("temporary")) {
          setDocumentData((prev) => ({ ...prev, expired_at: null }));
        }
      } catch (err) {
        toast.error(parseApiError(err, t("Failed to load document details!")));
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, t]);

  // Sync selectedDtypeLabel when dtypeOptions load if not yet resolved
  useEffect(() => {
    if (documentData.dtype_id && dtypeOptions.length > 0 && !selectedDtypeLabel) {
      const match = dtypeOptions.find((o) => String(o.value) === String(documentData.dtype_id));
      if (match) {
        setSelectedDtypeLabel(match.label);
        if (!match.label.toLowerCase().includes("temporary")) {
          setDocumentData((prev) => ({ ...prev, expired_at: null }));
        }
      }
    }
  }, [documentData.dtype_id, dtypeOptions, selectedDtypeLabel]);

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
        setExcelPreviewData(rows.slice(0, 20));
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
      setNewFile(file);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        parseExcelFile(file);
      } else {
        setExcelPreviewData([]);
      }
    }
  };

  const removeNewFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setExcelPreviewData([]);
    setExcelSheetName("");
    setNewFile(null);
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

  const handleChange = (field: string, value: string) => {
    setDocumentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const valid = validate([
      { field: "document_name", value: documentData.document_name, label: t("Document name"), required: true },
      { field: "staff_id", value: documentData.staff_id, label: t("Staff"), required: true },
      { field: "dtype_id", value: documentData.dtype_id, label: t("Document type"), required: true },
      { field: "category_id", value: documentData.category_id, label: t("Category"), required: true },
    ]);
    if (!valid) return;

    try {
      setIsSubmitting(true);
      const payload: UpdateDocument = {
        ...documentData,
        // Permanent document must never have an expiration date
        expired_at: isTemporary ? documentData.expired_at : null,
        document: newFile || null,
      };

      const data = await documentApi.update(payload);
      toast.success(data.message || t("Document updated successfully!"));
      navigate("/documents/");
    } catch (err: any) {
      toast.error(parseApiError(err, t("Failed to update document!")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileCategory = (filename: string) => {
    const name = filename.toLowerCase();
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".docx") || name.endsWith(".doc")) return "word";
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) return "excel";
    if (name.endsWith(".pptx") || name.endsWith(".ppt")) return "ppt";
    return "other";
  };

  const renderFileIcon = (filename: string) => {
    const category = getFileCategory(filename);
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

  const decodeFileName = (value?: string | null): string => {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const existingFileUrl = existingFile
    ? existingFile.startsWith("http")
      ? existingFile
      : `${API_SERVER}${existingFile.startsWith("/") ? "" : "/"}${existingFile}`
    : null;

  const rawFileName = existingFile ? existingFile.split("/").pop() || "Document File" : "";
  const existingFileName = decodeFileName(rawFileName);
  const decodedFilePath = decodeFileName(existingFile);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#B88E2F] mx-auto" />
        <p className="text-sm font-medium text-gray-500">{t("Loading document details...")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* SECTION 1: Document File Upload & Replacement */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">{t("Document File")}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Review current attached document or upload a replacement file.")}
            </p>
          </div>
          {newFile ? (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <RefreshCw size={14} className="animate-spin" /> {t("New File Selected")}
            </span>
          ) : existingFile ? (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={14} /> {t("File On Record")}
            </span>
          ) : null}
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-5">
            {/* New File Replaces Existing */}
            {newFile ? (
              <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between gap-4 group relative">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 shrink-0 flex items-center justify-center">
                    {renderFileIcon(newFile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-[#0f172a] truncate">{newFile.name}</h5>
                      {getCategoryBadge(getFileCategory(newFile.name))}
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {t("Replacement")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {formatFileSize(newFile.size)}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 truncate">
                        {newFile.type || "application/octet-stream"}
                      </span>
                    </div>
                  </div>
                </div>

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
                    onClick={removeNewFile}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-bold"
                    title={t("Cancel file replacement") || "Cancel file replacement"}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">{t("Revert")}</span>
                  </button>
                </div>
              </div>
            ) : existingFile ? (
              /* Existing File Card */
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 group relative">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 shrink-0 flex items-center justify-center">
                    {renderFileIcon(existingFileName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-[#0f172a] truncate">{existingFileName}</h5>
                      {getCategoryBadge(getFileCategory(existingFileName))}
                      <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {t("Attached")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={decodedFilePath}>
                      {decodedFilePath}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {existingFileUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(existingFileUrl, "_blank")}
                      className="px-3 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-bold"
                    >
                      <ExternalLink size={15} />
                      <span>{t("View Original File")}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Dropzone area to change/upload file */}
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? "border-[#B88E2F] bg-amber-50/50 scale-[0.99]"
                  : "border-gray-300 hover:border-[#B88E2F] bg-white hover:bg-gray-50/50"
              }`}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#B88E2F] flex items-center justify-center mb-2 shadow-xs">
                  <CloudUpload size={28} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {isDragActive
                    ? t("Drop the file here...")
                    : newFile
                    ? t("Click or drag another file to replace again")
                    : t("Click or drag to replace attached file (Optional)")}
                </h4>
                <p className="text-xs text-gray-500 max-w-md">
                  {t("Supports PDF, Word (.doc, .docx), Excel (.xls, .xlsx, .csv), and PowerPoint (.ppt, .pptx). Leave untouched to keep the existing file.")}
                </p>
              </div>
            </div>

            {/* Live Preview for newly selected file */}
            {newFile && filePreviewUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-[#B88E2F]" />
                    <span className="text-xs font-bold text-[#0f172a]">
                      {t("New File Preview")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-xl text-xs font-semibold text-gray-600">
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeTab === "preview"
                          ? "bg-white text-[#B88E2F] font-bold shadow-xs"
                          : "hover:text-gray-900"
                      }`}
                    >
                      {t("File Content View")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeTab === "details"
                          ? "bg-white text-[#B88E2F] font-bold shadow-xs"
                          : "hover:text-gray-900"
                      }`}
                    >
                      {t("File Metadata")}
                    </button>
                  </div>
                </div>

                {activeTab === "preview" && (
                  <div className="p-4 bg-slate-900/5 min-h-[300px]">
                    {getFileCategory(newFile.name) === "pdf" && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-slate-800">
                        <iframe
                          src={filePreviewUrl}
                          title="PDF Preview"
                          className="w-full h-[500px] border-0"
                        />
                      </div>
                    )}

                    {getFileCategory(newFile.name) === "excel" && (
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
                          <div className="overflow-auto max-h-[400px] max-w-full">
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
                          <div className="p-10 text-center text-gray-500">
                            <FileSpreadsheet size={40} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                            <p className="text-xs font-semibold">Spreadsheet File Attached</p>
                          </div>
                        )}
                      </div>
                    )}

                    {getFileCategory(newFile.name) === "word" && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{newFile.name}</h4>
                            <p className="text-xs text-gray-500">Microsoft Word Document (.docx)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {getFileCategory(newFile.name) === "ppt" && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                            <Presentation size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{newFile.name}</h4>
                            <p className="text-xs text-gray-500">PowerPoint Presentation (.pptx)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {getFileCategory(newFile.name) === "other" && (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <File size={40} className="mx-auto text-[#B88E2F] opacity-70 mb-2" />
                        <h4 className="text-xs font-bold text-gray-800">Document Attached</h4>
                        <p className="text-[11px] text-gray-500 mt-1">{newFile.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="p-5 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("File Name")}</span>
                        <span className="text-xs font-bold text-gray-900 truncate block mt-0.5">
                          {newFile.name}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("File Size")}</span>
                        <span className="text-xs font-bold text-gray-900 block mt-0.5">
                          {formatFileSize(newFile.size)} ({newFile.size} bytes)
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-400 block">{t("MIME Content Type")}</span>
                        <span className="text-xs font-mono font-bold text-gray-800 block mt-0.5 truncate">
                          {newFile.type || "application/octet-stream"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Document Information */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">{t("Document Information")}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Basic document details and organizational classification.")}
            </p>
          </div>
          {documentData.document_id && (
            <span className="px-3 py-1 bg-amber-50 text-[#B88E2F] border border-amber-200 text-xs font-mono font-bold rounded-full">
              {documentData.document_id}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Document ID */}
            <div>
              <Label htmlFor="doc_id_field">
                {t("Document ID")}
              </Label>
              <Input
                type="text"
                id="doc_id_field"
                value={documentData.document_id}
                disabled
                className="bg-gray-100 text-gray-500 border-gray-200"
              />
            </div>

            {/* Document Name */}
            <div>
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

            {/* Staff Member */}
            <div>
              <Label htmlFor="staff_id">
                {t("Staff Member")} <span className="text-rose-500">*</span>
              </Label>

              <Select
                options={staffOptions}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                value={
                  staffOptions.find(
                    (o) => String(o.value) === String(documentData.staff_id)
                  ) || null
                }
                onChange={(option) => handleChange("staff_id", option?.value || "")}
                isSearchable
                placeholder={t("Select staff...")}
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

                  // If permanent is selected, expiration cannot be applied
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
            <div className="md:col-span-2">
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
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">{t("Expiration Period")}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Set auto-expiration date (Applicable for Temporary document types).")}
            </p>
          </div>
          {!isTemporary && (
            <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Info size={14} />
              {selectedDtypeLabel ? t("Permanent Document (No Expiration)") : t("Select Document Type first")}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
            <div>
              <Label htmlFor="expiration">{t("Select Period")}</Label>
              <Select
                options={expirationOptions}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                value={expirationOptions.find((o) => o.value === selectedDuration) || null}
                onChange={handleDurationChange}
                isDisabled={!isTemporary}
                isClearable
                placeholder={isTemporary ? t("Select expiration period...") : t("Not applicable (Permanent document)")}
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
                    cursor: state.isDisabled ? "not-allowed" : "default",
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
            </div>

            {isTemporary && (
              <div>
                <Label htmlFor="custom_expired_at">{t("Or Specific Expiry Date")}</Label>
                <Input
                  type="date"
                  id="custom_expired_at"
                  value={documentData.expired_at ? String(documentData.expired_at).split("T")[0] : ""}
                  onChange={(e) => {
                    setSelectedDuration(null);
                    setDocumentData({ ...documentData, expired_at: e.target.value || null });
                  }}
                  className="bg-white border-gray-200"
                />
              </div>
            )}

            {isTemporary && documentData.expired_at ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-[#B88E2F]">
                <Clock size={16} />
                <span>{t("Expires on:")} {String(documentData.expired_at).split("T")[0]}</span>
              </div>
            ) : !isTemporary ? (
              <div className="p-3 bg-gray-100/80 rounded-xl border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                <Info size={16} className="text-gray-400 shrink-0" />
                <span>{t("Permanent documents do not expire. Expiration date cannot be applied.")}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* SECTION 4: Description & Remarks */}
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
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
        >
          {t("Cancel")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#B88E2F] hover:bg-[#997524] text-white text-xs font-bold rounded-2xl transition shadow-md shadow-amber-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>{t("Updating...")}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>{t("Update Document")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
