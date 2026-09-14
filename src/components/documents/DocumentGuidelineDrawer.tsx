import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  FileSpreadsheet,
  Clock,
  HelpCircle,
  Share2,
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function DocumentGuidelineDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("doc_info");

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const guidelineSections: GuidelineSection[] = [
    {
      id: "doc_info",
      title: t("Document Information & Types") || "Document Information & Types",
      icon: <FileText size={18} className="text-[#B88E2F]" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Fill in basic document details to ensure accurate record keeping:") ||
              "Fill in basic document details to ensure accurate record keeping:"}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0f172a] font-medium">
            <li>
              <strong>{t("Document Name") || "Document Name"}:</strong>{" "}
              {t("Enter a clear title (e.g., Annual Offshore Inspection 2026).") ||
                "Enter a clear title (e.g., Annual Offshore Inspection 2026)."}
            </li>
            <li>
              <strong>{t("Staff Member") || "Staff Member"}:</strong>{" "}
              {t("Assign the staff responsible for this document.") ||
                "Assign the staff responsible for this document."}
            </li>
            <li>
              <strong>{t("Document Type") || "Document Type"}:</strong>{" "}
              {t("Select Permanent (indefinite validity) or Temporary (auto-expires).") ||
                "Select Permanent (indefinite validity) or Temporary (auto-expires)."}
            </li>
            <li>
              <strong>{t("Category") || "Category"}:</strong>{" "}
              {t("Classify under department categories for indexing.") ||
                "Classify under department categories for indexing."}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "supported_formats",
      title: t("Supported Formats & Live Preview") || "Supported Formats & Live Preview",
      icon: <FileSpreadsheet size={18} className="text-emerald-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("The system accepts standard office formats up to 10MB:") ||
              "The system accepts standard office formats up to 10MB:"}
          </p>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="font-bold text-rose-800">PDF (.pdf)</span>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-blue-800">Word (.doc, .docx)</span>
            </div>
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-emerald-800">Excel (.xls, .xlsx, .csv)</span>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-bold text-amber-800">PPT (.ppt, .pptx)</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#B88E2F] shrink-0 mt-0.5" />
            <span>
              {t("Live Content Preview: Uploaded PDF pages & Excel data tables can be reviewed live inside the card before saving.") ||
                "Live Content Preview: Uploaded PDF pages & Excel data tables can be reviewed live inside the card before saving."}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "expiration_period",
      title: t("Expiration Period (Temporary Docs)") || "Expiration Period (Temporary Docs)",
      icon: <Clock size={18} className="text-amber-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("For Temporary documents, auto-expiration allows system tracking:") ||
              "For Temporary documents, auto-expiration allows system tracking:"}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0f172a]">
            <li>{t("Available periods: 1 Month, 2 Months, 3 Months, or 6 Months.") || "Available periods: 1 Month, 2 Months, 3 Months, or 6 Months."}</li>
            <li>{t("The system automatically calculates the exact expiration date.") || "The system automatically calculates the exact expiration date."}</li>
            <li>{t("Permanent documents do not require an expiration date.") || "Permanent documents do not require an expiration date."}</li>
          </ul>
        </div>
      ),
    },
    {
      id: "description_notes",
      title: t("Description & Internal Remarks") || "Description & Internal Remarks",
      icon: <Info size={18} className="text-blue-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Use the Description text area to store contract references, archival tags, or department notes.") ||
              "Use the Description text area to store contract references, archival tags, or department notes."}
          </p>
        </div>
      ),
    },
    {
      id: "troubleshooting",
      title: t("File Replacement & Troubleshooting") || "File Replacement & Troubleshooting",
      icon: <HelpCircle size={18} className="text-purple-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("To replace an attached document, simply drag a new file over the upload zone or click the 'Remove' button.") ||
              "To replace an attached document, simply drag a new file over the upload zone or click the 'Remove' button."}
          </p>
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>
              {t("If you encounter an error, verify the file is not password-protected and is a supported format.") ||
                "If you encounter an error, verify the file is not password-protected and is a supported format."}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* FLOATING SIDE TAB BUTTON (Fixed on Right Edge) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-r-0 border-gray-200 rounded-l-2xl shadow-xl py-3 px-2 flex flex-col items-center gap-2 hover:bg-amber-50/60 transition-all cursor-pointer group hover:pl-3"
        title={t("View Guideline") || "View Guideline"}
      >
        <div className="w-7 h-7 rounded-xl bg-[#0052cc] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
          <Share2 size={14} className="rotate-90" />
        </div>
        <span className="[writing-mode:vertical-lr] text-xs font-extrabold text-gray-800 tracking-wide group-hover:text-[#B88E2F] transition-colors">
          {t("View Guideline") || "View Guideline"}
        </span>
      </button>

      {/* OFF-CANVAS SIDE DRAWER MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Container (Right Side Panel) */}
          <div className="fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-extrabold text-[#0f172a] flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#B88E2F]" />
                  {t("Document Guideline") || "Document Guideline"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {t("User instructions and upload guidelines.") ||
                    "User instructions and upload guidelines."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body - Accordion Items */}
            <div className="p-6 space-y-3 flex-1">
              {guidelineSections.map((section) => {
                const isExpanded = expandedId === section.id;
                return (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-white shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-center justify-between bg-gray-50/70 hover:bg-gray-100/70 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-2xs">
                          {section.icon}
                        </div>
                        <span className="text-xs font-bold text-[#0f172a]">
                          {section.title}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-gray-100 bg-white animate-in fade-in duration-200">
                        {section.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 text-center text-xs text-gray-500 font-medium">
              {t("Need more help? Contact your System Administrator.") || "Need more help? Contact your System Administrator."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
