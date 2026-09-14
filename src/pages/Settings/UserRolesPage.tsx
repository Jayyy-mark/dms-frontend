import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Search,
  Key,
  Trash2,
  ArrowLeft,
  CheckSquare,
  Square,
  Save,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {
  UserRoleItem,
  FeaturePermission,
  MODULE_PERMISSIONS_STRUCTURE,
  getStoredUserRoles,
  addUserRole,
  deleteUserRole,
  getRolePermissions,
  saveRolePermissions,
  USER_ROLES_CHANGE_EVENT
} from "../../utils/userRoleManager";
import { toast } from "react-toastify";

export default function UserRolesPage() {
  const [roles, setRoles] = useState<UserRoleItem[]>(getStoredUserRoles);
  const [newRoleName, setNewRoleName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Screen 2 state: currently selected role for Assigning Permissions
  const [selectedRole, setSelectedRole] = useState<UserRoleItem | null>(null);
  const [permissionsState, setPermissionsState] = useState<Record<string, FeaturePermission>>({});

  useEffect(() => {
    const handleRolesChange = () => {
      setRoles(getStoredUserRoles());
    };
    window.addEventListener(USER_ROLES_CHANGE_EVENT, handleRolesChange);
    return () => {
      window.removeEventListener(USER_ROLES_CHANGE_EVENT, handleRolesChange);
    };
  }, []);

  const handleSaveNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRoleName.trim();
    if (!trimmed) {
      toast.error("Please enter a User Role name.");
      return;
    }

    const created = addUserRole(trimmed);
    toast.success(`User Role "${created.name}" saved successfully!`);
    setNewRoleName("");
  };

  const handleDeleteRole = (role: UserRoleItem) => {
    if (role.isSystem) {
      toast.warning(`System role "${role.name}" cannot be deleted.`);
      return;
    }
    if (confirm(`Are you sure you want to delete the user role "${role.name}"?`)) {
      deleteUserRole(role.id);
      toast.info(`Deleted user role "${role.name}".`);
    }
  };

  const handleOpenAssignPermission = (role: UserRoleItem) => {
    setSelectedRole(role);
    const perms = getRolePermissions(role.id);
    setPermissionsState(perms);
  };

  const handleTogglePermission = (featureKey: string, action: "view" | "add" | "edit" | "delete") => {
    setPermissionsState((prev) => {
      const current = prev[featureKey] || { view: true, add: false, edit: false, delete: false };
      return {
        ...prev,
        [featureKey]: {
          ...current,
          [action]: !current[action],
        },
      };
    });
  };

  const handleToggleColumnAll = (action: "view" | "add" | "edit" | "delete", targetValue: boolean) => {
    setPermissionsState((prev) => {
      const updated = { ...prev };
      MODULE_PERMISSIONS_STRUCTURE.forEach((group) => {
        group.features.forEach((feat) => {
          const current = updated[feat.key] || { view: true, add: false, edit: false, delete: false };
          updated[feat.key] = {
            ...current,
            [action]: targetValue,
          };
        });
      });
      return updated;
    });
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    saveRolePermissions(selectedRole.id, permissionsState);
    toast.success(`Permissions for User Role "${selectedRole.name}" updated successfully!`);
    setSelectedRole(null);
  };

  const filteredRoles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [roles, searchQuery]);

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-12 animate-in fade-in duration-300">
      <PageMeta title="User Roles & Permissions | MOEE" description="Configure User Roles and Action Permissions" />

      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Main Header Card - Room.tsx border level */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FEF3C7] text-[#B88E2F] rounded-2xl">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">User Roles & Permissions</h1>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Define custom user roles and control access permissions across all modules.
              </p>
            </div>
          </div>

          {selectedRole && (
            <button
              onClick={() => setSelectedRole(null)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full transition shadow-sm self-start md:self-auto"
            >
              <ArrowLeft size={16} /> Back to User Roles List
            </button>
          )}
        </div>

        {/* View Switcher: VIEW 1 (List & Create) VS VIEW 2 (Assign Permission Matrix) */}
        {!selectedRole ? (
          /* ================= VIEW 1: ROLE CREATION & ROLE LIST ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card: Add User Role Form - Room.tsx border level */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-[#0f172a] mb-4 pb-3 border-b border-gray-200 flex items-center justify-between">
                <span>User Role</span>
                <span className="text-[10px] font-bold text-[#B88E2F] uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">New</span>
              </h2>

              <form onSubmit={handleSaveNewRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Accountant"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] focus:bg-white transition"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-2"
                  >
                    <Save size={15} /> Save
                  </button>
                </div>
              </form>
            </div>

            {/* Right Card: User Role List Table - Room.tsx border level */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-gray-200">
                <h2 className="text-base font-bold text-[#0f172a]">User Role List</h2>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search user role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-800 focus:outline-none focus:border-[#7C3AED] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Roles Table - Room.tsx border level */}
              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">User Role</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center py-8 text-gray-400 font-medium">
                          No user roles found.
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FEF3C7]/30 transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0f172a] text-sm">{r.name}</span>
                              {r.isSystem && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                                  System
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Assign Permission Button */}
                              <div className="relative group">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignPermission(r)}
                                  className="p-2 bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-lg shadow-sm transition flex items-center gap-1 text-[11px] font-bold"
                                  title="Assign Permission"
                                >
                                  <Key size={14} />
                                  <span className="hidden sm:inline">Assign Permission</span>
                                </button>
                              </div>

                              {/* Delete Action Button */}
                              {!r.isSystem && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(r)}
                                  className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                  title="Delete User Role"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 text-right text-[11px] font-medium text-gray-400">
                Showing {filteredRoles.length} of {roles.length} user roles
              </div>
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: ASSIGN PERMISSION MATRIX ================= */
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                  <span>Assign Permission ({selectedRole.name})</span>
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Configure specific module feature action checkboxes (View, Add, Edit, Delete) for users assigned to the <strong className="text-gray-800">{selectedRole.name}</strong> role.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center gap-2"
                >
                  <Save size={16} /> Save Permissions
                </button>
              </div>
            </div>

            {/* Matrix Table - Room.tsx border level */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-extrabold text-gray-700">
                    <th className="py-3.5 px-6 w-1/4 border-r border-gray-200">Module</th>
                    <th className="py-3.5 px-6 w-1/4 border-r border-gray-200">Feature</th>

                    {/* View Column with Select All */}
                    <th className="py-3.5 px-4 text-center w-1/8 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>View</span>
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll("view", true)}
                          className="text-[10px] text-indigo-600 hover:underline font-normal"
                        >
                          (All)
                        </button>
                      </div>
                    </th>

                    {/* Add Column with Select All */}
                    <th className="py-3.5 px-4 text-center w-1/8 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Add</span>
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll("add", true)}
                          className="text-[10px] text-indigo-600 hover:underline font-normal"
                        >
                          (All)
                        </button>
                      </div>
                    </th>

                    {/* Edit Column with Select All */}
                    <th className="py-3.5 px-4 text-center w-1/8 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Edit</span>
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll("edit", true)}
                          className="text-[10px] text-indigo-600 hover:underline font-normal"
                        >
                          (All)
                        </button>
                      </div>
                    </th>

                    {/* Delete Column with Select All */}
                    <th className="py-3.5 px-4 text-center w-1/8">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Delete</span>
                        <button
                          type="button"
                          onClick={() => handleToggleColumnAll("delete", true)}
                          className="text-[10px] text-indigo-600 hover:underline font-normal"
                        >
                          (All)
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs">
                  {MODULE_PERMISSIONS_STRUCTURE.map((group) => (
                    <React.Fragment key={group.moduleName}>
                      {group.features.map((feat, idx) => {
                        const featPerm = permissionsState[feat.key] || {
                          view: true,
                          add: false,
                          edit: false,
                          delete: false,
                        };

                        return (
                          <tr key={feat.key} className="hover:bg-[#FEF3C7]/20 transition-colors">
                            {/* Module Name (only rendered once on first row of group) */}
                            {idx === 0 ? (
                              <td
                                rowSpan={group.features.length}
                                className="py-3.5 px-6 font-extrabold text-[#0f172a] bg-gray-50/50 border-r border-gray-200 align-top"
                              >
                                {group.moduleName}
                              </td>
                            ) : null}

                            {/* Feature Name */}
                            <td className="py-3.5 px-6 font-semibold text-gray-700 border-r border-gray-200">
                              {feat.name}
                            </td>

                            {/* View Checkbox */}
                            <td className="py-3.5 px-4 text-center border-r border-gray-200">
                              {feat.hasView !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(feat.key, "view")}
                                  className="p-1 rounded transition hover:bg-gray-100"
                                >
                                  {featPerm.view ? (
                                    <CheckSquare size={18} className="text-[#7C3AED]" />
                                  ) : (
                                    <Square size={18} className="text-gray-300" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>

                            {/* Add Checkbox */}
                            <td className="py-3.5 px-4 text-center border-r border-gray-200">
                              {feat.hasAdd !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(feat.key, "add")}
                                  className="p-1 rounded transition hover:bg-gray-100"
                                >
                                  {featPerm.add ? (
                                    <CheckSquare size={18} className="text-[#7C3AED]" />
                                  ) : (
                                    <Square size={18} className="text-gray-300" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>

                            {/* Edit Checkbox */}
                            <td className="py-3.5 px-4 text-center border-r border-gray-200">
                              {feat.hasEdit !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(feat.key, "edit")}
                                  className="p-1 rounded transition hover:bg-gray-100"
                                >
                                  {featPerm.edit ? (
                                    <CheckSquare size={18} className="text-[#7C3AED]" />
                                  ) : (
                                    <Square size={18} className="text-gray-300" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>

                            {/* Delete Checkbox */}
                            <td className="py-3.5 px-4 text-center">
                              {feat.hasDelete !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(feat.key, "delete")}
                                  className="p-1 rounded transition hover:bg-gray-100"
                                >
                                  {featPerm.delete ? (
                                    <CheckSquare size={18} className="text-[#7C3AED]" />
                                  ) : (
                                    <Square size={18} className="text-gray-300" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Action */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500 font-medium">
                Changes will take effect immediately upon saving.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center gap-2"
                >
                  <Save size={16} /> Save Permissions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
