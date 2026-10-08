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
import { Eye, EyeOff } from "lucide-react";


const emptyUser: User = {
  id: 0,
  user_id: "",
  username: "",
  email: "",
  role: "",
};

export default function EditUserInputs() {
  const { t } = useTranslation();
  const roleOptions = [
    { value: "admin", label: "admin" },
    { value: "staff", label: "staff" },
    { value: "user", label: "user" },
    { value: "super admin", label: "super admin" },
  ];

  const statusOptions = [
    { value: "active", label: "Active (Allowed to log in)" },
    { value: "banned", label: "Banned (Cannot log in)" },
  ];

  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<User>();

  const [user, setUser] = useState<User>(emptyUser);
  const [loading, setLoading] = useState(isEditMode);

  // Password fields state
  const [newPassword, setNewPassword] = useState("");
  const [retypeNewPassword, setRetypeNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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

    setPasswordError("");

    if (newPassword || retypeNewPassword) {
      if (!newPassword) {
        setPasswordError(t("Please enter a new password."));
        return;
      }
      if (!retypeNewPassword) {
        setPasswordError(t("Please retype the new password."));
        return;
      }
      if (newPassword !== retypeNewPassword) {
        setPasswordError(t("New password and retyped password do not match."));
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError(t("Password must be at least 6 characters long."));
        return;
      }
    }

    try {
      const payload: any = {
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active !== false,
      };
      if (newPassword) {
        payload.new_password = newPassword;
        payload.retype_new_password = retypeNewPassword;
      }

      await userApi.update(user.id, payload);
      toast.success(t("User updated successfully"));
      navigate("/users");
    } catch (err: any) {
      toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  if (loading) return <p className="text-sm text-gray-500 py-6">Loading user...</p>;

  return (
    <ComponentCard title={isEditMode ? "Edit User" : "Create User"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <Label>ID</Label>
          <Input type="text" value={user.user_id} disabled />
        </div>

        <div>
          <Label>Role</Label>
          <Select
            options={roleOptions}
            placeholder="Select role"
            value={user.role}
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
          <FieldError message={errors.role} />
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

        <div className="md:col-span-2">
          <Label>Status</Label>
          <Select
            options={statusOptions}
            placeholder="Select status"
            value={user.is_active !== false ? "active" : "banned"}
            onChange={(val) => setUser({ ...user, is_active: val === "active" })}
            className="dark:bg-dark-900"
          />
        </div>

        {/* Change Password Section */}
        <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col mb-2">
            <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-200">
              {t("Change Password")}
            </h4>
            <p className="text-[12px] text-gray-400">
              {t("Leave blank if you do not wish to change the password.")}
            </p>
          </div>
          {passwordError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium">
              {passwordError}
            </div>
          )}
        </div>

        <div>
          <Label>{t("New Password")}</Label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute z-10 -translate-y-1/2 cursor-pointer right-3 top-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNewPassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </div>

        <div>
          <Label>{t("Retype New Password")}</Label>
          <div className="relative">
            <Input
              type={showRetypePassword ? "text" : "password"}
              value={retypeNewPassword}
              onChange={(e) => {
                setRetypeNewPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Retype new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowRetypePassword(!showRetypePassword)}
              className="absolute z-10 -translate-y-1/2 cursor-pointer right-3 top-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showRetypePassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="
              flex items-center gap-2
              px-5 py-2.5
              bg-[#B88E2F] hover:bg-[#997524]
              text-white text-sm font-semibold
              rounded-lg
              shadow-sm
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/40
            "
          >
            {t("Update User")}
          </button>
        </div>

      </div>
    </ComponentCard>
  );
}
