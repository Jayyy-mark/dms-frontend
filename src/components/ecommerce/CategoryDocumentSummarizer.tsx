import { useState, useMemo } from 'react';
import { Layers, ChevronRight, ChevronLeft, FolderTree, Inbox } from 'lucide-react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { useDashboardCategorySummary } from '../../hooks/useDashboardCategorySummary';
import { CategoryTreeNode } from '../../api/dashboardApi';

type Period = 'daily' | 'weekly' | 'monthly';

// Helper to flatten the tree for breadcrumb & parent navigation
interface FlatCategoryNode extends CategoryTreeNode {
  parent?: FlatCategoryNode | null;
}

const flattenTree = (nodes: CategoryTreeNode[], parent: FlatCategoryNode | null = null): FlatCategoryNode[] => {
  let result: FlatCategoryNode[] = [];
  nodes.forEach(node => {
    const flatNode: FlatCategoryNode = { ...node, parent };
    result.push(flatNode);
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, flatNode));
    }
  });
  return result;
};

export default function CategoryDocumentSummarizer() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');
  const [department, setDepartment] = useState<string>('အားလုံး');

  const { summary, isLoading } = useDashboardCategorySummary(department);

  const categoryTree = summary?.tree || [];
  const flatCategories = useMemo(() => flattenTree(categoryTree), [categoryTree]);

  // Track selected category. null means "All Level 1"
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const currentCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return flatCategories.find(c => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, flatCategories]);

  // Determine what list to show in the breakdown
  const breakdownList = useMemo(() => {
    if (!currentCategory) {
      return categoryTree; // Show root level
    }
    // If it has children, show children. If it's a leaf, show just itself
    if (currentCategory.children && currentCategory.children.length > 0) {
      return currentCategory.children;
    }
    return [currentCategory];
  }, [currentCategory, categoryTree]);

  const departmentOptions = useMemo(() => {
    const list = summary?.departments || [];
    return [
      { value: 'အားလုံး', label: t('ဌာနအားလုံး') },
      ...list.map(d => ({ value: d, label: d })),
    ];
  }, [summary?.departments, t]);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: state.isFocused ? '#a855f7' : '#e5e7eb',
      borderRadius: '0.75rem',
      padding: '0.1rem',
      minWidth: '220px',
      boxShadow: state.isFocused ? '0 0 0 1px #a855f7' : 'none',
      '&:hover': {
        borderColor: '#d8b4fe'
      },
      fontSize: '0.75rem',
      fontWeight: '700',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 50,
      fontSize: '0.75rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#f3e8ff' : state.isFocused ? '#faf5ff' : 'white',
      color: state.isSelected ? '#9333ea' : '#374151',
      cursor: 'pointer',
      padding: '0.5rem 1rem',
      fontWeight: state.isSelected ? '700' : '500',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151',
    }),
  };

  // Generate real data based on backend counts
  const generatedData = useMemo(() => {
    const countsMap = summary?.counts?.[period] || {};
    const colors = [
      'bg-[#B88E2F]',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-teal-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-emerald-500',
    ];

    let totalVal = 0;
    const items = breakdownList.map((item, i) => {
      const count = countsMap[item.id] || 0;
      totalVal += count;
      return {
        ...item,
        count,
        color: colors[i % colors.length]
      };
    }).sort((a, b) => b.count - a.count);

    return {
      items: items.map((item) => ({
        ...item,
        percent: totalVal > 0 ? (item.count / totalVal) * 100 : 0
      })),
      total: totalVal
    };
  }, [breakdownList, summary?.counts, period]);

  const navigateUp = () => {
    if (currentCategory && currentCategory.parent) {
      setSelectedCategoryId(currentCategory.parent.id);
    } else {
      setSelectedCategoryId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mt-6">

      {/* Container */}
      <div className="lg:col-span-12 flex flex-col rounded-2xl border border-gray-100 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800">

        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10 shadow-inner">
              <FolderTree className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white/90">
                {t("အမျိုးအစားအလိုက် စာတွဲများ")}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">{t("Documents by Category (Levels 1, 2, 3)")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Dropdown with React Select */}
            <div className="relative z-30 min-w-[220px]">
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

            {/* Period Toggle */}
            <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
              {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 capitalize ${period === p
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  {t(p === 'daily' ? 'နေ့စဉ်' : p === 'weekly' ? 'အပတ်စဉ်' : 'လစဉ်')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-5 h-[350px]">

          {/* Left: Category Navigation */}
          <div className="w-full md:w-1/3 flex flex-col border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden">
            <div className="bg-gray-100/80 dark:bg-gray-800/80 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">{t("Category Drill-down")}</span>
              {selectedCategoryId && (
                <button
                  onClick={navigateUp}
                  className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-100 dark:bg-purple-500/20 px-2 py-1 rounded transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> {t("Back")}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {/* Show breadcrumb if deep */}
              {currentCategory && (
                <div className="mb-3 px-2">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{t("Current Path:")}</div>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 p-2 rounded-lg border border-purple-100 dark:border-purple-500/20">
                    {currentCategory.parent ? `${currentCategory.parent.name} > ` : ''} {currentCategory.name}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-gray-400 font-bold uppercase px-2 mb-2 mt-2">
                {currentCategory ? (currentCategory.children?.length ? t('Sub-Categories') : t('Selected')) : t('Level 1 Categories')}
              </div>

              {isLoading ? (
                <div className="space-y-2 p-2 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                breakdownList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategoryId(item.id)}
                    disabled={!item.children || item.children.length === 0}
                    className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg transition-all ${!item.children || item.children.length === 0
                      ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default opacity-80 border border-transparent'
                      : 'hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm cursor-pointer'
                      }`}
                  >
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate pr-2">
                      {item.name}
                    </span>
                    {item.children && item.children.length > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Breakdown Chart */}
          <div className="w-full md:w-2/3 flex flex-col rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 relative overflow-hidden">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">
                  {currentCategory ? currentCategory.name : t('ခေါင်းစဉ် ခွဲခြားမှု (အဆင့် ၁ အားလုံး)')}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  {t("နေ့စဉ် အတွင်း")} ({department === 'အားလုံး' ? t('ဌာနအားလုံး') : department}) ၌ စာရွက်စာတမ်း စုစုပေါင်း {isLoading ? '...' : generatedData.total.toLocaleString()} စောင် တွေ့ရှိသည်
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-5 overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : generatedData.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <Inbox className="h-8 w-8 mb-2 stroke-[1.5]" />
                  <p className="text-xs">{t("မှတ်တမ်းတင်ထားသော စာတွဲများ မရှိသေးပါ")}</p>
                </div>
              ) : (
                generatedData.items.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex items-center gap-2 max-w-[70%]">
                        <span className={`w-1.5 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate" title={item.name}>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono text-gray-800 dark:text-gray-100">{item.count.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 w-8 text-right font-medium">{item.percent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-r-full ${item.color} transition-all duration-1000 ease-out shadow-sm group-hover:brightness-110`}
                        style={{ width: `${Math.max(item.percent, item.count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Background decorative elements */}
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <Layers className="w-64 h-64" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
