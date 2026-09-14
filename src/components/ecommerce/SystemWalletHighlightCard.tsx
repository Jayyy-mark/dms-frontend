import { Archive, FileCheck, Clock, Users, Building2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboardAnalytics } from "../../hooks/useDashboardAnalytics";

function formatCount(count: number | undefined): string {
  if (count === undefined) return "—";
  return count.toLocaleString();
}

export default function SystemWalletHighlightCard() {
  const { t } = useTranslation();
  const { analytics, isLoading } = useDashboardAnalytics();

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-5">
      {/* Container Header */}
      <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
          <Wallet size={18} />
        </div>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
          {t("System Archival & Operations Summary")}
        </h2>
      </div>

      {/* Grid Layout: Left Big Featured Card + Right 2x2 Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Featured Big Card */}
        <div className="lg:col-span-4 rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/60 to-amber-50/20 p-6 flex flex-col items-center justify-center text-center dark:border-amber-500/20 dark:from-amber-500/10 dark:to-transparent">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#B88E2F] flex items-center justify-center shadow-xs border border-amber-200/50 mb-3 dark:bg-gray-800">
            <Archive size={28} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isLoading ? "..." : formatCount(analytics?.documents)}
          </h3>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
            {t("Total In-House Archival Documents")}
          </p>
        </div>

        {/* Right 2x2 Grid Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 flex items-center justify-between dark:border-gray-800 dark:bg-gray-800/40">
            <div>
              <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {isLoading ? "..." : formatCount(analytics?.permanent_documents)}
              </h4>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {t("Permanent Archives")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
              <FileCheck size={20} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 flex items-center justify-between dark:border-gray-800 dark:bg-gray-800/40">
            <div>
              <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {isLoading ? "..." : formatCount(analytics?.temporary_documents)}
              </h4>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {t("Temporary Archives")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
              <Clock size={20} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 flex items-center justify-between dark:border-gray-800 dark:bg-gray-800/40">
            <div>
              <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {isLoading ? "..." : formatCount(analytics?.staffs)}
              </h4>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {t("Staff Personnel")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <Users size={20} />
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 flex items-center justify-between dark:border-gray-800 dark:bg-gray-800/40">
            <div>
              <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {isLoading ? "..." : formatCount(analytics?.buildings)}
              </h4>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {t("Operational Sites")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10">
              <Building2 size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

