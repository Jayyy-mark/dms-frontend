import { useState } from "react";
import ComponentCard from "../../common/ComponentCard.tsx";
import Label from "../../form/Label.tsx";
import Input from "../../form/input/InputField.tsx";
import Select from "react-select";
import { EyeCloseIcon, EyeIcon } from "../../../icons/index.ts";
import { userApi } from "../../../api/userApi.ts";
import { AddUserForm } from "../../../interfaces/user.ts";
import { useNavigate } from "react-router";
import { useSelectOptions } from "../../../hooks/useSelectOptions.ts";
import { helper } from "../../../helpers/utils.ts";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FieldError from "../../form/FieldError.tsx";
import { useFormErrors } from "../../../hooks/useFormErrors.ts";
import { parseApiError } from "../../../helpers/parseApiError.ts";
import { getStoredUserRoles, USER_ROLES_CHANGE_EVENT } from "../../../utils/userRoleManager.ts";
import { useEffect, useMemo } from "react";

// Roles that do NOT require a linked staff / department on creation
const PRIVILEGED_ROLES = new Set(["super admin", "admin", "super_admin"]);

export default function AddUserFormComponent() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { errors, validate, setFieldError, clearFieldError } = useFormErrors<AddUserForm>();

  const [userRoles, setUserRoles] = useState(getStoredUserRoles);

  useEffect(() => {
    const handleRolesChange = () => {
      setUserRoles(getStoredUserRoles());
    };
    window.addEventListener(USER_ROLES_CHANGE_EVENT, handleRolesChange);
    return () => {
      window.removeEventListener(USER_ROLES_CHANGE_EVENT, handleRolesChange);
    };
  }, []);

  const roleOptions = useMemo(() => {
    return userRoles.map((r) => ({
      value: r.name.toLowerCase(),
      label: r.name,
    }));
  }, [userRoles]);

  const [form, setForm] = useState<AddUserForm>({
    username: "",
    email: "",
    role: "",
    password1: "",
    password2: "",
    staff_id: "",
  });

  // Is the selected role a privileged one (staff not required)?
  const isPrivilegedRole = form.role ? PRIVILEGED_ROLES.has(form.role) : false;

  // Staff field is required only when a non-privileged role is selected
  const staffRequired = form.role !== "" && !isPrivilegedRole;
  const staffMissing = staffRequired && !form.staff_id;

  const handleSubmit = async () => {

    const valid = validate([
      { field: "username", value: form.username, label: "Username", required: true },
      { field: "email", value: form.email, label: "Email", required: true },
      { field: "role", value: form.role, label: "Role", required: true },
      { field: "password1", value: form.password1, label: "Password", required: true },
      { field: "password2", value: form.password2, label: "Re-type Password", required: true },
    ]);
    
    let additionalErrors = false;

    if (form.password1 !== form.password2) {
      setFieldError("password2", "Passwords do not match.");
      additionalErrors = true;
    }

    if (staffMissing) {
      setFieldError("staff_id", "A staff member must be selected for this role.");
      additionalErrors = true;
    }

    if (!valid || additionalErrors) return;

    try {
      await userApi.create(form);
      toast.success("User created successfully!");
      setForm({ username: "", email: "", role: "", password1: "", password2: "", staff_id: "" });
      navigate("/users/");
    } catch (err: any) {
      toast.error(parseApiError(err, "An error occurred. Please try again."));
      console.error("Error creating user:", err);
    }
  };

  const { options: staffOptions } = useSelectOptions(
    helper.fetchStaffs,
    "staff_name"
  );

  return (
    <ComponentCard title="Add User">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Username */}
        <div>
          <Label>Username</Label>
          <Input
            type="text"
            value={form.username}
            onChange={(e) => { setForm({ ...form, username: e.target.value }); clearFieldError("username"); }}
            placeholder="Enter username"
          />
          <FieldError message={errors.username} />
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input
            type="text"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError("email"); }}
            placeholder="Enter email"
          />
          <FieldError message={errors.email} />
        </div>

        {/* Role */}
        <div>
          <Label>Role</Label>
          <Select
            options={roleOptions}
            value={roleOptions.find((o) => o.value === form.role) ?? null}
            onChange={(option: any) => {
              setForm((prev) => ({
                ...prev,
                role: option?.value ?? "",
                // Clear staff when switching roles so validation re-evaluates
                staff_id: PRIVILEGED_ROLES.has(option?.value ?? "") ? prev.staff_id : "",
                email: PRIVILEGED_ROLES.has(option?.value ?? "") ? prev.email : "",
              }));
              clearFieldError("role");
              clearFieldError("staff_id");
            }}
            isSearchable
            isClearable
            placeholder="Select a role..."
          />
          <FieldError message={errors.role} />
        </div>

        {/* Staff selector */}
        <div>
          <Label>
            Staff
            {staffRequired && (
              <span className="ml-1 text-red-500 text-xs font-semibold">
                * required for this role
              </span>
            )}
            {isPrivilegedRole && (
              <span className="ml-1 text-gray-400 text-xs">(optional for admin roles)</span>
            )}
          </Label>
          <Select
            options={staffOptions}
            value={staffOptions.find((o) => o.value === form.staff_id) ?? null}
            onChange={(option: any) => {
              setForm((prev) => ({
                ...prev,
                staff_id: option?.value ?? "",
                email: option?.data?.staff_email ?? prev.email,
              }));
              clearFieldError("staff_id");
            }}
            isSearchable
            isClearable
            placeholder="Select a staff member..."
          />
          <FieldError message={errors.staff_id} />
        </div>

        {/* Password */}
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={form.password1}
              onChange={(e) => { setForm({ ...form, password1: e.target.value }); clearFieldError("password1"); }}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
          <FieldError message={errors.password1} />
        </div>

        {/* Confirm Password */}
        <div>
          <Label>Re-type Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={form.password2}
              onChange={(e) => { setForm({ ...form, password2: e.target.value }); clearFieldError("password2"); }}
              placeholder="Re-enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
          <FieldError message={errors.password2} />
        </div>

        {/* Role info banner */}
        {form.role && (
          <div className="md:col-span-2">
            {isPrivilegedRole ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-[#FEF3C7] px-4 py-3 dark:border-[#B88E2F]/20 dark:bg-[#B88E2F]/10">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#B88E2F]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                <p className="text-xs text-amber-700 dark:text-blue-300">
                  <strong>{form.role === "super admin" ? "Super Admin" : "Admin"}</strong> accounts can be created without linking a staff member. You can assign a staff from the edit page later.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M5.07 19h13.86A2 2 0 0021 16.13L14.14 5a2 2 0 00-3.27 0L3.07 16.13A2 2 0 005.07 19z"
                  />
                </svg>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>{form.role.charAt(0).toUpperCase() + form.role.slice(1)}</strong> accounts must be linked to a staff member. The staff's department will define their data access scope.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={handleSubmit}
            className="
              flex items-center gap-2
              px-4 py-2
              bg-gradient-to-r from-blue-500 to-blue-600
              text-white text-sm font-medium
              rounded-md
              shadow-sm
              hover:from-blue-600 hover:to-blue-700
              transition-all duration-200
              transform hover:-translate-y-0.5 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("Create User")}
          </button>
        </div>

      </div>
    </ComponentCard>
  );
}
