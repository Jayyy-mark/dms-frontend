import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { profileApi } from "../../api/profileApi";
import { parseApiError } from "../../helpers/parseApiError";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";

export default function UserPasswordCard() {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    retype_new_password: "",
  });

  const handleStartEdit = () => {
    setPasswordForm({
      old_password: "",
      new_password: "",
      retype_new_password: "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPasswordForm({
      old_password: "",
      new_password: "",
      retype_new_password: "",
    });
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowRetypePassword(false);
    setIsEditing(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!passwordForm.old_password.trim()) {
      toast.warning(t("Old password is required."));
      return;
    }
    if (!passwordForm.new_password.trim()) {
      toast.warning(t("New password is required."));
      return;
    }
    if (!passwordForm.retype_new_password.trim()) {
      toast.warning(t("Please retype your new password."));
      return;
    }
    if (passwordForm.new_password !== passwordForm.retype_new_password) {
      toast.warning(t("New password and retyped password do not match."));
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.warning(t("New password must be at least 8 characters long."));
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await profileApi.updatePassword(passwordForm);
      toast.success(data?.message || t("Password updated successfully!"));
      handleCancel();
    } catch (error: any) {
      toast.error(parseApiError(error, t("Failed to update password.")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl lg:p-6 transition-all duration-300 ${isEditing
        ? "border border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 dark:border-blue-400 dark:shadow-blue-900/30 bg-white dark:bg-gray-900"
        : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]"
        }`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
            {t("Password")}
          </h4>

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("Current Password")}
                </p>
                <p className="text-sm font-medium tracking-widest text-gray-800 dark:text-white/90">
                  ••••••••••••
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <div>
                  <Label>{t("Old Password")}</Label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      value={passwordForm.old_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          old_password: e.target.value,
                        })
                      }
                      placeholder="Enter old password"
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <span
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute z-10 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                    >
                      {showOldPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>{t("New Password")}</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute z-10 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                    >
                      {showNewPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>{t("Retype New Password")}</Label>
                  <div className="relative">
                    <Input
                      type={showRetypePassword ? "text" : "password"}
                      value={passwordForm.retype_new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          retype_new_password: e.target.value,
                        })
                      }
                      placeholder="Retype new password"
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <span
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      className="absolute z-10 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                    >
                      {showRetypePassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-colors"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              {t("Edit")}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t("Cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleSave()}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("Saving...") : t("Save Changes")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
