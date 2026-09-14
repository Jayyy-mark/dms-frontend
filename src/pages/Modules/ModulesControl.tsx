import { useState, useEffect, useMemo } from "react";
import { Search, CheckCircle2, XCircle, RotateCcw, Layers } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {
  DEFAULT_MODULES,
  getStoredModules,
  setModuleEnabled,
  setAllModulesEnabled,
  resetModulesToDefault,
  MODULE_CHANGE_EVENT
} from "../../utils/moduleManager";

type CategoryFilter = "All" | "System" | "Documents" | "Departments" | "Users";

export default function ModulesControl() {
  const [modulesState, setModulesState] = useState<Record<string, boolean>>(getStoredModules);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleModuleChange = (e: CustomEvent<Record<string, boolean>>) => {
      setModulesState({ ...e.detail });
    };

    window.addEventListener(MODULE_CHANGE_EVENT as any, handleModuleChange as any);
    return () => {
      window.removeEventListener(MODULE_CHANGE_EVENT as any, handleModuleChange as any);
    };
  }, []);

  const handleToggle = (id: string) => {
    const nextVal = !modulesState[id];
    setModuleEnabled(id, nextVal);
  };

  const handleEnableAll = () => {
    setAllModulesEnabled(true);
  };

  const handleDisableAll = () => {
    setAllModulesEnabled(false);
  };

  const handleReset = () => {
    resetModulesToDefault();
  };

  // Filtered Modules
  const filteredModules = useMemo(() => {
    return DEFAULT_MODULES.filter((mod) => {
      const matchesCategory = activeCategory === "All" || mod.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mod.name.toLowerCase().includes(q) ||
        (mod.myanmarName && mod.myanmarName.toLowerCase().includes(q)) ||
        mod.id.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Statistics
  const totalCount = DEFAULT_MODULES.length;
  const enabledCount = useMemo(() => {
    return DEFAULT_MODULES.filter((m) => modulesState[m.id] !== false).length;
  }, [modulesState]);
  const disabledCount = totalCount - enabledCount;

  const categories: CategoryFilter[] = ["All", "System", "Documents", "Departments", "Users"];

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-12 animate-in fade-in duration-300">
      <PageMeta title="Modules Control | MOEE" description="Enable or disable application modules" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header - Room.tsx border level */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#FEF3C7] text-[#B88E2F] rounded-2xl">
                <Layers size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Modules Management</h1>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Turn modules on or off to customize sidebar items and page access.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleEnableAll}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-full transition shadow-sm"
            >
              <CheckCircle2 size={15} /> Enable All
            </button>
            <button
              onClick={handleDisableAll}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-full transition shadow-sm"
            >
              <XCircle size={15} /> Disable All
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 rounded-full transition shadow-sm"
            >
              <RotateCcw size={15} /> Reset Defaults
            </button>
          </div>
        </div>

        {/* Stats Cards - Room.tsx border level */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Modules</p>
              <h3 className="text-2xl font-black text-[#0f172a] mt-1">{totalCount}</h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-blue-100">
              {totalCount}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Active Modules</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{enabledCount}</h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-emerald-100">
              {enabledCount}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">Disabled Modules</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{disabledCount}</h3>
            </div>
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-rose-100">
              {disabledCount}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar - Room.tsx border level */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === "All"
                  ? DEFAULT_MODULES.length
                  : DEFAULT_MODULES.filter((m) => m.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${isActive
                    ? "bg-[#B88E2F] border-[#B88E2F] text-white shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search module name or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B88E2F] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Modules Table - Room.tsx border level */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Module Info</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Toggle Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                      No modules found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredModules.map((mod) => {
                    const isEnabled = modulesState[mod.id] !== false;

                    return (
                      <tr key={mod.id} className="hover:bg-[#FEF3C7]/30 transition-colors group">
                        {/* Name & ID */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                              <span>{mod.name}</span>
                              {mod.myanmarName && (
                                <span className="text-xs font-normal text-gray-500">({mod.myanmarName})</span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">
                              key: {mod.id}
                            </span>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${mod.category === "Documents"
                              ? "bg-blue-50 text-blue-700"
                              : mod.category === "Departments"
                                ? "bg-purple-50 text-purple-700"
                                : mod.category === "Users"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                          >
                            {mod.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-6 text-gray-600 font-medium max-w-xs">
                          {mod.description}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isEnabled
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                              : "bg-gray-100 text-gray-400 border border-gray-200/50"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${isEnabled ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                                }`}
                            ></span>
                            {isEnabled ? "Active" : "Disabled"}
                          </span>
                        </td>

                        {/* Toggle Button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggle(mod.id)}
                            className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? "bg-[#22C55E]" : "bg-gray-200"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isEnabled ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
