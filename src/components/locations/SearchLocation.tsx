import { X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Label from "../form/Label";
import { LocationSearch } from "../../interfaces/location";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "../form/date-picker";
import TextArea from "../form/input/TextArea";
import Select from "react-select";
import { useEffect } from "react";
import { LocationOptions } from "../../interfaces/location";
import { locationApi } from "../../api/locationApi";
import { useSelectOptions } from "../../hooks/useSelectOptions";
import { helper } from "../../helpers/utils";

const Searchlocation = forwardRef(({ onSearch }: any, ref) => {

    const [form, setForm] = useState<LocationSearch>({
        location_name: "",
        city: "",
        description: "",
        date: null,
        location_type: "",
        department_id: "",
        latitude: "",
        longitude: "",
    });

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

    const toSelectOptions = (arr: string[] | undefined) =>
        arr?.map(item => ({ value: item, label: item })) || [];

    const handleLatLongChange = (field: "latitude" | "longitude", value: string) => {
        if (!value) {
            handleChange(field, value);
            return;
        }

        let relatedField: "latitude" | "longitude" = field === "latitude" ? "longitude" : "latitude";

        // Find matching coordinate
        const match = locationOptions?.coordinates?.find(c => c[field].toString() === value);

        if (match) {
            setForm(prev => ({
                ...prev,
                [field]: value,
                [relatedField]: match[relatedField].toString()
            }));
        } else {
            handleChange(field, value);
        }
    };


    const handleChange = (field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleSubmit = () => {
        onSearch(form);
    };

    const dateRef = useRef<any>(null);


    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        reset: () => {
            setForm({
                location_name: "",
                city: "",
                description: "",
                date: null,
                location_type: "",
                department_id: "",
                latitude: "",
                longitude: "",
            });
            dateRef.current?.clear();
        }
    }));


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Select
                    options={toSelectOptions(locationOptions?.location_names)}
                    value={form.location_name ? { value: form.location_name, label: form.location_name } : null}
                    onChange={(option) => handleChange("location_name", option?.value || "")}
                    isSearchable
                    isClearable
                    placeholder="Select Name"
                />
            </div>
            <div>
                <Label htmlFor="city">City : </Label>
                <Select
                    options={toSelectOptions(locationOptions?.cities)}
                    value={form.city ? { value: form.city, label: form.city } : null}
                    onChange={(option) => handleChange("city", option?.value || "")}
                    isSearchable
                    isClearable
                    placeholder="Select City"
                />
            </div>
            <div>
                <Label>Location Type : </Label>
                <Select
                    options={toSelectOptions(locationOptions?.location_types)}
                    value={form.location_type ? { value: form.location_type, label: form.location_type } : null}
                    onChange={(option) => handleChange("location_type", option?.value || "")}
                    isSearchable
                    isClearable
                    placeholder="Select Type"
                />
            </div>
            <div>
                <Label>Latitude : </Label>
                <Select
                    options={toSelectOptions(locationOptions?.latitudes)}
                    value={form.latitude ? { value: form.latitude, label: form.latitude } : null}
                    onChange={(option) => handleLatLongChange("latitude", option?.value || "")}
                    isSearchable
                    isClearable
                    placeholder="Select Latitude"
                />
            </div>
            <div>
                <Label>Longitude : </Label>
                <Select
                    options={toSelectOptions(locationOptions?.longitudes)}
                    value={form.longitude ? { value: form.longitude, label: form.longitude } : null}
                    onChange={(option) => handleLatLongChange("longitude", option?.value || "")}
                    isSearchable
                    isClearable
                    placeholder="Select Longitude"
                />
            </div>
            <div>
                <Label>Department : </Label>
                <Select
                    options={departmentOptions}
                    value={departmentOptions.find(o => o.value === form.department_id) || null}
                    onChange={(option) => handleChange("department_id", option?.value || "")}
                    isSearchable
                    isClearable
                    placeholder="Select Department"
                />
            </div>
            <div className="relative">
                {/* Clear icon */}
                {form.date && (
                    <button
                        type="button"
                        onClick={() => {
                            dateRef.current?.clear();
                            setForm((prev) => ({
                                ...prev,
                                date: null,
                            }))
                        }}
                        className="absolute right-10 top-1/2 z-10 translate-y-1 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
                <DatePicker
                    ref={dateRef}
                    id="create-date"
                    label="Created date:"
                    placeholder="Select a date"
                    onChange={(_, currentStringDate) => {
                        setForm({ ...form, date: currentStringDate })
                    }}
                />
            </div>
            <div className="md:col-span-3">
                <Label htmlFor="staffAddress">Description : </Label>
                <TextArea rows={6}
                    placeholder="Enter your description"
                    value={form.description}
                    onChange={(value) => setForm(prev => ({
                        ...prev,
                        description: value
                    }))}
                ></TextArea>
            </div>
        </div>
    );
});

export default Searchlocation;