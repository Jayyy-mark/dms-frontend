import PageMeta from "../../components/common/PageMeta";
import OverviewKPICards from "../../components/ecommerce/OverviewKPICards";
import SystemWalletHighlightCard from "../../components/ecommerce/SystemWalletHighlightCard";
import AuditLogWidget from "../../components/ecommerce/AuditLogWidget";
import DocumentTrafficSummarizer from "../../components/ecommerce/DocumentTrafficSummarizer";
import StaffPerformanceSummarizer from "../../components/ecommerce/StaffPerformanceSummarizer";
import CategoryDocumentSummarizer from "../../components/ecommerce/CategoryDocumentSummarizer";
import { Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageMeta
        title="MOGE Dashboard — Overview"
        description="MOGE Internal System Management Dashboard — Overall view"
      />

      <div className="space-y-6 pb-10">
        {/* ── Top Header Banner (Small, Compact & Elegant) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/40 text-[10px] font-semibold text-[#B88E2F]">
              <Sparkles size={12} />
              <span>MOGE Internal Management</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
              {t("Welcome Admin")}
            </h1>
            <p className="text-[11px] text-gray-400 font-normal leading-normal">
              {t("Monitor your business analytics, document archives, and staff statistics")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-[11px] font-medium text-gray-600 dark:text-gray-300 shrink-0">
            <CalendarIcon size={13} className="text-[#B88E2F]" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* ── Section 1: Business / System Analytics Card (Top 4 Cards + 8 Sub-metrics) ── */}
        <OverviewKPICards />

        {/* ── Section 2: Wallet / Main Highlights Card (Featured Metric + 2x2 Grid Cards) ── */}
        <SystemWalletHighlightCard />

        {/* ── Section 3: Document Traffic & Type Breakdown Charts ── */}
        <DocumentTrafficSummarizer />

        {/* ── Section 4: Staff & Performance Summary ── */}
        <StaffPerformanceSummarizer />

        {/* ── Section 5: Category Based Document Summary ── */}
        <CategoryDocumentSummarizer />

        {/* ── Section 6: Calendar | To-Do | Audit Log ── */}
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-1">
          <AuditLogWidget />
        </div>
      </div>
    </>
  );
}
