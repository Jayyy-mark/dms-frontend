import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { CloudUpload, X, Trash2, MapPin, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import FieldError from "../form/FieldError";
import DatePicker from "../form/date-picker";
import LocationModal from "./LocationModal";

import { AddLocation, LocationOptions } from "../../interfaces/location";
import { locationApi } from "../../api/locationApi";
import { useSelectOptions } from "../../hooks/useSelectOptions";
import { helper } from "../../helpers/utils";
import { useFormErrors } from "../../hooks/useFormErrors";
import { parseApiError } from "../../helpers/parseApiError";

interface PhotoPreviewItem {
  file: File;
  previewUrl: string;
}

export default function AddLocationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dateRef = useRef<any>(null);
  const [showMap, setShowMap] = useState(false);
  const { errors, validate } = useFormErrors<AddLocation>();

  const [form, setForm] = useState<AddLocation>({
    location_name: "",
    photo: null,
    photos: [],
    city: "",
    state_division: "",
    latitude: "",
    longitude: "",
    description: "",
    date: null,
    location_type: "",
    department_id: "",
  });

  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewItem[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newItems: PhotoPreviewItem[] = acceptedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotoPreviews((prev) => [...prev, ...newItems]);
    setForm((prev) => {
      const updatedPhotos = [...(prev.photos || []), ...acceptedFiles];
      return {
        ...prev,
        photos: updatedPhotos,
        photo: updatedPhotos[0] || null,
        location_name: prev.location_name || acceptedFiles[0]?.name.replace(/\.[^/.]+$/, "") || "",
      };
    });
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });

    setForm((prev) => {
      const updatedPhotos = (prev.photos || []).filter((_, i) => i !== index);
      return {
        ...prev,
        photos: updatedPhotos,
        photo: updatedPhotos[0] || null,
      };
    });
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

  // Select Options
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

  const locationTypeOptions =
    locationOptions?.location_types.map((type) => ({
      value: type,
      label: type,
    })) || [];

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const valid = validate([
      { field: "location_name", value: form.location_name, label: t("Location / Activity name"), required: true },
      { field: "city", value: form.city, label: t("City"), required: true },
      { field: "state_division", value: form.state_division, label: t("State/Division"), required: true },
      { field: "location_type", value: form.location_type, label: t("Activity type"), required: true },
      { field: "department_id", value: form.department_id, label: t("Department"), required: true },
    ]);

    if (!valid) return;

    try {
      const data = await locationApi.create(form);
      toast.success(data?.message || t("Activity location created successfully!"));
      navigate("/locations/");
    } catch (error: any) {
      toast.error(parseApiError(error, t("Failed to create activity location!")));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* SECTION 3: Activity Photos (Multiple Upload with Preview Grid & Hover Delete) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">{t("Activity Photos")}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {t("Upload multiple photos for this activity record. JPEG, PNG, WEBP supported.")}
            </p>
          </div>
          {photoPreviews.length > 0 && (
            <span className="px-3 py-1 bg-amber-50 text-[#B88E2F] border border-amber-200 text-xs font-bold rounded-full">
              {photoPreviews.length} {photoPreviews.length === 1 ? t("photo selected") : t("photos selected")}
            </span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Dropzone Container */}
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? "border-[#B88E2F] bg-amber-50/50 scale-[0.99]"
                : "border-gray-300 hover:border-[#B88E2F] bg-white hover:bg-gray-50/50"
                }`}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#B88E2F] flex items-center justify-center mb-3 shadow-xs">
                  <CloudUpload size={32} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {isDragActive ? t("Drop the photos here...") : t("Click to upload or drag and drop")}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  {t("Upload one or multiple photos for this activity record (Max 5MB each).")}
                </p>
              </div>
            </div>

            {/* Photo Preview Grid with Cross/Trash Hover Button */}
            {photoPreviews.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#B88E2F]" /> {t("Selected Photos Preview")}
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {photoPreviews.map((item, index) => (
                    <div
                      key={index}
                      className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs aspect-square flex items-center justify-center"
                    >
                      {/* Image Thumbnail */}
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Hover Overlay & Cross/Trash Action Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-between p-2">
                        {/* Remove Cross / Trash Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
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
          </div>
        </div>
      </div>

      {/* SECTION 1: Activity Information */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#0f172a]">{t("Activity Information")}</h3>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            {t("Basic activity details and departmental classification.")}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Location / Activity Name */}
            <div>
              <Label htmlFor="location_name">
                {t("Activity / Location Name")} <span className="text-rose-500">*</span>
              </Label>
              <Input
                name="location_name"
                id="location_name"
                placeholder={t("Ex: Offshore Drilling Inspection") || ""}
                value={form.location_name}
                onChange={(e) => handleChange("location_name", e.target.value)}
                className="bg-white border-gray-200"
              />
              <FieldError message={errors.location_name} />
            </div>

            {/* Activity Type */}
            <div>
              <Label htmlFor="location_type">
                {t("Activity Type")} <span className="text-rose-500">*</span>
              </Label>
              <CreatableSelect
                isClearable
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                options={locationTypeOptions}
                value={
                  locationTypeOptions.find((o) => o.value === form.location_type) ||
                  (form.location_type ? { value: form.location_type, label: form.location_type } : null)
                }
                onChange={(option) => handleChange("location_type", option?.value || "")}
                placeholder={locationTypeOptions.length === 0 ? t("Type new or select...") : t("Select or type type...")}
                formatCreateLabel={(inputValue) => `${t("Create")} "${inputValue}"`}
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
                    "&:hover": {
                      borderColor: "#B88E2F",
                    },
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    zIndex: 9999,
                  }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected ? "#FEF3C7" : state.isFocused ? "#fffbe0" : "#ffffff",
                    color: state.isSelected ? "#B88E2F" : "#1e293b",
                    cursor: "pointer",
                  }),
                }}
              />
              <FieldError message={errors.location_type} />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department_id">
                {t("Department")} <span className="text-rose-500">*</span>
              </Label>
              <Select
                options={departmentOptions}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                value={departmentOptions.find((o) => o.value === form.department_id) || null}
                onChange={(option) => handleChange("department_id", option?.value || "")}
                isSearchable
                isClearable
                placeholder={t("Select department...")}
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
                    "&:hover": {
                      borderColor: "#B88E2F",
                    },
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    zIndex: 9999,
                  }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected ? "#FEF3C7" : state.isFocused ? "#fffbe0" : "#ffffff",
                    color: state.isSelected ? "#B88E2F" : "#1e293b",
                    cursor: "pointer",
                  }),
                }}
              />
              <FieldError message={errors.department_id} />
            </div>

            {/* Activity Date */}
            <div>
              <Label htmlFor="date">{t("Activity Date")}</Label>
              <div className="relative">
                {form.date && (
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
                  placeholder={t("Select date") || "Select date"}
                  onChange={(dates) => handleChange("date", dates[0] || null)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Geographic Location Details */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#0f172a]">{t("Geographic Location Details")}</h3>
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
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="bg-white border-gray-200"
                />
                <FieldError message={errors.city} />
              </div>

              {/* State / Division */}
              <div>
                <Label htmlFor="state_division">
                  {t("State / Division")} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  name="state_division"
                  id="state_division"
                  placeholder={t("Ex: Yangon Region") || ""}
                  value={form.state_division}
                  onChange={(e) => handleChange("state_division", e.target.value)}
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
                  value={form.latitude}
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
                  value={form.longitude}
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
          <h3 className="text-base font-bold text-[#0f172a]">{t("Description & Details")}</h3>
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
              value={form.description}
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
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-[#B88E2F] hover:bg-[#997524] text-white text-xs font-bold rounded-2xl transition shadow-md shadow-amber-200 flex items-center gap-2"
        >
          <Plus size={16} /> {t("Create Activity Record")}
        </button>
      </div>

      {/* Interactive Map Selector Modal */}
      {showMap && (
        <LocationModal
          initialLat={form.latitude}
          initialLng={form.longitude}
          onClose={() => setShowMap(false)}
          onSelect={(position) => {
            setForm((prev) => ({
              ...prev,
              latitude: position.lat,
              longitude: position.lng,
            }));
          }}
        />
      )}
    </div>
  );
}