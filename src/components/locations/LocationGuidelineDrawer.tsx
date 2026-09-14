import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Camera,
  Calendar,
  HelpCircle,
  Share2,
  CheckCircle2,
  Layers
} from "lucide-react";

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function LocationGuidelineDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("activity_info");

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const guidelineSections: GuidelineSection[] = [
    {
      id: "activity_info",
      title: t("Activity & Location Information") || "Activity & Location Information",
      icon: <Layers size={18} className="text-[#B88E2F]" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Register new operational or field activity location records:") ||
              "Register new operational or field activity location records:"}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0f172a] font-medium">
            <li>
              <strong>{t("Activity Name") || "Activity Name"}:</strong>{" "}
              {t("Enter a descriptive name (e.g., Offshore Pipeline Inspection).") ||
                "Enter a descriptive name (e.g., Offshore Pipeline Inspection)."}
            </li>
            <li>
              <strong>{t("Activity Type") || "Activity Type"}:</strong>{" "}
              {t("Select or type custom activity category (Drilling, Inspection, Maintenance).") ||
                "Select or type custom activity category (Drilling, Inspection, Maintenance)."}
            </li>
            <li>
              <strong>{t("Department") || "Department"}:</strong>{" "}
              {t("Assign the managing department responsible for this site.") ||
                "Assign the managing department responsible for this site."}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "geo_location",
      title: t("Geographic Location & Map Picker") || "Geographic Location & Map Picker",
      icon: <MapPin size={18} className="text-rose-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Specify administrative location and precise coordinates:") ||
              "Specify administrative location and precise coordinates:"}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#0f172a]">
            <li>
              <strong>{t("City & Region") || "City & Region"}:</strong>{" "}
              {t("Provide City (e.g. Yangon) and State/Division (e.g. Yangon Region).") ||
                "Provide City (e.g. Yangon) and State/Division (e.g. Yangon Region)."}
            </li>
            <li>
              <strong>{t("Interactive Map Selector") || "Interactive Map Selector"}:</strong>{" "}
              {t("Click 'Select Location on Map' to pick precise Latitude and Longitude pins on the map.") ||
                "Click 'Select Location on Map' to pick precise Latitude and Longitude pins on the map."}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "activity_photos",
      title: t("Multiple Activity Photos & Hover Delete") || "Multiple Activity Photos & Hover Delete",
      icon: <Camera size={18} className="text-emerald-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Upload field photography for activity site documentation:") ||
              "Upload field photography for activity site documentation:"}
          </p>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {t("Multiple file uploads supported (JPEG, PNG, WEBP). Hover over any thumbnail preview to access the delete button.") ||
                "Multiple file uploads supported (JPEG, PNG, WEBP). Hover over any thumbnail preview to access the delete button."}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "activity_date",
      title: t("Activity Date & Description") || "Activity Date & Description",
      icon: <Calendar size={18} className="text-blue-600" />,
      content: (
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            {t("Select the exact activity date from the date picker and provide comprehensive field notes.") ||
              "Select the exact activity date from the date picker and provide comprehensive field notes."}
          </p>
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
                  {t("Activity Location Guideline") || "Activity Location Guideline"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {t("Instructions for registering activity records.") ||
                    "Instructions for registering activity records."}
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
