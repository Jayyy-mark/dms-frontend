import {
  Users,
  UserCheck,
  Archive,
  Building2,
  BarChart3,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  FolderSync,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboardAnalytics } from "../../hooks/useDashboardAnalytics";

interface KPICardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
}

function KPICard({ label, value, icon, accent, iconBg }: KPICardProps) {
  return (
    <div
      className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 md:px-5 md:py-4`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ml-1`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
          {label}
        </p>
        <h3 className="mt-0.5 text-xl font-extrabold text-gray-900 dark:text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}

function formatCount(count: number | undefined): string {
  if (count === undefined) return "—";
  return count.toLocaleString();
}

export default function OverviewKPICards() {
  const { t } = useTranslation();
  const { analytics, isLoading } = useDashboardAnalytics();

  const subMetrics = [
    {
      label: t("Permanent Record"),
      count: isLoading ? "..." : formatCount(analytics?.permanent_documents),
      icon: FileCheck,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: t("Temporary Record"),
      count: isLoading ? "..." : formatCount(analytics?.temporary_documents),
      icon: Clock,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: t("Active Staff"),
      count: isLoading ? "..." : formatCount(analytics?.staffs),
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: t("Recent Uploads"),
      count: isLoading ? "..." : `+${formatCount(analytics?.recent_uploads)} ${t("Today")}`,
      icon: FolderSync,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-500/10",
    },
    {
      label: t("Expired Archives"),
      count: isLoading ? "..." : `${formatCount(analytics?.expired_archives)} ${t("Pending")}`,
      icon: AlertCircle,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: t("Department Units"),
      count: isLoading ? "..." : `${formatCount(analytics?.departments)} ${t("Offices")}`,
      icon: Layers,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
    },
  ];

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6">
      {/* Container Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88E2F] dark:bg-amber-500/10">
            <BarChart3 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              {t("System Analytics")}
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              {t("Monitor your system analytics and statistics")}
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Main KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label={t("MOGE စနစ်အသုံးပြုသူများ")}
          value={isLoading ? "..." : `${formatCount(analytics?.users)} ${t("ဦး")}`}
          accent="bg-teal-500"
          iconBg="bg-teal-50 dark:bg-teal-500/10"
          icon={<Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />}
        />
        <KPICard
          label={t("ဝန်ထမ်းစုစုပေါင်း")}
          value={isLoading ? "..." : `${formatCount(analytics?.staffs)} ${t("ဦး")}`}
          accent="bg-[#B88E2F]"
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          icon={<UserCheck className="h-5 w-5 text-[#B88E2F] dark:text-amber-400" />}
        />
        <KPICard
          label={t("စာတွဲနှင့် မော်ကွန်း")}
          value={isLoading ? "..." : `${formatCount(analytics?.documents)} ${t("စောင်")}`}
          accent="bg-indigo-500"
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          icon={<Archive className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <KPICard
          label={t("အဆောက်အဦးနှင့် နေရာများ")}
          value={
            isLoading
              ? "..."
              : `${formatCount(analytics?.buildings)} ${t("ကွင်း")} / ${formatCount(analytics?.departments)} ${t("ရုံး")}`
          }
          accent="bg-cyan-500"
          iconBg="bg-cyan-50 dark:bg-cyan-500/10"
          icon={<Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
        />
      </div>

      {/* Sub-Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {subMetrics.map((item, idx) => {
          const ItemIcon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100/80 dark:bg-gray-800/50 dark:border-gray-800"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                  <ItemIcon size={15} />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                  {item.label}
                </span>
              </div>
              <span className="text-xs font-extrabold text-gray-900 dark:text-white shrink-0 ml-2">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
