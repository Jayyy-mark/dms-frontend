import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Database,
  Hash,
  FileText,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { Log } from "../../interfaces/log";
import { helper } from "../../helpers/utils";

interface LogDetailDrawerProps {
  log: Log;
  onClose: () => void;
}

const getActionBadgeClass = (action?: string) => {
  switch (action?.toUpperCase()) {
    case "DELETE":
      return "text-red-600 bg-red-50 border-red-200";
    case "UPDATE":
      return "text-[#997524] bg-[#FEF3C7] border-amber-200";
    case "CREATE":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    default:
      return "text-amber-600 bg-amber-50 border-amber-200";
  }
};

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "just now";

  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [seconds, unit] of units) {
    const value = Math.floor(diffSec / seconds);
    if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
  }
  return "";
};

export default function LogDetailDrawer({ log, onClose }: LogDetailDrawerProps) {
  const action = log.action?.toUpperCase() || "UNKNOWN";

  // Close drawer with ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Rendered in a portal so the drawer always sits above the sticky app header
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-999998 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 h-full z-999999 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0f172a]">Log Details</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getActionBadgeClass(log.action)}`}
              >
                {action}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-0.5">Log ID: #{log.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* EVENT SUMMARY */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#B88E2F] uppercase tracking-wider">
              <Activity size={15} />
              <span>Event Summary</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
              <span className="font-extrabold">{log.user?.username || "Unknown User"}</span>{" "}
              performed <span className="font-extrabold">{action}</span> on{" "}
              <span className="font-extrabold">{log.model_name || "System"}</span>
              {log.object_id ? (
                <>
                  {" "}
                  <span className="font-mono text-xs text-gray-500">(#{log.object_id})</span>
                </>
              ) : null}
            </p>
          </div>

          {/* ACTION INFORMATION */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Action Information
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Resource */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Database size={12} /> Resource
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                  {log.model_name || "System"}
                </span>
              </div>

              {/* Object ID */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash size={12} /> Object ID
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate font-mono">
                  {log.object_id || "—"}
                </span>
              </div>

              {/* Date */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} /> Date & Time
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block">
                  {log.created_at ? helper.formatStrDate(log.created_at) : "—"}
                </span>
              </div>

              {/* Relative time */}
              <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} /> Elapsed
                </span>
                <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                  {log.created_at ? getRelativeTime(log.created_at) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* USER INFORMATION */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Performed By
            </h4>

            {log.user ? (
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#997524] flex items-center justify-center font-extrabold uppercase">
                    {log.user.username?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#0f172a] truncate">{log.user.username}</p>
                    <p className="text-[11px] font-mono text-gray-400">
                      {log.user.user_id || `#${log.user.id}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
                    <ShieldCheck size={13} className="text-gray-400 shrink-0" />
                    <span className="font-semibold capitalize truncate">{log.user.role || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
                    <User size={13} className="text-gray-400 shrink-0" />
                    <span className={`font-semibold ${log.user.is_active === false ? "text-red-500" : "text-emerald-600"}`}>
                      {log.user.is_active === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="font-semibold truncate">{log.user.email || "—"}</span>
                  </div>
                  {log.user.last_login && (
                    <div className="col-span-2 flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
                      <Clock size={13} className="text-gray-400 shrink-0" />
                      <span className="font-semibold truncate">
                        Last login: {helper.formatStrDate(log.user.last_login)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center bg-white text-gray-400">
                <User size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">
                  User not available{log.user_id ? ` (#${log.user_id})` : ""}
                </p>
              </div>
            )}
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FileText size={14} /> Description
            </h4>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {log.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
