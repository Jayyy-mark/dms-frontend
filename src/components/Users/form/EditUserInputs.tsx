import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard.tsx";
import Label from "../../form/Label.tsx";
import Input from "../../form/input/InputField.tsx";
import { useParams, useNavigate } from "react-router";
import { userApi } from "../../../api/userApi.ts";
import Select from "../../form/Select.tsx";
import { toast } from "react-toastify";
import { User } from "../../../interfaces/user.ts";
import { useTranslation } from "react-i18next";
import FieldError from "../../form/FieldError.tsx";
import { useFormErrors } from "../../../hooks/useFormErrors.ts";
import { parseApiError } from "../../../helpers/parseApiError.ts";


const emptyUser: User = {
  id: 0,
  user_id: "",
  username: "",
  email: "",
  role: "",
};

export default function EditUserInputs() {
  const { t } = useTranslation();
  const options = [
    { value: "admin", label: "admin" },
    { value: "staff", label: "staff" },
    { value: "user", label: "user" },
    { value: "super admin", label: "super admin" },
  ];

  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<User>();

  const [user, setUser] = useState<User>(emptyUser);
  const [loading, setLoading] = useState(isEditMode);

  const handleSelectChange = (value: string) => {
    setUser({ ...user, role: value });
  };

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const data = await userApi.getById(id);
      setUser(data);
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user.id) return;
    
    const valid = validate([
      { field: "username", value: user.username, label: "Username", required: true },
      { field: "email", value: user.email, label: "Email", required: true },
      { field: "role", value: user.role, label: "Role", required: true },
    ]);
    if (!valid) return;

    try {
      await userApi.update(user.id, { username: user.username, email: user.email, role: user.role });
      toast.success("User updated successfully");
      navigate("/users");
    } catch (err: any) {
      toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <ComponentCard title={isEditMode ? "Edit User" : "Create User"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <Label>ID</Label>
          <Input type="text" value={user.user_id} disabled />
        </div>

        <div>
          <Label>Username</Label>
          <Input
            type="text"
            value={user.username}
            onChange={(e) =>
              setUser({ ...user, username: e.target.value })
            }
          />
          <FieldError message={errors.username} />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="text"
            value={user.email}
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
            }
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <Label>Role</Label>
          <Select
            options={options}
            placeholder="Select role"
            value={user.role}
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
          <FieldError message={errors.role} />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end">
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
            {t("Update User")}
          </button>
        </div>

      </div>
    </ComponentCard>
  );
}
