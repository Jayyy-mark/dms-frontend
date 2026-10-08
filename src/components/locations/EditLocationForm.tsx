import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import ComponentCard from "../common/ComponentCard.tsx";
import { useNavigate, useParams } from "react-router";
import { UpdateLocation } from "../../interfaces/location.ts";
import { locationApi } from "../../api/locationApi.ts";
import { toast } from "react-toastify";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import TextArea from "../form/input/TextArea.tsx";
import DatePicker from "../form/date-picker.tsx";
import { helper } from "../../helpers/utils.ts";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { LocationOptions } from "../../interfaces/location.ts";
import LocationModal from "./LocationModal.tsx";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";


const emptylocation: UpdateLocation = {
    id: 0,
    location_id: "",
    location_name: "",
    city: "",
    latitude: "",
    longitude: "",
    description: "",
    date: null,
    location_type: "",
    department_id: "",
    state_division: "",
};

export default function Editlocation() {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const { errors, validate } = useFormErrors<UpdateLocation>();

    const [location, setLocation] = useState<UpdateLocation>(emptylocation);
    const [loading, setLoading] = useState(isEditMode);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchlocation = async () => {
            const data = await locationApi.getById(id)
            setLocation(data.location);
            setLoading(false);
        };

        fetchlocation();
    }, [id]);

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

        // Check if an existing option matches (case-insensitive)
        const existing = locationTypeOptions.find(
            (opt) => opt.value.trim().toLowerCase() === trimmed.toLowerCase()
        );

        if (existing) {
            handleChange("location_type", existing.value);
        } else {
            setCustomTypeOptions((prev) => Array.from(new Set([...prev, trimmed])));
            handleChange("location_type", trimmed);
            toast.info(`New activity type added: "${trimmed}"`);
        }
    };

    const handleChange = (field: string, value: string) => {
        setLocation(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {

        const valid = validate([
            { field: "location_name", value: location.location_name, label: "Location name", required: true },
            { field: "city", value: location.city, label: "City", required: true },
            { field: "state_division", value: location.state_division, label: "State/Division", required: true },
            { field: "location_type", value: location.location_type, label: "Location type", required: true },
            { field: "department_id", value: location.department_id, label: "Department", required: true },
        ]);
        console.log("this is the location : ", location)
        console.log("this is the validation result", valid)
        if (!valid) return;
        console.log("function entered!");
        try {
            const data = await locationApi.update(location);
            toast.success(data.message || "Updated successfully!");
            navigate("/locations/");
        } catch (err: any) {
            toast.error(parseApiError(err, "Something went wrong!"));
        }
    };

    if (loading) return <p>Loading user...</p>;

    return (
        <>
            <ComponentCard title={"Edit location"}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <Label>ID</Label>
                        <Input type="text" value={location.id} disabled />
                    </div>
                    <div>
                        <Label>Location ID</Label>
                        <Input type="text" value={location.location_id}
                            onChange={(e) => setLocation({ ...location, location_id: e.target.value })}
                            disabled
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Location Name</Label>
                        <Input
                            type="text"
                            value={location.location_name}
                            onChange={(e) =>
                                setLocation({ ...location, location_name: e.target.value })
                            }
                        />
                        <FieldError message={errors.location_name} />
                    </div>
                    <div className="md:col-span-2">
                        <Label>City</Label>
                        <Input
                            type="text"
                            value={location.city}
                            onChange={(e) =>
                                setLocation({ ...location, city: e.target.value })
                            }
                        />
                        <FieldError message={errors.city} />
                    </div>
                    <div className="md:col-span-1">
                        <Label>Latitude</Label>
                        <Input
                            type="text"
                            placeholder="e.g. 16.840900"
                            value={location.latitude}
                            onChange={(e) =>
                                setLocation({ ...location, latitude: e.target.value })
                            }
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Label>Longitude</Label>
                        <Input
                            type="text"
                            placeholder="e.g. 96.173500"
                            value={location.longitude}
                            onChange={(e) =>
                                setLocation({ ...location, longitude: e.target.value })
                            }
                        />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                        <button
                            type="button"
                            onClick={() => setShowMap(true)}
                            className="h-11 px-4 py-2 bg-blue-100 text-[#997524] text-sm font-medium rounded-md hover:bg-blue-200 transition-colors w-full"
                        >
                            Select Location on Map
                        </button>
                    </div>
                    <div className="relative md:col-span-2">
                        <Label htmlFor="date">Date: </Label>
                        {/* Clear icon */}
                        <DatePicker
                            id="date"
                            placeholder="Select a date"
                            onChange={(dates, _) => {
                                setLocation((prev) => ({
                                    ...prev,
                                    date: dates[0],
                                }));
                            }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                            <Label className="mb-0">Location / Activity Type : </Label>
                            <div className="flex items-center gap-2">
                                {location.location_type && (
                                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        {locationOptions?.location_types?.includes(location.location_type)
                                            ? "Existing type"
                                            : "New type"}
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
                                    {isManualTypeInput ? "← Select from list" : "+ Type custom directly"}
                                </button>
                            </div>
                        </div>

                        {isManualTypeInput ? (
                            <div className="relative">
                                <Input
                                    name="location_type"
                                    placeholder="Type custom activity type..."
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
                                        title="Clear"
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
                                options={locationTypeOptions}
                                value={
                                    locationTypeOptions.find(o => o.value === location.location_type) ||
                                    (location.location_type ? { value: location.location_type, label: location.location_type } : null)
                                }
                                inputValue={typeInputValue}
                                onInputChange={(newInput, actionMeta) => {
                                    if (actionMeta.action === "input-change") {
                                        setTypeInputValue(newInput);
                                    } else if (actionMeta.action === "set-value" || actionMeta.action === "menu-close") {
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
                                        (opt) => Boolean(opt?.label) && String(opt.label).trim().toLowerCase() === trimmed.toLowerCase()
                                    );
                                }}
                                placeholder={locationTypeOptions.length === 0 ? "No data available" : "Select or type..."}
                                formatCreateLabel={(inputValue) => `+ Create new "${inputValue}"`}
                                noOptionsMessage={({ inputValue }) =>
                                    inputValue?.trim()
                                        ? `Press Enter or click to create "${inputValue}"`
                                        : "No options. Type to create new..."
                                }
                            />
                        )}
                        <FieldError message={errors.location_type} />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Department : </Label>
                        <Select
                            options={departmentOptions}
                            value={departmentOptions.find(o => String(o.value) === String(location.department_id))}
                            onChange={(option) => {
                                handleChange("department_id", option?.value || "")
                            }}
                            isSearchable
                            isClearable
                        />
                        <FieldError message={errors.department_id} />
                    </div>
                    <div className="md:col-span-4">
                        <Label>Description :</Label>
                        <TextArea
                            rows={6}
                            value={location.description}
                            placeholder="Write Description"
                            onChange={(value) => setLocation({ ...location, description: value })}
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
            {showMap && (
                <LocationModal
                    initialLat={location.latitude}
                    initialLng={location.longitude}
                    onClose={() => setShowMap(false)}
                    onSelect={(position) => {
                        setLocation(prev => ({
                            ...prev,
                            latitude: position.lat,
                            longitude: position.lng,
                            city: position.city || prev.city,
                            state_division: position.state_division || prev.state_division
                        }));
                        setShowMap(false);
                    }}
                />
            )}
        </>
    );
}
