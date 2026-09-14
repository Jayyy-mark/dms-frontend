import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import { useNavigate, useParams } from "react-router";
import { Dtype } from "../../interfaces/dtype";
import { dtypeApi } from "../../api/dtypeApi.ts";
import { toast } from "react-toastify";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

const emptyDtype: Dtype = {
  id: 0,
  dtype_id:"",
  dtype_name:"",
};

export default function EditDtypeForm() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<Dtype>();

  const [dtype, setdtype] = useState<Dtype>(emptyDtype);
  const [loading, setLoading] = useState(isEditMode);


  useEffect(() => {
    if (!id) return;

    const fetchdtype = async () => {
      const data = await dtypeApi.getById(id)
      setdtype(data.dtype);
      setLoading(false);
    };

    fetchdtype();
  }, [id]);

  const handleSubmit = async () => {
    const valid = validate([
      { field: "dtype_name", value: dtype.dtype_name, label: "Document type name", required: true },
    ]);
    if (!valid) return;

    try {
        const data = await dtypeApi.update(dtype);
        toast.success(data?.message || "Updated successfully!");
        navigate("/dtypes/");
    } catch (err: any) {
        toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <ComponentCard title={"Edit dtype"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <Label>ID</Label>
            <Input type="text" value={dtype.id} disabled/>
        </div>
        <div>
          <Label>Document type ID</Label>
          <Input type="text" value={dtype.dtype_id} />
        </div>
        <div>
          <Label>Document type Name</Label>
          <Input
            type="text"
            value={dtype.dtype_name}
            onChange={(e) =>
              setdtype({ ...dtype, dtype_name: e.target.value })
            }
          />
          <FieldError message={errors.dtype_name} />
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
