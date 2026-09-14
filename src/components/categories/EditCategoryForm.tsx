import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import { useNavigate, useParams } from "react-router";
import { Category } from "../../interfaces/category.ts";
import { categoryApi } from "../../api/categoryApi.ts";
import { toast } from "react-toastify";
import { helper } from "../../helpers/utils.ts";
import Select from "../form/Select.tsx";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";


const emptyCategory: Category = {
  id: 0,
  category_id:"",
  category_name:"",
  parent_id:"",
};

export default function EditcategoryForm() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<Category>();

  const [category, setCategory] = useState<Category>(emptyCategory);
  const [loading, setLoading] = useState(isEditMode);

  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  useEffect(()=>{
    const fetchParentCategories = async() =>{
      const data = await helper.fetchParentCategories();
      setParentCategories(data);
    };

    fetchParentCategories();
  }, [])

  const parentCategoryOptions = parentCategories.map((b)=>({
    value:String(b.id),
    label:b.category_name,
  }))

  useEffect(() => {
    if (!id) return;

    const fetchcategory = async () => {
      const data = await categoryApi.getById(id)
      setCategory(data.category);
      setLoading(false);
    };

    fetchcategory();
  }, [id]);

  const handleSubmit = async () => {
    const valid = validate([
      { field: "category_name", value: category.category_name, label: "Category name", required: true },
    ]);
    if (!valid) return;

    try {
        const data = await categoryApi.update(category);
        toast.success(data.message || "Updated successfully!");
        navigate("/categories/");
    } catch (err: any) {
        toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  const handleSelectChange = (value:string)=>{
    setCategory({...category, parent_id:value});
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <ComponentCard title={"Edit category"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <Label>ID</Label>
            <Input type="text" value={category.id} disabled/>
        </div>

        <div>
          <Label>Category ID</Label>
          <Input type="text" value={category.category_id} 
            onChange={(e)=> setCategory({...category, category_id: e.target.value})}
          />
        </div>
        <div>
          <Label>Category Name</Label>
          <Input
            type="text"
            value={category.category_name}
            onChange={(e) =>
              setCategory({ ...category, category_name: e.target.value })
            }
          />
          <FieldError message={errors.category_name} />
        </div>
        <div>
          <Label>Parent Category:</Label>
          <Select 
          options={parentCategoryOptions}
          value={category.parent_id}
          onChange={handleSelectChange}
          className="dark:bg-dark-900"
          />
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
