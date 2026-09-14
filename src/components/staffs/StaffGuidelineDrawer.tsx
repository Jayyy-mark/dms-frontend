import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  BadgeCheck,
  Camera,
  HelpCircle,
  Share2,
  CheckCircle2
} from "lucide-react";

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function StaffGuidelineDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("personal_info");

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const guidelineSections: GuidelineSection[] = [
    {
      id: "personal_info",
      title: t("Personal Identification") || "Personal Identification",
      icon: <User size={18} className="text-[#B88E2F]" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Enter essential personnel identity information:") ||
              "Enter essential personnel identity information:"}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0f172a] font-medium">
            <li>
              <strong>{t("Staff Name") || "Staff Name"}:</strong>{" "}
              {t("Full legal name as specified on official identity documents.") ||
                "Full legal name as specified on official identity documents."}
            </li>
            <li>
              <strong>{t("NRC / Passport Number") || "NRC / Passport Number"}:</strong>{" "}
              {t("National Registration Card or Passport number.") ||
                "National Registration Card or Passport number."}
            </li>
            <li>
              <strong>{t("Gender & Date of Birth") || "Gender & Date of Birth"}:</strong>{" "}
              {t("Select gender and birth date for personnel records.") ||
                "Select gender and birth date for personnel records."}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "employment_assignment",
      title: t("Employment Assignment & Department") || "Employment Assignment & Department",
      icon: <Building2 size={18} className="text-blue-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Assign organizational role and location bounds:") ||
              "Assign organizational role and location bounds:"}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0f172a]">
            <li>
              <strong>{t("Staff Code") || "Staff Code"}:</strong>{" "}
              {t("Unique employee ID code generated or assigned by HR.") ||
                "Unique employee ID code generated or assigned by HR."}
            </li>
            <li>
              <strong>{t("Designation & Department") || "Designation & Department"}:</strong>{" "}
              {t("Assign official title and primary department.") ||
                "Assign official title and primary department."}
            </li>
            <li>
              <strong>{t("Building Location") || "Building Location"}:</strong>{" "}
              {t("Specify office building location assignment.") ||
                "Specify office building location assignment."}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "qualifications",
      title: t("Qualifications & Certifications") || "Qualifications & Certifications",
      icon: <BadgeCheck size={18} className="text-emerald-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Record staff educational background, technical certifications, and skill qualifications.") ||
              "Record staff educational background, technical certifications, and skill qualifications."}
          </p>
        </div>
      ),
    },
    {
      id: "profile_photo",
      title: t("Profile Photo Registration") || "Profile Photo Registration",
      icon: <Camera size={18} className="text-amber-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Upload a clear passport-style photo for official staff ID generation.") ||
              "Upload a clear passport-style photo for official staff ID generation."}
          </p>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#B88E2F] shrink-0 mt-0.5" />
            <span>
              {t("Supported formats: JPEG, PNG, WEBP. Max file size: 5MB.") ||
                "Supported formats: JPEG, PNG, WEBP. Max file size: 5MB."}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* FLOATING SIDE TAB BUTTON */}
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
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-extrabold text-[#0f172a] flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#B88E2F]" />
                  {t("Staff Registration Guideline") || "Staff Registration Guideline"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {t("Step-by-step instructions for HR personnel registration.") ||
                    "Step-by-step instructions for HR personnel registration."}
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

            {/* Accordion Body */}
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

            <div className="p-5 border-t border-gray-100 bg-gray-50/80 text-center text-xs text-gray-500 font-medium">
              Need more help? Contact your System Administrator.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
