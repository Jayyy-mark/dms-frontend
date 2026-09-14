import { X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "react-select";
import SearchInput from "../ui/inputs/SearchInput";
import { ArchiveDocumentSearch } from "../../interfaces/document";
import { useSelectOptions } from "../../hooks/useSelectOptions";
import { helper } from "../../helpers/utils";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "../form/date-picker";

const SearchArchiveDocument = forwardRef(({ onSearch }: any, ref) => {

    const [form, setForm] = useState<ArchiveDocumentSearch>({
        document_id: "",
        document_name: "",
        staff_id: "",
        dtype_id: "",
        category_id: "",
        department_id: "",

        from_date: null,
        to_date: null,

        archived_at:null

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

    const { options: departmentOptions } = useSelectOptions(
        helper.fetchDepartments,
        "department_name"
    );

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleSubmit = () => {
        onSearch(form);
    };

    const rangeRef = useRef<any>(null);
    const archiveRef = useRef<any>(null);


    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        reset: () => {
            setForm({
                document_id: "",
                document_name: "",
                staff_id: "",
                category_id: "",
                dtype_id: "",
                department_id: "",
                from_date: null,
                to_date: null,
                archived_at: null,
            });
            archiveRef.current?.clear();
            rangeRef.current?.clear();
        }
    }));


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="document_id">ID</Label>
                <div className="relative">
                    {/* Clear icon */}
                    {form.document_id && (
                        <button
                            type="button"
                            onClick={() => handleChange("document_id", "")}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}

                    <Input
                        type="text"
                        id="document_id"
                        value={form.document_id}
                        onChange={(e) => setForm({ ...form, document_id: e.target.value })}
                        className="" // space for icon
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="name">Name</Label>
                <SearchInput
                    value={form.document_name}
                    onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                />
            </div>
            <div>
                <Label>Staff Name : </Label>
                <Select
                    options={staffOptions}
                    value={staffOptions.find(o => o.value === form.staff_id) || null}
                    onChange={(option) => handleChange("staff_id", option?.value || "")}
                    isSearchable
                    isClearable
                />
            </div>
            <div>
                <Label>Document type : </Label>
                <Select
                    options={dtypeOptions}
                    value={dtypeOptions.find(o => o.value === form.dtype_id) || null}
                    onChange={(option) => handleChange("dtype_id", option?.value || "")}
                    isSearchable
                    isClearable
                />
            </div>
            <div>
                <Label>Category : </Label>
                <Select
                    options={categoryOptions}
                    value={categoryOptions.find(o => o.value === form.category_id) || null}
                    onChange={(option) => handleChange("category_id", option?.value || "")}
                    isSearchable
                    isClearable
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
                />
            </div>
            <div className="relative">
                {/* Clear icon */}
                {form.archived_at && (
                    <button
                        type="button"
                        onClick={() => {
                            archiveRef.current?.clear();
                            setForm((prev) => ({
                                ...prev,
                                archived_at: null,
                            }))
                        }}
                        className="absolute right-10 top-1/2 z-10 translate-y-1 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
                <DatePicker
                    ref={archiveRef}
                    id="archive-date"
                    label="Archived date:"
                    placeholder="Select a date"
                    onChange={(_, currentStringDate) => {

                        setForm({ ...form, archived_at: currentStringDate })
                    }}
                />
            </div>

            <div className="relative">
                {/* Clear icon */}
                {(form.from_date || form.to_date) && (
                    <button
                        type="button"
                        onClick={() => {
                            rangeRef.current?.clear();
                            setForm((prev) => ({
                                ...prev,
                                from_date: null,
                                to_date: null,
                            }))
                        }}
                        className="absolute right-10 top-1/2 z-10 translate-y-1 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
                <DatePicker
                    ref={rangeRef}
                    id="archived-date-range"
                    mode="range"
                    label="Archived date range"
                    placeholder="select date range"
                    onChange={(selectedDates) => {
                        const [from, to] = selectedDates;

                        setForm(prev => ({
                            ...prev,
                            from_date: helper.formatDate(from),
                            to_date: helper.formatDate(to),
                        }));
                    }}
                />
            </div>

        </div>
    );
});

export default SearchArchiveDocument;