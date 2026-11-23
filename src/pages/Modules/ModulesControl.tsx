import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, CheckCircle2, XCircle, RotateCcw, Layers, Shield, Save, Undo2 } from "lucide-react";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import { DEFAULT_MODULES, dispatchModuleChange } from "../../utils/moduleManager";
import { moduleApi } from "../../api/moduleApi";
import { userRoleApi } from "../../api/userRoleApi";
import { USER_ROLES_CHANGE_EVENT } from "../../utils/userRoleManager";
import { useAuth } from "../../context/AuthContext";

type CategoryFilter = "All" | "HR" | "Documents" | "Departments" | "Users" | "System";

interface RoleOption {
  id: number;
  name: string;
}

export default function ModulesControl() {
  const { user } = useAuth();

  // Available User Roles & currently selected role
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Saved vs Draft module statuses for the currently selected role (featureKey -> boolean)
  const [savedStatusMap, setSavedStatusMap] = useState<Record<string, boolean>>({});
  const [draftStatusMap, setDraftStatusMap] = useState<Record<string, boolean>>({});

  const [initialLoading, setInitialLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const isEditingCurrentUserRole = Boolean(
    selectedRole &&
      user?.role &&
      selectedRole.name.trim().toLowerCase() === user.role.trim().toLowerCase()
  );

  const hasUnsavedChanges = useMemo(() => {
    const keys = new Set([...Object.keys(savedStatusMap), ...Object.keys(draftStatusMap)]);
    for (const key of keys) {
      if ((savedStatusMap[key] ?? true) !== (draftStatusMap[key] ?? true)) {
        return true;
      }
    }
    return false;
  }, [savedStatusMap, draftStatusMap]);

  // Fetch roles list on mount and when roles change
  const loadRoles = useCallback(async () => {
    try {
      const data = await userRoleApi.getRoles();
      const fetchedRoles: RoleOption[] = Array.isArray(data?.roles) ? data.roles : [];
      setRoles(fetchedRoles);
      setSelectedRoleId((prev) => {
        if (prev !== null && fetchedRoles.some((r) => r.id === prev)) {
          return prev;
        }
        const ownRole = fetchedRoles.find(
          (r) => user?.role && r.name.trim().toLowerCase() === user.role.trim().toLowerCase()
        );
        return ownRole?.id ?? fetchedRoles[0]?.id ?? null;
      });
    } catch (e) {
      console.error("Failed to fetch user roles:", e);
      toast.error("Failed to load user roles.");
      setInitialLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadRoles();
    window.addEventListener(USER_ROLES_CHANGE_EVENT, loadRoles);
    return () => {
      window.removeEventListener(USER_ROLES_CHANGE_EVENT, loadRoles);
    };
  }, [loadRoles]);

  // Fetch role-specific module statuses whenever selectedRoleId changes
  useEffect(() => {
    if (selectedRoleId === null) return;
    let cancelled = false;

    const fetchRoleModules = async () => {
      setRoleLoading(true);
      try {
        const data = await moduleApi.getRoleModules(selectedRoleId);
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        DEFAULT_MODULES.forEach((m) => {
          map[m.id] = true;
        });
        if (data?.feature_status && typeof data.feature_status === "object") {
          Object.entries(data.feature_status).forEach(([key, val]) => {
            map[key] = Boolean(val);
          });
        } else {
          (data?.modules || []).forEach((m: any) => {
            (m.features || []).forEach((f: any) => {
              map[f.name] = Boolean(f.status);
            });
          });
        }
        setSavedStatusMap(map);
        setDraftStatusMap(map);
      } catch (e: any) {
        if (cancelled) return;
        console.error("Failed to fetch modules for role:", e);
        toast.error(
          e?.response?.data?.message ||
            "Failed to load role modules. Make sure the backend server is restarted."
        );
      } finally {
        if (!cancelled) {
          setRoleLoading(false);
          setInitialLoading(false);
        }
      }
    };

    fetchRoleModules();
    return () => {
      cancelled = true;
    };
  }, [selectedRoleId]);

  const handleSelectRole = (roleId: number) => {
    if (roleId === selectedRoleId) return;
    if (hasUnsavedChanges) {
      const proceed = window.confirm(
        `You have unsaved changes for "${selectedRole?.name || "this role"}". Discard them and switch roles?`
      );
      if (!proceed) return;
    }
    setSelectedRoleId(roleId);
  };

  // Toggle locally in draft state only (persisted when clicking Save Changes)
  const handleToggle = (id: string) => {
    if (selectedRoleId === null || roleLoading || isSaving) return;
    setDraftStatusMap((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const handleDraftBulk = (targetStatus: boolean) => {
    if (selectedRoleId === null || roleLoading || isSaving) return;
    const next: Record<string, boolean> = {};
    DEFAULT_MODULES.forEach((m) => {
      next[m.id] = targetStatus;
    });
    Object.keys(draftStatusMap).forEach((key) => {
      next[key] = targetStatus;
    });
    setDraftStatusMap(next);
  };

  const handleDiscardChanges = () => {
    setDraftStatusMap({ ...savedStatusMap });
  };

  const handleSaveRoleModules = async () => {
    if (selectedRoleId === null || isSaving) return;
    setIsSaving(true);
    try {
      const data = await moduleApi.saveRoleModules(selectedRoleId, draftStatusMap);
      const persistedMap: Record<string, boolean> = { ...draftStatusMap };
      if (data?.feature_status && typeof data.feature_status === "object") {
        Object.entries(data.feature_status).forEach(([key, val]) => {
          persistedMap[key] = Boolean(val);
        });
      }
      setSavedStatusMap(persistedMap);
      setDraftStatusMap(persistedMap);

      // Only update the current user's live sidebar if they saved their own role
      if (isEditingCurrentUserRole) {
        dispatchModuleChange(persistedMap);
      }

      toast.success(`Saved module settings for "${selectedRole?.name || "role"}"!`);
    } catch (e: any) {
      console.error("Failed to save role modules:", e);
      toast.error(e?.response?.data?.message || "Failed to save module settings.");
    } finally {
      setIsSaving(false);
    }
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

  // Statistics (reflect current draft for selected role)
  const totalCount = DEFAULT_MODULES.length;
  const enabledCount = useMemo(() => {
    return DEFAULT_MODULES.filter((m) => draftStatusMap[m.id] !== false).length;
  }, [draftStatusMap]);
  const disabledCount = totalCount - enabledCount;

  const categories: CategoryFilter[] = ["All", "HR", "Documents", "Departments", "Users", "System"];

  if (initialLoading) {
    return (
      <div className="bg-[#fcfdff] min-h-screen pb-12 animate-pulse">
        <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-3 w-72 rounded bg-gray-100" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 rounded-full bg-gray-200" />
              <div className="h-9 w-28 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-7 w-12 rounded bg-gray-200" />
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gray-100" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="space-y-2">
                  <div className="h-4 w-44 rounded bg-gray-200" />
                  <div className="h-3 w-28 rounded bg-gray-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-gray-100" />
                <div className="h-3.5 w-56 rounded bg-gray-100 hidden md:block" />
                <div className="h-6 w-16 rounded-full bg-gray-100" />
                <div className="h-7 w-13 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-12 animate-in fade-in duration-300">
      <PageMeta title="Modules Control | MOGE" description="Enable or disable application modules per user role" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#FEF3C7] text-[#B88E2F] rounded-2xl">
                <Layers size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Modules Management</h1>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Select a user role, toggle modules for that role, and click Save Changes.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions (modify local draft until Save Changes is clicked) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isSaving || roleLoading || selectedRoleId === null}
              onClick={() => handleDraftBulk(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-full transition shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 size={15} /> Enable All
            </button>
            <button
              type="button"
              disabled={isSaving || roleLoading || selectedRoleId === null}
              onClick={() => handleDraftBulk(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-full transition shadow-sm disabled:opacity-50"
            >
              <XCircle size={15} /> Disable All
            </button>
            <button
              type="button"
              disabled={isSaving || roleLoading || selectedRoleId === null}
              onClick={() => handleDraftBulk(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 rounded-full transition shadow-sm disabled:opacity-50"
            >
              <RotateCcw size={15} /> Reset Defaults
            </button>
          </div>
        </div>

        {/* User Role Selector + Save Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-50 text-[#B88E2F] border border-amber-200/70">
                <Shield size={16} />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                  Target User Role
                </h2>
                <p className="text-[11px] text-gray-500">
                  Each role has independent module visibility. Changes are saved only for{" "}
                  <span className="font-bold text-[#B88E2F]">
                    {selectedRole?.name || "—"}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasUnsavedChanges && (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved changes
                  </span>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleDiscardChanges}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition disabled:opacity-50"
                  >
                    <Undo2 size={14} /> Discard
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={!hasUnsavedChanges || isSaving || roleLoading || selectedRoleId === null}
                onClick={handleSaveRoleModules}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#B88E2F] hover:bg-[#997524] rounded-full transition shadow-sm disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {isSaving
                  ? "Saving..."
                  : `Save for ${selectedRole?.name || "Role"}`}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {roles.length === 0 ? (
              <span className="text-xs text-gray-400">No user roles found.</span>
            ) : (
              roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                const isOwn =
                  Boolean(user?.role) &&
                  role.name.trim().toLowerCase() === user!.role.trim().toLowerCase();
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-[#B88E2F] border-[#B88E2F] text-white shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-amber-50/60 hover:border-amber-200"
                    }`}
                  >
                    <Shield size={13} />
                    <span>{role.name}</span>
                    {isOwn && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-amber-100 text-[#B88E2F]"
                        }`}
                      >
                        You
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Filter Tabs & Search Bar */}
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
                  type="button"
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

        {/* Modules Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {roleLoading && (
            <div className="h-0.5 w-full bg-[#B88E2F]/20 overflow-hidden">
              <div className="h-full w-1/3 bg-[#B88E2F] animate-pulse" />
            </div>
          )}
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
              <tbody className={`divide-y divide-gray-100 text-xs font-medium transition-opacity ${roleLoading ? "opacity-50 pointer-events-none" : ""}`}>
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                      No modules found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredModules.map((mod) => {
                    const isEnabled = draftStatusMap[mod.id] !== false;
                    const isChanged = (savedStatusMap[mod.id] ?? true) !== isEnabled;

                    return (
                      <tr
                        key={mod.id}
                        className={`hover:bg-[#FEF3C7]/30 transition-colors group ${
                          isChanged ? "bg-amber-50/40" : ""
                        }`}
                      >
                        {/* Name & ID */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                              <span>{mod.name}</span>
                              {mod.myanmarName && (
                                <span className="text-xs font-normal text-gray-500">({mod.myanmarName})</span>
                              )}
                              {isChanged && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  Modified
                                </span>
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
                                  : mod.category === "HR"
                                    ? "bg-amber-50 text-amber-700"
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
                            disabled={roleLoading || isSaving}
                            onClick={() => handleToggle(mod.id)}
                            className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${isEnabled ? "bg-[#22C55E]" : "bg-gray-200"
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
