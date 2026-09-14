import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import { useNavigate, useParams } from "react-router";
import { Rank } from "../../interfaces/ranks";
import { rankApi } from "../../api/rankApi.ts";
import { toast } from "react-toastify";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";

const emptyRank: Rank = {
  id: 0,
  rank_id:"",
  rank_name:"",
};

export default function EditRankForm() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<Rank>();

  const [rank, setRank] = useState<Rank>(emptyRank);
  const [loading, setLoading] = useState(isEditMode);


  useEffect(() => {
    if (!id) return;

    const fetchRank = async () => {
      const data = await rankApi.getById(id)
      setRank(data.rank);
      setLoading(false);
    };

    fetchRank();
  }, [id]);

  const handleSubmit = async () => {
    const valid = validate([
      { field: "rank_name", value: rank.rank_name, label: "Rank name", required: true },
    ]);
    if (!valid) return;

    try {
        const data = await rankApi.update(rank);
        toast.success(data?.message || "Updated successfully!");
        navigate("/ranks/");
    } catch (err: any) {
        toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <ComponentCard title={isEditMode ? "Edit rank" : "Create rank"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <Label>ID</Label>
            <Input type="text" value={rank.id} disabled/>
        </div>

        <div>
          <Label>rank ID</Label>
          <Input type="text" value={rank.rank_id} />
        </div>

        <div>
          <Label>rank Name</Label>
          <Input
            type="text"
            value={rank.rank_name}
            onChange={(e) =>
              setRank({ ...rank, rank_name: e.target.value })
            }
          />
          <FieldError message={errors.rank_name} />
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
