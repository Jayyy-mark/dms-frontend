import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../hooks/useStaff";
import { useTranslation } from "react-i18next";

export default function UserMetaCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.staff_id);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-bold text-3xl select-none">
              {user?.username ? user.username.trim().charAt(0).toUpperCase() : "U"}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.username}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role || "Staff"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {staff?.staff_address || t("Address")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
