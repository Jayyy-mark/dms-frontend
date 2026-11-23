import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useDropzone } from "react-dropzone";
import {
  CloudUpload,
  X,
  Trash2,
  MapPin,
  Image as ImageIcon,
  Save,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import TextArea from "../form/input/TextArea.tsx";
import DatePicker from "../form/date-picker.tsx";
import FieldError from "../form/FieldError.tsx";
import LocationModal from "./LocationModal.tsx";
import ActionButton from "../ui/button/ActionButton.tsx";

import {
  UpdateLocation,
  LocationOptions,
  LocationPhotoItem,
} from "../../interfaces/location.ts";
import { locationApi } from "../../api/locationApi.ts";
import { helper } from "../../helpers/utils.ts";
import { API_SERVER } from "../../helpers/api.ts";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

interface NewPhotoPreview {
  file: File;
  previewUrl: string;
}

const emptyLocation: UpdateLocation = {
  id: 0,
  location_id: "",
  location_name: "",
  photo: null,
  photos: [],
  city: "",
  latitude: "",
  longitude: "",
  description: "",
  date: null,
  location_type: "",
  department_id: "",
  state_division: "",
};

export default function EditLocationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dateRef = useRef<any>(null);

  const { errors, validate } = useFormErrors<UpdateLocation>();
  const [location, setLocation] = useState<UpdateLocation>(emptyLocation);
  const [loading, setLoading] = useState(isEditMode);
  const [showMap, setShowMap] = useState(false);

  // Existing photos state
  const [existingPhotos, setExistingPhotos] = useState<LocationPhotoItem[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
  const [legacyPhotoPath, setLegacyPhotoPath] = useState<string | null>(null);
  const [removeLegacyPhoto, setRemoveLegacyPhoto] = useState(false);

  // Newly added photos state
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<NewPhotoPreview[]>([]);

  const getFullPhotoUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_SERVER}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Cleanup preview object URLs on unmount
  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchLocation = async () => {
      try {
        const data = await locationApi.getById(id);
        const loc = data.location;
        const deptId =
          loc.department_id ??
          (typeof loc.department === "object"
            ? loc.department?.id ?? loc.department?.department_id
            : loc.department) ??
          "";

        setLocation({
          ...loc,
          latitude: loc.latitude !== null && loc.latitude !== undefined ? String(loc.latitude) : "",
          longitude: loc.longitude !== null && loc.longitude !== undefined ? String(loc.longitude) : "",
          city: loc.city || "",
          state_division: loc.state_division || "",
          description: loc.description || "",
          location_type: loc.location_type || "",
          department_id: deptId ? String(deptId) : "",
        });

        const photoList: LocationPhotoItem[] = Array.isArray(loc.photos) ? loc.photos : [];
        setExistingPhotos(photoList);

        // If a standalone legacy location.photo exists and isn't already in location.photos
        if (
          loc.photo &&
          typeof loc.photo === "string" &&
          !photoList.some((p) => p.photo === loc.photo)
        ) {
          setLegacyPhotoPath(loc.photo);
        } else {
          setLegacyPhotoPath(null);
        }
      } catch (err) {
        console.error("Failed to fetch location", err);
        toast.error(t("Failed to load location details") || "Failed to load location details");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  // Dropzone for adding new photos
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const added: NewPhotoPreview[] = acceptedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewPhotoPreviews((prev) => [...prev, ...added]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
      "image/svg+xml": [],
      "image/avif": [],
    },
  });

  const toggleDeleteExistingPhoto = (photoId: number) => {
    setDeletedPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((item) => item !== photoId) : [...prev, photoId]
    );
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoPreviews((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const activeExistingCount =
    existingPhotos.filter((p) => !deletedPhotoIds.includes(p.id)).length +
    (legacyPhotoPath && !removeLegacyPhoto ? 1 : 0);
  const totalPhotoCount = activeExistingCount + newPhotoPreviews.length;

  const { options: departmentOptions } = useSelectOptions(
    helper.fetchDepartments,
    "department_name"
  );

  const [locationOptions, setLocationOptions] = useState<LocationOptions | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const options = await locationApi.getOptions();
        setLocationOptions(options);
      } catch (error) {
        console.error("Failed to fetch location options", error);
      }
    };
    fetchOptions();
  }, []);

  const [customTypeOptions, setCustomTypeOptions] = useState<string[]>([]);
  const [typeInputValue, setTypeInputValue] = useState("");
  const [isManualTypeInput, setIsManualTypeInput] = useState(false);

  const locationTypeOptions = useMemo(() => {
    const fromApi = locationOptions?.location_types || [];
    const combined = Array.from(
      new Set(
        [...fromApi, ...customTypeOptions, location.location_type]
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter(Boolean)
      )
    );
    return combined.map((type) => ({
      value: type,
      label: type,
    }));
  }, [locationOptions, customTypeOptions, location.location_type]);

  const handleSelectOrCreateType = (inputValue: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      handleChange("location_type", "");
      return;
    }

    const existing = locationTypeOptions.find(
      (opt) => opt.value.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      handleChange("location_type", existing.value);
    } else {
      setCustomTypeOptions((prev) => Array.from(new Set([...prev, trimmed])));
      handleChange("location_type", trimmed);
      toast.info(`${t("New activity type added") || "New activity type added"}: "${trimmed}"`);
    }
  };

  const handleChange = (field: string, value: any) => {
    setLocation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const valid = validate([
      { field: "location_name", value: location.location_name, label: t("Location / Activity name"), required: true },
      { field: "city", value: location.city, label: t("City"), required: true },
      { field: "state_division", value: location.state_division, label: t("State/Division"), required: true },
      { field: "location_type", value: location.location_type, label: t("Activity type"), required: true },
      { field: "department_id", value: location.department_id, label: t("Department"), required: true },
    ]);

    if (!valid) return;

    try {
      const data = await locationApi.update({
        ...location,
        new_photos: newPhotoPreviews.map((item) => item.file),
        deleted_photo_ids: deletedPhotoIds,
        remove_legacy_photo: removeLegacyPhoto,
      });
      toast.success(data?.message || t("Updated successfully!"));
      navigate("/locations/");
    } catch (err: unknown) {
      toast.error(parseApiError(err, t("Something went wrong!")));
    }
  };

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: "0.75rem",
      minHeight: "44px",
      borderColor: state.isFocused ? "#B88E2F" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(184, 142, 47, 0.15)" : "none",
      padding: "2px",
      fontSize: "0.875rem",
      backgroundColor: "#ffffff",
      "&:hover": {
        borderColor: "#B88E2F",
      },
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#FEF3C7"
        : state.isFocused
        ? "#fffbe0"
        : "#ffffff",
      color: state.isSelected ? "#B88E2F" : "#1e293b",
      cursor: "pointer",
      fontWeight: state.isSelected ? 600 : 400,
    }),
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-56 bg-white rounded-3xl border border-gray-200" />
        <div className="h-64 bg-white rounded-3xl border border-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* SECTION 1: Activity Photos (Editable Existing + New Dropzone) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">
              {t("Activity Photos")}
            </h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Manage existing photos or upload additional photos. JPEG, PNG, WEBP supported.")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 text-[#B88E2F] border border-amber-200 text-xs font-bold rounded-full">
              {totalPhotoCount}{" "}
              {totalPhotoCount === 1 ? t("photo") : t("photos")}
            </span>
            {newPhotoPreviews.length > 0 && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                +{newPhotoPreviews.length} {t("new")}
              </span>
            )}
            {(deletedPhotoIds.length > 0 || removeLegacyPhoto) && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-full">
                -{deletedPhotoIds.length + (removeLegacyPhoto ? 1 : 0)}{" "}
                {t("removed")}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-6">
            {/* Existing + New Photos Grid */}
            {(existingPhotos.length > 0 ||
              legacyPhotoPath ||
              newPhotoPreviews.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#B88E2F]" />{" "}
                    {t("Current & New Activity Photos")}
                  </h4>
                  {(deletedPhotoIds.length > 0 || removeLegacyPhoto) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeletedPhotoIds([]);
                        setRemoveLegacyPhoto(false);
                      }}
                      className="text-xs font-semibold text-gray-600 hover:text-[#B88E2F] flex items-center gap-1 transition"
                    >
                      <RotateCcw size={13} /> {t("Undo all removals")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Legacy primary photo if not already in photos list */}
                  {legacyPhotoPath && (
                    <div
                      className={`group relative rounded-2xl overflow-hidden border bg-white shadow-xs aspect-square flex items-center justify-center transition ${
                        removeLegacyPhoto
                          ? "border-rose-300 opacity-50 grayscale"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={getFullPhotoUrl(legacyPhotoPath)}
                        alt={location.location_name}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-xs ${
                          removeLegacyPhoto
                            ? "bg-rose-600 text-white"
                            : "bg-white/90 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {removeLegacyPhoto ? t("Marked for removal") : t("Saved")}
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
                        <a
                          href={getFullPhotoUrl(legacyPhotoPath)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white hover:bg-gray-100 text-gray-800 rounded-full shadow-md transition transform hover:scale-110"
                          title={t("View Original") || "View Original"}
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setRemoveLegacyPhoto((prev) => !prev)}
                          className={`p-2 text-white rounded-full shadow-md transition transform hover:scale-110 ${
                            removeLegacyPhoto
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-rose-600 hover:bg-rose-700"
                          }`}
                          title={
                            removeLegacyPhoto
                              ? t("Restore photo") || "Restore photo"
                              : t("Remove photo") || "Remove photo"
                          }
                        >
                          {removeLegacyPhoto ? (
                            <RotateCcw size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Saved LocationPhoto records */}
                  {existingPhotos.map((item) => {
                    const isMarkedDeleted = deletedPhotoIds.includes(item.id);
                    const fullUrl = getFullPhotoUrl(item.photo);
                    return (
                      <div
                        key={`existing-${item.id}`}
                        className={`group relative rounded-2xl overflow-hidden border bg-white shadow-xs aspect-square flex items-center justify-center transition ${
                          isMarkedDeleted
                            ? "border-rose-300 opacity-50 grayscale"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={fullUrl}
                          alt={`Photo #${item.id}`}
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                        />
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-xs ${
                            isMarkedDeleted
                              ? "bg-rose-600 text-white"
                              : "bg-white/90 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {isMarkedDeleted ? t("Removing") : t("Saved")}
                        </span>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white hover:bg-gray-100 text-gray-800 rounded-full shadow-md transition transform hover:scale-110"
                            title={t("View Original") || "View Original"}
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => toggleDeleteExistingPhoto(item.id)}
                            className={`p-2 text-white rounded-full shadow-md transition transform hover:scale-110 ${
                              isMarkedDeleted
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-rose-600 hover:bg-rose-700"
                            }`}
                            title={
                              isMarkedDeleted
                                ? t("Restore photo") || "Restore photo"
                                : t("Remove photo") || "Remove photo"
                            }
                          >
                            {isMarkedDeleted ? (
                              <RotateCcw size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Newly Added Photos */}
                  {newPhotoPreviews.map((item, index) => (
                    <div
                      key={`new-${index}`}
                      className="group relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-white shadow-xs aspect-square flex items-center justify-center"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-xs">
                        {t("New")}
                      </span>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-between p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNewPhoto(index);
                          }}
                          className="self-end p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition transform hover:scale-110"
                          title={t("Remove photo") || "Remove photo"}
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="w-full truncate text-[10px] font-medium text-white bg-black/60 px-2 py-1 rounded-md text-center">
                          {item.file.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropzone Container */}
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
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#B88E2F] flex items-center justify-center mb-3 shadow-xs">
                  <CloudUpload size={28} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {isDragActive
                    ? t("Drop the photos here...")
                    : t("Click to add more photos or drag and drop")}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  {t("Upload one or multiple photos to append to this activity record (Max 5MB each).")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Activity Information */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">
              {t("Activity Information")}
            </h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Update basic activity details and departmental classification.")}
            </p>
          </div>
          {location.location_id && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 font-mono text-xs font-bold rounded-full">
              {location.location_id}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Location / Activity Name */}
            <div>
              <Label htmlFor="location_name">
                {t("Activity / Location Name")}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                name="location_name"
                id="location_name"
                placeholder={t("Ex: Offshore Drilling Inspection") || ""}
                value={location.location_name}
                onChange={(e) => handleChange("location_name", e.target.value)}
                className="bg-white border-gray-200"
              />
              <FieldError message={errors.location_name} />
            </div>

            {/* Activity Type */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="location_type" className="mb-0">
                  {t("Activity Type")} <span className="text-rose-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  {location.location_type && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {locationOptions?.location_types?.includes(
                        location.location_type
                      )
                        ? t("Existing type") || "Existing type"
                        : t("New type") || "New type"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualTypeInput(!isManualTypeInput);
                      setTypeInputValue("");
                    }}
                    className="text-xs font-semibold text-[#B88E2F] hover:text-amber-700 hover:underline transition-colors flex items-center gap-1"
                  >
                    {isManualTypeInput
                      ? t("← Select from list") || "← Select from list"
                      : t("+ Type custom directly") || "+ Type custom directly"}
                  </button>
                </div>
              </div>

              {isManualTypeInput ? (
                <div className="relative">
                  <Input
                    name="location_type"
                    id="location_type"
                    placeholder={
                      t("Type custom activity type...") ||
                      "Type custom activity type..."
                    }
                    value={location.location_type}
                    onChange={(e) => handleSelectOrCreateType(e.target.value)}
                    className="bg-white border-gray-200 pr-10"
                    autoFocus
                  />
                  {location.location_type && (
                    <button
                      type="button"
                      onClick={() => handleChange("location_type", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      title={t("Clear") || "Clear"}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ) : (
                <CreatableSelect
                  isClearable
                  isSearchable
                  createOptionPosition="first"
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                  options={locationTypeOptions}
                  value={
                    locationTypeOptions.find(
                      (o) => o.value === location.location_type
                    ) ||
                    (location.location_type
                      ? {
                          value: location.location_type,
                          label: location.location_type,
                        }
                      : null)
                  }
                  inputValue={typeInputValue}
                  onInputChange={(newInput, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      setTypeInputValue(newInput);
                    } else if (
                      actionMeta.action === "set-value" ||
                      actionMeta.action === "menu-close"
                    ) {
                      setTypeInputValue("");
                    }
                  }}
                  onChange={(option) => {
                    if (option) {
                      handleSelectOrCreateType(option.value);
                    } else {
                      handleChange("location_type", "");
                    }
                    setTypeInputValue("");
                  }}
                  onCreateOption={(newOption) => {
                    handleSelectOrCreateType(newOption);
                    setTypeInputValue("");
                  }}
                  onBlur={() => {
                    if (typeInputValue.trim()) {
                      handleSelectOrCreateType(typeInputValue.trim());
                      setTypeInputValue("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && typeInputValue.trim()) {
                      e.preventDefault();
                      handleSelectOrCreateType(typeInputValue.trim());
                      setTypeInputValue("");
                    }
                  }}
                  isValidNewOption={(inputValue, _selectValue, selectOptions) => {
                    const trimmed = inputValue?.trim();
                    if (!trimmed) return false;
                    return !selectOptions.some(
                      (opt) =>
                        Boolean(opt?.label) &&
                        String(opt.label).trim().toLowerCase() ===
                          trimmed.toLowerCase()
                    );
                  }}
                  placeholder={
                    locationTypeOptions.length === 0
                      ? t("Type new or select...")
                      : t("Select or type type...")
                  }
                  formatCreateLabel={(inputValue) =>
                    `+ ${t("Create new")} "${inputValue}"`
                  }
                  noOptionsMessage={({ inputValue }) =>
                    inputValue?.trim()
                      ? `${t("Press Enter to create")} "${inputValue}"`
                      : t("No options. Type to create new...")
                  }
                  styles={selectStyles}
                />
              )}
              <FieldError message={errors.location_type} />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department_id">
                {t("Department")} <span className="text-rose-500">*</span>
              </Label>
              <Select
                options={departmentOptions}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                value={
                  departmentOptions.find(
                    (o) =>
                      String(o.value) === String(location.department_id) ||
                      (o.data &&
                        String(o.data.department_id) ===
                          String(location.department_id)) ||
                      (location.department_name &&
                        o.label === location.department_name) ||
                      (location.department &&
                        typeof location.department === "object" &&
                        "department_name" in location.department &&
                        o.label ===
                          (location.department as any).department_name)
                  ) || null
                }
                onChange={(option) =>
                  handleChange("department_id", option?.value || "")
                }
                isSearchable
                isClearable
                placeholder={
                  departmentOptions.length === 0
                    ? t("Loading departments...")
                    : t("Select department...")
                }
                styles={selectStyles}
              />
              <FieldError message={errors.department_id} />
            </div>

            {/* Activity Date */}
            <div>
              <Label htmlFor="date">{t("Activity Date")}</Label>
              <div className="relative">
                {location.date && (
                  <button
                    type="button"
                    onClick={() => {
                      dateRef.current?.clear();
                      handleChange("date", null);
                    }}
                    className="absolute right-9 top-1/2 -translate-y-1/2 z-10 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                  >
                    <X size={15} />
                  </button>
                )}
                <DatePicker
                  ref={dateRef}
                  id="date"
                  key={
                    location.id
                      ? `date-${location.id}-${String(location.date)}`
                      : "date-default"
                  }
                  placeholder={t("Select date") || "Select date"}
                  defaultDate={
                    location.date
                      ? typeof location.date === "string"
                        ? location.date
                        : helper.formatDate(location.date)
                      : undefined
                  }
                  onChange={(dates) => handleChange("date", dates[0] || null)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Geographic Location Details */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#0f172a]">
            {t("Geographic Location Details")}
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            {t("Specify location city, state/division, and coordinates.")}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* City */}
              <div>
                <Label htmlFor="city">
                  {t("City")} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  name="city"
                  id="city"
                  placeholder={t("Ex: Yangon") || ""}
                  value={location.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="bg-white border-gray-200"
                />
                <FieldError message={errors.city} />
              </div>

              {/* State / Division */}
              <div>
                <Label htmlFor="state_division">
                  {t("State / Division")}{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Input
                  name="state_division"
                  id="state_division"
                  placeholder={t("Ex: Yangon Region") || ""}
                  value={location.state_division}
                  onChange={(e) =>
                    handleChange("state_division", e.target.value)
                  }
                  className="bg-white border-gray-200"
                />
                <FieldError message={errors.state_division} />
              </div>
            </div>

            {/* Coordinates & Map Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
              <div>
                <Label htmlFor="latitude">{t("Latitude")}</Label>
                <Input
                  name="latitude"
                  id="latitude"
                  placeholder={t("e.g. 16.840900") || "16.840900"}
                  value={location.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="longitude">{t("Longitude")}</Label>
                <Input
                  name="longitude"
                  id="longitude"
                  placeholder={t("e.g. 96.173500") || "96.173500"}
                  value={location.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-[#FEF3C7] text-[#B88E2F] border border-amber-300 text-xs font-bold rounded-2xl hover:bg-amber-100 transition shadow-xs"
                >
                  <MapPin size={16} /> {t("Select Location on Map")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Description & Details */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#0f172a]">
            {t("Description & Details")}
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            {t("Add detailed descriptions, notes, or remarks for this activity record.")}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
            <Label htmlFor="description">{t("Activity Description")}</Label>
            <TextArea
              id="description"
              rows={5}
              placeholder={t("Enter activity description and details...") || ""}
              value={location.description}
              onChange={(value) => handleChange("description", value)}
              className="bg-white border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/locations/")}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
        >
          {t("Cancel")}
        </button>
        <ActionButton
          type="button"
          onClick={handleSubmit}
          loadingText={`${t("Updating")}...`}
          className="px-6 py-2.5 bg-[#B88E2F] hover:bg-[#997524] text-white text-xs font-bold rounded-2xl transition shadow-md shadow-amber-200 flex items-center gap-2"
        >
          <Save size={16} /> {t("Update Activity Record")}
        </ActionButton>
      </div>

      {/* Interactive Offline Map Selector Modal */}
      {showMap && (
        <LocationModal
          initialLat={location.latitude}
          initialLng={location.longitude}
          onClose={() => setShowMap(false)}
          onSelect={(position) => {
            setLocation((prev) => ({
              ...prev,
              latitude: position.lat,
              longitude: position.lng,
              city: position.city || prev.city,
              state_division: position.state_division || prev.state_division,
            }));
            setShowMap(false);
          }}
        />
      )}
    </div>
  );
}
