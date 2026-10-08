export interface UserRoleItem {
  id: number;
  name: string;
  isSystem?: boolean;
}

export const DEFAULT_USER_ROLES: UserRoleItem[] = [
  { id: 1, name: "Admin", isSystem: true },
  { id: 2, name: "Super Admin", isSystem: true },
  { id: 3, name: "User", isSystem: true },
];

export const getStoredUserRoles = (): UserRoleItem[] => {
  return DEFAULT_USER_ROLES;
};

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

/**
 * Display hints for features in the permission matrix.
 * Maps feature key → display name and which permission columns to show.
 * Default for all: hasView=true, hasAdd=true, hasEdit=true, hasDelete=true.
 */
export const FEATURE_DISPLAY_INFO: Record<
  string,
  { displayName: string; hasView?: boolean; hasAdd?: boolean; hasEdit?: boolean; hasDelete?: boolean }
> = {
  employees: { displayName: "Staffs & Employees" },
  staff_types: { displayName: "Staff Types" },
  roles: { displayName: "Roles" },
  ranks: { displayName: "Ranks" },
  promotions: { displayName: "Promotions" },
  transfers: { displayName: "Transfers" },
  training: { displayName: "Training" },
  overseas: { displayName: "Overseas Travel" },
  awards: { displayName: "Awards" },
  punishments: { displayName: "Punishments" },
  reports: { displayName: "HR Reports", hasAdd: false, hasEdit: false, hasDelete: false },
  documents: { displayName: "Main Documents Repository" },
  archives: { displayName: "Archived Documents", hasEdit: false },
  recycle_bin: { displayName: "Recycle Bin & Recovery", hasAdd: false },
  dtypes: { displayName: "Document Format Types" },
  categories: { displayName: "Document Categories" },
  deepsearch: { displayName: "Deep Search Intelligence", hasAdd: false, hasEdit: false, hasDelete: false },
  departments: { displayName: "Departments List" },
  buildings: { displayName: "Buildings Directory" },
  rooms: { displayName: "Rooms & Locations" },
  users: { displayName: "User Accounts" },
  chatbot: { displayName: "AI Assistant Chatbot", hasEdit: false, hasDelete: false },
  locations: { displayName: "Activity Records" },
  calendar: { displayName: "Event Calendar" },
  logs: { displayName: "User Audit Logs", hasAdd: false, hasEdit: false, hasDelete: false },
};

/** Role names that are considered system roles and cannot be deleted */
export const SYSTEM_ROLE_NAMES = ["admin", "super admin", "user"];

export const USER_ROLES_CHANGE_EVENT = "moge_user_roles_change";

/**
 * Build a ModuleFeatureGroup array from API module data, enriched with display hints.
 */
export function buildPermissionStructure(
  apiModules: { id: number; name: string; features: { id: number; name: string; status: boolean }[] }[]
): ModuleFeatureGroup[] {
  return apiModules.map((m) => ({
    moduleName: m.name,
    features: m.features.map((f) => {
      const info = FEATURE_DISPLAY_INFO[f.name];
      return {
        key: f.name,
        name: info?.displayName || f.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        hasView: info?.hasView ?? true,
        hasAdd: info?.hasAdd ?? true,
        hasEdit: info?.hasEdit ?? true,
        hasDelete: info?.hasDelete ?? true,
      };
    }),
  }));
}
