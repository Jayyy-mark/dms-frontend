import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import { useNavigate, useParams } from "react-router";
import { Staff } from "../../interfaces/staff.ts";
import { staffApi } from "../../api/staffApi.ts";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils.ts";
import Select from "../form/Select.tsx";
import { useSelectOptions } from "../../hooks/useSelectOptions.ts";
import TextArea from "../form/input/TextArea.tsx";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";


const emptyStaff: Staff = {
    id: 0,
    staff_id: "",
    staff_name: "",
    staff_email: "",
    staff_ph_number: "",
    staff_address: "",
    staff_gender: "",

    department_id: "",
    role_id: "",
    rank_id: "",
    stype_id: "",
};

export default function EditStaffForm() {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const { errors, validate } = useFormErrors<Staff>();

    const [staff, setStaff] = useState<Staff>(emptyStaff);
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (!id) return;

        const fetchStaff = async () => {
            const data = await staffApi.getById(id)
            setStaff(data.staff);
            setLoading(false);
        };

        fetchStaff();
    }, [id]);

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

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
    ];

    const handleChange = (field: string, value: string) => {
        setStaff(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        const valid = validate([
            { field: "staff_name", value: staff.staff_name, label: "Name", required: true },
            { field: "staff_email", value: staff.staff_email, label: "Email", required: true },
            { field: "staff_gender", value: staff.staff_gender, label: "Gender", required: true },
            { field: "staff_ph_number", value: staff.staff_ph_number, label: "Phone number", required: true },
            { field: "department_id", value: staff.department_id, label: "Department", required: true },
            { field: "role_id", value: staff.role_id, label: "Role", required: true },
            { field: "rank_id", value: staff.rank_id, label: "Rank", required: true },
            { field: "stype_id", value: staff.stype_id, label: "Staff type", required: true },
        ]);
        if (!valid) return;

        try {
            const data = await staffApi.update(staff);
            toast.success(data.message || "Updated successfully!");
            navigate("/staffs/");
        } catch (err: any) {
            toast.error(parseApiError(err, "Something went wrong!"));
        }
    };

    if (loading) return <p>Loading user...</p>;

    return (
        <ComponentCard title={"Edit staff"}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <Label>ID</Label>
                    <Input type="text" value={staff.id} disabled />
                </div>

                <div>
                    <Label>Staff ID</Label>
                    <Input type="text" value={staff.staff_id}
                        onChange={(e) => setStaff({ ...staff, staff_id: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2">
                    <Label>Name</Label>
                    <Input
                        type="text"
                        value={staff.staff_name}
                        onChange={(e) =>
                            setStaff({ ...staff, staff_name: e.target.value })
                        }
                    />
                    <FieldError message={errors.staff_name} />
                </div>
                <div className="md:col-span-2">
                    <Label>Email :</Label>
                    <Input
                        type="text"
                        value={staff.staff_email}
                        onChange={(e) =>
                            setStaff({ ...staff, staff_email: e.target.value })
                        }
                    />
                    <FieldError message={errors.staff_email} />
                </div>
                <div>
                    <Label>Gender</Label>
                    <Select
                        options={genderOptions}
                        value={staff.staff_gender}
                        onChange={(v)=>handleChange("staff_gender",v)}
                    />
                    <FieldError message={errors.staff_gender} />
                </div>
                <div>
                    <Label>Phone Number</Label>
                    <Input
                        type="text"
                        value={staff.staff_ph_number}
                        onChange={(e) =>
                            setStaff({ ...staff, staff_ph_number: e.target.value })
                        }
                    />
                    <FieldError message={errors.staff_ph_number} />
                </div>
                <div>
                    <Label>Department :</Label>
                    <Select
                        options={departmentOptions}
                        value={staff.department_id}
                        onChange={(v)=>handleChange("department_id",v)}
                        className="dark:bg-dark-900"
                    />
                    <FieldError message={errors.department_id} />
                </div>
                <div>
                    <Label>Role :</Label>
                    <Select
                        options={roleOptions}
                        value={staff.role_id}
                        onChange={(v)=>handleChange("role_id",v)}
                        className="dark:bg-dark-900"
                    />
                    <FieldError message={errors.role_id} />
                </div>
                <div>
                    <Label>Rank :</Label>
                    <Select
                        options={rankOptions}
                        value={staff.rank_id}
                        onChange={(v)=>handleChange("rank_id",v)}
                        className="dark:bg-dark-900"
                    />
                    <FieldError message={errors.rank_id} />
                </div>
                <div>
                    <Label>Staff type :</Label>
                    <Select
                        options={stypeOptions}
                        value={staff.stype_id}
                        onChange={(v)=>handleChange("stype_id",v)}
                        className="dark:bg-dark-900"
                    />
                    <FieldError message={errors.stype_id} />
                </div>
                <div className="md:col-span-4">
                    <Label>Address:</Label>
                    <TextArea
                        rows={6}
                        value={staff.staff_address}
                        placeholder="Enter address"
                        onChange={(value)=>setStaff({...staff, staff_address:value})}                        
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
    );
}
