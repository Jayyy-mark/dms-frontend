import { X } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import SearchInput from "../ui/inputs/SearchInput";
import { StaffSearch } from "../../interfaces/staff";
import { useSelectOptions } from "../../hooks/useSelectOptions";
import { helper } from "../../helpers/utils";

const SearchStaff = forwardRef(({ onSearch }: any, ref) => {

    const [form, setForm] = useState<StaffSearch>({
        staff_id: "",
        staff_name: "",
        staff_email: "",
        department_id: "",
        role_id: "",
        rank_id: "",
        stype_id: "",
    });

    const { options: departmentOptions } = useSelectOptions(
        helper.fetchDepartments,
        "department_name"
    );

    const { options: roleOptions } = useSelectOptions(
        helper.fetchRoles,
        "role_name"
    );

    const { options: rankOptions } = useSelectOptions(
        helper.fetchRanks,
        "rank_name"
    );

    const { options: stypeOptions } = useSelectOptions(
        helper.fetchStypes,
        "stype_name"
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

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        reset: () => {
            setForm({
                staff_id: "",
                staff_name: "",
                staff_email: "",
                department_id: "",
                role_id: "",
                rank_id: "",
                stype_id: "",
            });
        }
    }));


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                <Label htmlFor="staff_id">ID</Label>
                <div className="relative">
                    {/* Clear icon */}
                    {form.staff_id && (
                        <button
                            type="button"
                            onClick={() => handleChange("staff_id", "")}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}

                    <Input
                        type="text"
                        id="staff_id"
                        value={form.staff_id}
                        onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                        className="" // space for icon
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="name">Name</Label>
                <SearchInput
                    value={form.staff_name}
                    onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
                />
            </div>
            <div>
                <Label htmlFor="name">Email :</Label>
                <SearchInput
                    value={form.staff_email}
                    onChange={(e) => setForm({ ...form, staff_email: e.target.value })}
                />
            </div>
            <div>
                <Label htmlFor="department">Department</Label>
                <Select
                    options={departmentOptions}
                    value={form.department_id}
                    onChange={(v) => handleChange("department_id", v)}
                />
            </div>
            <div>
                <Label>Role</Label>
                <Select
                    options={roleOptions}
                    value={form.role_id}
                    onChange={(v) => handleChange("role_id", v)}
                />
            </div>
            <div>
                <Label>Rank</Label>
                <Select
                    options={rankOptions}
                    value={form.rank_id}
                    onChange={(v) => handleChange("rank_id", v)}
                />
            </div>
            <div>
                <Label>Staff type:</Label>
                <Select
                    options={stypeOptions}
                    value={form.stype_id}
                    onChange={(v) => handleChange("stype_id", v)}
                />
            </div>
        </div>
    );
});

export default SearchStaff;