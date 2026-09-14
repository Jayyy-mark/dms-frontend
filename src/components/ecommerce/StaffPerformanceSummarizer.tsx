import { useState, useMemo } from 'react';
import { Users, FileUp, Award } from 'lucide-react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { useDashboardStaffPerformance } from '../../hooks/useDashboardStaffPerformance';

type Period = 'daily' | 'weekly' | 'monthly';

export default function StaffPerformanceSummarizer() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');
  const [department, setDepartment] = useState<string>('အားလုံး');
  const { performance, isLoading } = useDashboardStaffPerformance();

  const departmentOptions = useMemo(() => {
    const list = performance?.departments || [];
    return [
      { value: 'အားလုံး', label: t('ဌာနအားလုံး') },
      ...list.map(d => ({ value: d, label: d })),
    ];
  }, [performance?.departments, t]);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
      borderRadius: '0.75rem',
      padding: '0.2rem',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      '&:hover': {
        borderColor: '#a5b4fc'
      },
      fontSize: '0.875rem',
      fontWeight: '600',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 50,
      fontSize: '0.875rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e0e7ff' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? '#4f46e5' : '#374151',
      cursor: 'pointer',
      padding: '0.5rem 1rem',
      fontWeight: state.isSelected ? '600' : '500',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151',
    }),
  };

  // Filter logic
  const filteredUploads = useMemo(() => {
    let data = performance?.uploads?.[period] || [];
    if (department !== 'အားလုံး') {
      data = data.filter((s) => s.dept === department);
    }
    return data;
  }, [performance?.uploads, period, department]);

  const currentStaffCount = useMemo(() => {
    if (department === 'အားလုံး') {
      return performance?.total_staff ?? 0;
    }
    return performance?.department_counts?.[department] ?? 0;
  }, [department, performance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

      {/* Left Column: Total Staffs Summary Card */}
      <div className="lg:col-span-4 flex flex-col rounded-2xl border border-gray-100 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800">

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 shadow-inner">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white/90">
                {t("ဝန်ထမ်းအင်အား")}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">{t("Staff Summary")}</p>
            </div>
          </div>
        </div>

        {/* React Select for Department Filter */}
        <div className="mb-6 relative z-30">
          <Select
            options={departmentOptions}
            value={departmentOptions.find(opt => opt.value === department) || departmentOptions[0]}
            onChange={(selected: any) => setDepartment(selected?.value || 'အားလုံး')}
            styles={customSelectStyles}
            isSearchable={true}
            placeholder={t("ဌာနရွေးချယ်ရန်...")}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
          <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10"></div>
          <span className="text-5xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
            {isLoading ? "..." : currentStaffCount.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {t("Total Staff Members")}
          </span>

          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold">
              {isLoading ? "..." : (performance?.active_users ?? 0).toLocaleString()} {t("Active System Users")}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Staff Document Uploads Leaderboard */}
      <div className="lg:col-span-8 flex flex-col rounded-2xl border border-gray-100 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] dark:bg-[#B88E2F]/10 shadow-inner">
              <Award className="h-5 w-5 text-[#997524] dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white/90">
                {t("ဝန်ထမ်းအလိုက် စာတွဲတင်ပြမှုများ")}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-gray-500 font-medium">{t("Staff Upload Leaderboard")}</p>
                {department !== 'အားလုံး' && (
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                    {department} {t("Only")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 capitalize ${period === p
                    ? 'bg-white dark:bg-gray-700 text-[#997524] dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
              >
                {t(p === 'daily' ? 'နေ့စဉ်' : p === 'weekly' ? 'အပတ်စဉ်' : 'လစဉ်')}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 mt-4 overflow-y-auto max-h-[300px] pr-2 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-4 animate-pulse pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUploads.length > 0 ? (
            filteredUploads.map((staff, index) => {
              const topUploads = filteredUploads[0].uploads;
              const percent = Math.max(10, (staff.uploads / topUploads) * 100);
              const initials = staff.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || staff.name.substring(0, 2);

              return (
                <div key={index} className="flex items-center gap-4 group">
                  {/* Rank/Avatar */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm shadow-sm ${staff.avatar}`}>
                    {initials}
                  </div>

                  {/* Info and Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{staff.name}</span>
                        {department === 'အားလုံး' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                            {staff.dept}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                        <FileUp className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-black font-mono">{staff.uploads.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-1000 ease-out shadow-sm group-hover:brightness-110"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
              <Users className="w-8 h-8 mb-2 opacity-50 stroke-[1.5]" />
              <p className="text-xs font-medium">{t("ဤကာလနှင့် ဌာနအတွက် တင်ပြထားသော စာတွဲမှတ်တမ်း မရှိသေးပါ")}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
