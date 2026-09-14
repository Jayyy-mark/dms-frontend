import { useLogs } from "../../hooks/useLogs";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/* ── helpers ── */
function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getLogType(action: string): "success" | "warning" | "error" | "info" {
  const a = action.toLowerCase();
  if (a.includes("login") || a.includes("logged in") || a.includes("approve"))
    return "success";
  if (a.includes("delete") || a.includes("remove") || a.includes("fail"))
    return "error";
  if (
    a.includes("reset") ||
    a.includes("change") ||
    a.includes("update") ||
    a.includes("edit")
  )
    return "warning";
  return "info";
}

/* ── style maps ── */
const TYPE_STYLES = {
  success:
    "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  info: "bg-[#FEF3C7] border-sky-100 dark:bg-[#B88E2F]/10 dark:border-[#B88E2F]/20",
  warning:
    "bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20",
  error: "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20",
};

const DOT_COLORS = {
  success: "bg-emerald-500",
  info: "bg-[#B88E2F]",
  warning: "bg-amber-400",
  error: "bg-rose-500",
};

const USER_TEXT = {
  success: "text-emerald-800 dark:text-emerald-300",
  info: "text-sky-800 dark:text-sky-300",
  warning: "text-amber-800 dark:text-amber-300",
  error: "text-rose-800 dark:text-rose-300",
};

const SUB_TEXT = {
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-[#997524] dark:text-sky-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-rose-600 dark:text-rose-400",
};

/* ── component ── */
export default function AuditLogWidget() {
  const { t } = useTranslation();
  const { logs: rawLogs, isLoading: loading, error: swrError, mutate } = useLogs();
  const [refreshing, setRefreshing] = useState(false);

  const logs = [...rawLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50);

  const error = swrError ? t("မှတ်တမ်းများ ရယူ၍မရပါ") : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };


  function fetchLogs(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900" style={{ height: "420px" }}>
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-white/80">
            {t("Audit Log")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("Live")}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p className="text-xs">{t("Loading...")}</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
              <button
                onClick={() => fetchLogs()}
                className="mt-2 text-[11px] font-semibold text-rose-500 underline underline-offset-2 hover:no-underline"
              >
                {t("ထပ်မံကြိုးစားရန်")}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">{t("မှတ်တမ်းများ မရှိသေးပါ")}</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="space-y-2">
            {logs.map((log, i) => {
              const type = getLogType(log.action);
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-all ${i === 0 ? "animate-fade-in" : ""} ${TYPE_STYLES[type]}`}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[type]}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-bold ${USER_TEXT[type]}`}>
                      {log.user?.username ?? `User #${log.user_id}`}
                    </p>
                    <p className={`truncate text-[11px] font-medium ${SUB_TEXT[type]}`}>
                      {log.action}
                      {log.model_name ? (
                        <> — <span className="font-semibold">{log.model_name}</span></>
                      ) : null}
                    </p>
                    {log.description && (
                      <p className="mt-0.5 truncate text-[10px] text-gray-400 dark:text-gray-500">
                        {log.description}
                      </p>
                    )}
                  </div>
                  <span className="mt-0.5 shrink-0 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    {formatTime(log.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
