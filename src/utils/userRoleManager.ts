export interface UserRoleItem {
  id: string;
  name: string;
  isSystem?: boolean;
}

export interface FeaturePermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface ModuleFeatureGroup {
  moduleName: string;
  features: {
    key: string;
    name: string;
    hasView?: boolean;
    hasAdd?: boolean;
    hasEdit?: boolean;
    hasDelete?: boolean;
  }[];
}

export const MODULE_PERMISSIONS_STRUCTURE: ModuleFeatureGroup[] = [
  {
    moduleName: "Staffs & HR Information",
    features: [
      { key: "employees", name: "Staffs & Employees", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "promotions", name: "Promotions", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "transfers", name: "Transfers", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "training", name: "Training", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "overseas", name: "Overseas Duty", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "awards", name: "Awards & Honors", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "punishments", name: "Disciplinary Actions", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "reports", name: "HR Reports", hasView: true, hasAdd: false, hasEdit: false, hasDelete: false },
    ],
  },
  {
    moduleName: "Documents Management",
    features: [
      { key: "documents", name: "Main Documents Repository", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "archives", name: "Archived Documents", hasView: true, hasAdd: true, hasEdit: false, hasDelete: true },
      { key: "recycle_bin", name: "Recycle Bin & Recovery", hasView: true, hasAdd: false, hasEdit: true, hasDelete: true },
      { key: "dtypes", name: "Document Format Types", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "categories", name: "Document Categories", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "deepsearch", name: "Deep Search Intelligence", hasView: true, hasAdd: false, hasEdit: false, hasDelete: false },
    ],
  },
  {
    moduleName: "Departments & Facilities",
    features: [
      { key: "departments", name: "Departments List", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "buildings", name: "Buildings Directory", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "rooms", name: "Rooms & Locations", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
    ],
  },
  {
    moduleName: "User Management & AI",
    features: [
      { key: "users", name: "User Accounts", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "chatbot", name: "AI Assistant Chatbot", hasView: true, hasAdd: true, hasEdit: false, hasDelete: false },
    ],
  },
  {
    moduleName: "System & Activity Records",
    features: [
      { key: "locations", name: "Activity Records", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "calendar", name: "Event Calendar", hasView: true, hasAdd: true, hasEdit: true, hasDelete: true },
      { key: "logs", name: "User Audit Logs", hasView: true, hasAdd: false, hasEdit: false, hasDelete: false },
    ],
  },
];

export const DEFAULT_USER_ROLES: UserRoleItem[] = [
  { id: "admin", name: "Admin", isSystem: true },
  { id: "teacher", name: "Teacher" },
  { id: "accountant", name: "Accountant" },
  { id: "librarian", name: "Librarian" },
  { id: "receptionist", name: "Receptionist" },
  { id: "super_admin", name: "Super Admin", isSystem: true },
  { id: "user", name: "User", isSystem: true },
];

const ROLES_KEY = "moge_user_roles";
const PERMISSIONS_KEY_PREFIX = "moge_user_role_perm_";
export const USER_ROLES_CHANGE_EVENT = "moge_user_roles_change";

export function getStoredUserRoles(): UserRoleItem[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse user roles from localStorage:", e);
  }
  return DEFAULT_USER_ROLES;
}

export function addUserRole(name: string): UserRoleItem {
  const roles = getStoredUserRoles();
  const id = name.toLowerCase().trim().replace(/\s+/g, "_");
  
  // Check if role already exists
  const existing = roles.find(r => r.id === id || r.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return existing;
  }

  const newRole: UserRoleItem = { id, name };
  const updated = [...roles, newRole];
  localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(USER_ROLES_CHANGE_EVENT, { detail: updated }));

  // Initialize permissions with default full/standard permissions
  initDefaultPermissionsForRole(id, id === "admin" || id === "super_admin");

  return newRole;
}

export function deleteUserRole(id: string) {
  const roles = getStoredUserRoles();
  const updated = roles.filter(r => r.id !== id);
  localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
  localStorage.removeItem(`${PERMISSIONS_KEY_PREFIX}${id}`);
  window.dispatchEvent(new CustomEvent(USER_ROLES_CHANGE_EVENT, { detail: updated }));
}

export function getRolePermissions(roleId: string): Record<string, FeaturePermission> {
  try {
    const raw = localStorage.getItem(`${PERMISSIONS_KEY_PREFIX}${roleId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Failed to load permissions for role ${roleId}:`, e);
  }

  return initDefaultPermissionsForRole(roleId, roleId === "admin" || roleId === "super_admin");
}

export function saveRolePermissions(roleId: string, permissions: Record<string, FeaturePermission>) {
  localStorage.setItem(`${PERMISSIONS_KEY_PREFIX}${roleId}`, JSON.stringify(permissions));
  window.dispatchEvent(new CustomEvent(USER_ROLES_CHANGE_EVENT, { detail: { roleId, permissions } }));
}

function initDefaultPermissionsForRole(roleId: string, isFullAccess: boolean): Record<string, FeaturePermission> {
  const perms: Record<string, FeaturePermission> = {};

  MODULE_PERMISSIONS_STRUCTURE.forEach(group => {
    group.features.forEach(feat => {
      perms[feat.key] = {
        view: isFullAccess || true,
        add: isFullAccess,
        edit: isFullAccess,
        delete: isFullAccess,
      };
    });
  });

  localStorage.setItem(`${PERMISSIONS_KEY_PREFIX}${roleId}`, JSON.stringify(perms));
  return perms;
}

export function hasPermission(roleId: string, featureKey: string, action: "view" | "add" | "edit" | "delete"): boolean {
  if (roleId === "admin" || roleId === "super_admin" || roleId === "super admin") {
    return true;
  }
  const perms = getRolePermissions(roleId);
  if (!perms[featureKey]) return true;
  return perms[featureKey][action] ?? true;
}
