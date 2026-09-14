import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LogTable from "../../components/logs/LogTable";
import { useLogs } from "../../hooks/useLogs";
import { ShieldCheck } from "lucide-react";

export default function Logs() {
  const { logs, isLoading } = useLogs();

  const todayLogsCount = logs.filter(
    (log) => new Date(log.created_at).toDateString() === new Date().toDateString()
  ).length;

  const actionCounts = logs.reduce((acc, log) => {
    const action = log.action ? log.action.toUpperCase() : "UNKNOWN";
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleCounts = logs.reduce((acc, log) => {
    const role = log.user?.role || "Unknown";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageMeta
        title="System Logs Dashboard"
        description="Monitor and analyze system activities, user interactions, and audit logs."
      />
      <PageBreadCrumb pageTitle="System Logs" />
      
      <div className="space-y-6">
        {/* Main Info Card (Header) */}
        <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-6">
            
            {/* Left section: Title and main stats */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                System Audit Logs
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total</span> {logs.length}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Today</span> {todayLogsCount}
                </span>
                <span className="inline-flex items-center gap-1 ml-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-100 dark:border-emerald-500/20">
                  <ShieldCheck size={14} />
                  Monitoring Active
                </span>
              </div>
            </div>
            
            {/* Right section: Action and User Type Stats */}
            <div className="flex flex-wrap gap-10 md:gap-16">
              
              {/* Actions Stats */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Actions By Type
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(actionCounts).map(([action, count]) => (
                    <div key={action} className="flex justify-between items-center text-sm gap-6">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">{action}</span>
                      <span className="text-gray-900 dark:text-white font-bold">{count}</span>
                    </div>
                  ))}
                  {Object.keys(actionCounts).length === 0 && (
                    <span className="text-sm text-gray-400">No actions recorded</span>
                  )}
                </div>
              </div>
              
              {/* User Types Stats */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Logs By User Role
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(roleCounts).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center text-sm gap-6">
                      <span className="text-gray-600 dark:text-gray-300 capitalize font-medium">{role}</span>
                      <span className="text-gray-900 dark:text-white font-bold">{count}</span>
                    </div>
                  ))}
                  {Object.keys(roleCounts).length === 0 && (
                    <span className="text-sm text-gray-400">No roles recorded</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Logs Table Section (Card Layout) */}
        <div className="mt-4">
          <LogTable logs={logs} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
