import { forwardRef, useImperativeHandle, useRef } from "react";
import { X, CornerDownLeft } from "lucide-react";
import Select from "react-select";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import { useSelectOptions } from "../../hooks/useSelectOptions";
import { helper } from "../../helpers/utils";
import { DeepSearchDocument } from "../../interfaces/document";
import { useState } from "react";

interface DeepSearchFilterProps {
    onSearch: (data: DeepSearchDocument) => void;
    isSearching?: boolean;
    filterChain?: string[];
    currentText?: string;
    onCurrentTextChange?: (text: string) => void;
    onAddFilter?: (text: string) => void;
    onRemoveFilter?: (index: number) => void;
}

const DeepSearchFilter = forwardRef(
    ({
        onSearch,
        isSearching = false,
        filterChain = [],
        currentText = "",
        onCurrentTextChange,
        onAddFilter,
        onRemoveFilter,
    }: DeepSearchFilterProps, ref) => {

        const [form, setForm] = useState<DeepSearchDocument>({
            text: "",
            department_id: "",
            category_id: "",
            document_status: "",
            from_date: null,
            to_date: null,
            updated_from_date: null,
            updated_to_date: null,
        });

        const documentStatusOptions = [
            { value: "archived", label: "Archived", data: {} },
            { value: "recycled", label: "Recycled", data: {} },
        ];

        const { options: departmentOptions } = useSelectOptions(
            helper.fetchDepartments,
            "department_name"
        );

        const { options: categoryOptions } = useSelectOptions(
            helper.fetchCategories,
            "category_name"
        );

        const rangeRef = useRef<any>(null);

        const handleChange = (field: string, value: any) => {
            setForm(prev => ({ ...prev, [field]: value }));
        };

        const handleSubmit = () => {
            onSearch(form);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey && isSearching && onAddFilter && currentText.trim()) {
                e.preventDefault();
                onAddFilter(currentText);
            }
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit,
            reset: () => {
                setForm({
                    text: "",
                    department_id: "",
                    category_id: "",
                    document_status: "",
                    from_date: null,
                    to_date: null,
                    updated_from_date: null,
                    updated_to_date: null,
                });
                rangeRef.current?.clear();
            },
        }));

        const textareaValue = isSearching ? currentText : form.text;

        const handleTextChange = (value: string) => {
            if (isSearching && onCurrentTextChange) {
                onCurrentTextChange(value);
            } else {
                handleChange("text", value);
            }
        };

        return (
            <div className="w-full">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">

                    <div>
                        <Label>Department</Label>
                        <Select
                            options={departmentOptions}
                            value={departmentOptions.find(o => o.value === form.department_id) || null}
                            onChange={(opt) => handleChange("department_id", opt?.value || "")}
                            isClearable
                            isDisabled={isSearching}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label>Category</Label>
                        <Select
                            options={categoryOptions}
                            value={categoryOptions.find(o => o.value === form.category_id) || null}
                            onChange={(opt) => handleChange("category_id", opt?.value || "")}
                            isClearable
                            isDisabled={isSearching}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label>Document Status</Label>
                        <Select
                            options={documentStatusOptions}
                            value={documentStatusOptions.find(o => o.value === form.document_status) || null}
                            onChange={(opt) => handleChange("document_status", opt?.value || "")}
                            isClearable
                            isDisabled={isSearching}
                            className="mt-2"
                        />
                    </div>

                    <div className="relative">
                        <Label>Created Date Range</Label>

                        {(form.from_date || form.to_date) && (
                            <button
                                onClick={() => {
                                    rangeRef.current?.clear();
                                    setForm(prev => ({ ...prev, from_date: null, to_date: null }));
                                }}
                                className="absolute right-2 top-9 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}

                        <div className="mt-2">
                            <DatePicker
                                ref={rangeRef}
                                id="document-date-range"
                                mode="range"
                                placeholder="Select date range"
                                disabled={isSearching}
                                onChange={(dates) => {
                                    const [from, to] = dates;
                                    setForm(prev => ({
                                        ...prev,
                                        from_date: from || null,
                                        to_date: to || null,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Label>Updated Date Range</Label>

                        {(form.updated_from_date || form.updated_to_date) && (
                            <button
                                onClick={() => {
                                    rangeRef.current?.clear();
                                    setForm(prev => ({
                                        ...prev,
                                        updated_from_date: null,
                                        updated_to_date: null,
                                    }));
                                }}
                                className="absolute right-2 top-9 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}

                        <div className="mt-2">
                            <DatePicker
                                ref={rangeRef}
                                id="document-updated-date-range"
                                mode="range"
                                placeholder="Select date range"
                                disabled={isSearching}
                                onChange={(dates) => {
                                    const [from, to] = dates;
                                    setForm(prev => ({
                                        ...prev,
                                        updated_from_date: from || null,
                                        updated_to_date: to || null,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                </div>

                <div className="relative mt-6">
                    <div className="flex items-center justify-between mb-1">
                        <Label>Enter texts that you want to search :</Label>
                        {isSearching && (
                            <span className="text-xs text-gray-400">
                                Press <kbd className="rounded border border-gray-200 bg-gray-100 px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to narrow results further
                            </span>
                        )}
                    </div>

                    {filterChain.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                            {filterChain.map((term, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                                >
                                    <span className="text-blue-400 font-bold text-[10px]">#{i + 1}</span>
                                    {term}
                                    {onRemoveFilter && (
                                        <button
                                            onClick={() => onRemoveFilter(i)}
                                            className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        {textareaValue && (
                            <button
                                onClick={() => handleTextChange("")}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 z-10"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {isSearching && currentText.trim() && onAddFilter && (
                            <button
                                onClick={() => onAddFilter(currentText)}
                                className="absolute right-8 top-3 text-blue-400 hover:text-[#997524] z-10"
                                title="Press Enter to commit this filter"
                            >
                                <CornerDownLeft size={15} />
                            </button>
                        )}

                        <textarea
                            value={textareaValue}
                            onChange={(e) => handleTextChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={isSearching && filterChain.length > 0 ? 2 : 4}
                            placeholder={
                                isSearching
                                    ? filterChain.length > 0
                                        ? `Narrow further within ${filterChain.length > 0 ? `"${filterChain[filterChain.length - 1]}"` : "current"} results... (Enter to commit)`
                                        : "Type to filter results... (Enter to commit and narrow further)"
                                    : "Type anything... e.g. AI IoT business plan, student attendance report, financial document..."
                            }
                            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-[#B88E2F] focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {isSearching && (
                        <p className="mt-1 text-xs text-gray-400">
                            Typing filters instantly. Press{" "}
                            <kbd className="rounded border border-gray-200 bg-gray-100 px-1 py-0.5 text-[10px] font-mono">Enter</kbd>
                            {" "}to commit and layer another filter on top.
                            {" "}Press <span className="font-semibold text-gray-500">Clear</span> to start a new search.
                        </p>
                    )}
                </div>

                {isSearching && (
                    <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        🔒 Filters are locked during local filtering. Press <span className="font-semibold">Clear</span> to reset and search with new filters.
                    </p>
                )}

            </div>
        );
    });

export default DeepSearchFilter;