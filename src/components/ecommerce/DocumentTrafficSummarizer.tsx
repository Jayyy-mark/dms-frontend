import { useState } from 'react';
import { BarChart3, Layers, Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardTraffic } from '../../hooks/useDashboardTraffic';

type Period = 'daily' | 'weekly' | 'monthly';

export default function DocumentTrafficSummarizer() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');
  const { traffic, isLoading } = useDashboardTraffic();

  const activeData = traffic?.[period] || {
    departments: [],
    fileTypes: [
      { type: 'PDF', count: 0, percent: 0, color: 'bg-red-400' },
      { type: 'DOCX', count: 0, percent: 0, color: 'bg-blue-400' },
      { type: 'XLSX', count: 0, percent: 0, color: 'bg-emerald-400' },
      { type: 'Images', count: 0, percent: 0, color: 'bg-purple-400' },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      
      {/* Left Column: Departmental Traffic Monitor */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-gray-100 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
              <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white/90">
                {t("ဌာနအလိုက် စာတွဲတင်ပြမှုနှုန်း")}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">{t("Departmental Upload Traffic")}</p>
            </div>
          </div>
          
          {/* Period Toggle */}
          <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
            <button 
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                period === 'daily' 
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {t("နေ့စဉ်")}
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                period === 'weekly' 
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {t("အပတ်စဉ်")}
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                period === 'monthly' 
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {t("လစဉ်")}
            </button>
          </div>
        </div>

        {/* Dynamic Department List */}
        <div className="flex-1 mt-5 space-y-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : activeData.departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
              <Inbox className="h-8 w-8 mb-2 stroke-[1.5]" />
              <p className="text-xs">{t("ဤကာလအတွက် မှတ်တမ်းတင်ထားသော စာတွဲများ မရှိသေးပါ")}</p>
            </div>
          ) : (
            activeData.departments.map((dept, index) => (
              <div key={index} className="group relative">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{dept.name}</span>
                  <span className="text-xs font-black font-mono text-gray-500 dark:text-gray-400">
                    {dept.value.toLocaleString()} <span className="text-[9px] font-medium text-gray-400">docs</span>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${dept.color} transition-all duration-1000 ease-out group-hover:brightness-110 shadow-sm`}
                    style={{ width: `${Math.max(dept.percent, dept.value > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>

      {/* Right Column: Document Types Bar Chart Simulation */}
      <div className="lg:col-span-5 flex flex-col rounded-2xl border border-gray-100 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800">
        
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white/90">
                {t("ဖိုင်အမျိုးအစား")}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">{t("Document Types Breakdown")}</p>
            </div>
          </div>
          <span className="text-[9px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-bold px-2 py-1 rounded-md">
            {t(period === 'daily' ? 'ယနေ့' : period === 'weekly' ? 'ဤအပတ်' : 'ဤလ')}
          </span>
        </div>

        {/* Horizontal Bar Chart Area with Grid Background */}
        <div className="relative mt-5 flex-1 flex flex-col justify-between bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800/60 overflow-hidden min-h-[220px]">
          
          {/* Vertical Dotted Gridlines for Chart */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-5 py-3 opacity-30 dark:opacity-20">
            <div className="border-r border-dashed border-gray-400 dark:border-gray-500 h-full"></div>
            <div className="border-r border-dashed border-gray-400 dark:border-gray-500 h-full"></div>
            <div className="border-r border-dashed border-gray-400 dark:border-gray-500 h-full"></div>
            <div className="border-r border-dashed border-gray-400 dark:border-gray-500 h-full"></div>
            <div className="border-r border-dashed border-gray-400 dark:border-gray-500 h-full"></div>
          </div>
          
          {/* Dynamic Progress Bars */}
          <div className="relative z-10 flex flex-col justify-center space-y-5 flex-1">
            {isLoading ? (
              <div className="space-y-5 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1 h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              activeData.fileTypes.map((file, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-10 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase text-right tracking-wider">
                    {file.type}
                  </span>
                  <div className="flex-1 h-3.5 bg-white dark:bg-gray-700 rounded-full shadow-inner overflow-hidden flex border border-gray-100 dark:border-gray-600">
                    <div 
                      className={`h-full ${file.color} rounded-r-full transition-all duration-1000 ease-out shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]`}
                      style={{ width: `${file.percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-[10px] font-mono font-bold text-gray-400 text-left">
                    {file.percent}%
                  </span>
                </div>
              ))
            )}
          </div>
          
          {/* Axis Legend */}
          <div className="relative z-10 flex justify-between text-[9px] font-mono font-bold text-gray-400 border-t border-gray-200/80 dark:border-gray-700 pt-2 px-1 mt-4 pl-12 pr-10">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
