import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  X,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  Pencil,
  Image as ImageIcon,
  FileText
} from "lucide-react";

import { Location } from "../../interfaces/location";
import { API_SERVER } from "../../helpers/api";
import { helper } from "../../helpers/utils";

interface LocationDetailDrawerProps {
  location: Location;
  onClose: () => void;
}

export default function LocationDetailDrawer({
  location,
  onClose,
}: LocationDetailDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Collect all photos attached to this location
  const allPhotos: string[] = [];
  if (location.photo && typeof location.photo === "string") {
    allPhotos.push(location.photo);
  }
  if (location.photos && Array.isArray(location.photos)) {
    location.photos.forEach((p) => {
      if (p.photo && typeof p.photo === "string" && !allPhotos.includes(p.photo)) {
        allPhotos.push(p.photo);
      }
    });
  }

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const getFullPhotoUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${API_SERVER}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const activePhotoUrl =
    allPhotos.length > 0 ? getFullPhotoUrl(allPhotos[activePhotoIndex] || allPhotos[0]) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0f172a] truncate max-w-[260px]">
                {location.location_name || t("Location Details")}
              </h3>
              {location.location_type && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-[#B88E2F] border border-amber-200">
                  {location.location_type}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-gray-400 mt-0.5">
              ID: {location.location_id || location.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PHOTO GALLERY PREVIEW SECTION */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={15} className="text-[#B88E2F]" />
                {t("Activity Photos")}
              </h4>
              <span className="text-[11px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                {allPhotos.length} {allPhotos.length === 1 ? t("Photo") : t("Photos")}
              </span>
            </div>

            {/* Featured Photo Viewer */}
            {activePhotoUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-900 aspect-[4/3] flex items-center justify-center">
                <img
                  src={activePhotoUrl}
                  alt={location.location_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => window.open(activePhotoUrl, "_blank")}
                    className="px-3 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md hover:bg-gray-100 transition flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    {t("View Original")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white text-gray-400">
                <ImageIcon size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">{t("No photos attached for this location")}</p>
              </div>
            )}

            {/* Thumbnail Strip (if multiple photos) */}
            {allPhotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {allPhotos.map((photoPath, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${activePhotoIndex === idx
                      ? "border-[#B88E2F] ring-2 ring-[#B88E2F]/20 scale-105"
                      : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={getFullPhotoUrl(photoPath)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMATION DETAILS GRID */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("Location Information")}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* City */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {t("City")}
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                  {location.city || "—"}
                </span>
              </div>

              {/* State / Division */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {t("State / Division")}
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                  {location.state_division || "—"}
                </span>
              </div>

              {/* Activity Date */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Calendar size={12} /> {t("Activity Date")}
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                  {location.date ? helper.formatDate(new Date(location.date)) : "—"}
                </span>
              </div>

              {/* Department */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Building2 size={12} /> {t("Department")}
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                  {location.department_id || "—"}
                </span>
              </div>
            </div>

            {/* Geographic Coordinates & Map Link */}
            {(location.latitude || location.longitude) && (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#B88E2F]">
                    <MapPin size={16} />
                    <span>{t("Geographic Coordinates")}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {t("Google Maps")} <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono font-semibold text-gray-700 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                  <div>Lat: {location.latitude || "N/A"}</div>
                  <div>Lng: {location.longitude || "N/A"}</div>
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION SECTION */}
          {location.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <FileText size={14} /> {t("Description & Remarks")}
              </h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
                {location.description}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            {t("Close")}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/locations/edit/${location.id}`)}
            className="px-4 py-2 bg-[#B88E2F] hover:bg-[#997524] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Pencil size={14} />
            {t("Edit Location")}
          </button>
        </div>
      </div>
    </>
  );
}
