export interface AppModule {
  id: string;
  name: string;
  myanmarName?: string;
  category: "HR" | "Documents" | "Departments" | "Users" | "System";
  description: string;
  enabled: boolean;
  paths: string[];
}

export const DEFAULT_MODULES: AppModule[] = [
  // HR Category
  { id: "employees", name: "Employees", myanmarName: "ဝန်ထမ်းများ", category: "HR", description: "Manage staff records and employee details", enabled: true, paths: ["/hr/employees", "/staff/register", "/staffs/"] },
  { id: "staff_types", name: "Staff Types", myanmarName: "ဝန်ထမ်းအမျိုးအစားများ", category: "HR", description: "Manage staff type classifications", enabled: true, paths: ["/stypes/"] },
  { id: "roles", name: "Roles", myanmarName: "ရာထူး/အခန်းကဏ္ဍများ", category: "HR", description: "User and staff role permissions", enabled: true, paths: ["/roles/"] },
  { id: "ranks", name: "Ranks", myanmarName: "အဆင့်အတန်းများ", category: "HR", description: "Official rank designations", enabled: true, paths: ["/ranks/"] },

  // Documents Category
  { id: "documents", name: "Documents", myanmarName: "စာရွက်စာတမ်းများ", category: "Documents", description: "Main document repository and upload", enabled: true, paths: ["/documents/"] },
  { id: "archives", name: "Archives", myanmarName: "မော်ကွန်းများ", category: "Documents", description: "Archived documents storage", enabled: true, paths: ["/documents/archives/"] },
  { id: "recycle_bin", name: "Recycle Bin", myanmarName: "အမှိုက်ပုံး", category: "Documents", description: "Deleted documents recovery bin", enabled: true, paths: ["/documents/recycles/"] },
  { id: "dtypes", name: "Document Types", myanmarName: "စာရွက်စာတမ်းအမျိုးအစားများ", category: "Documents", description: "Document format types and rules", enabled: true, paths: ["/dtypes/"] },
  { id: "categories", name: "Categories", myanmarName: "အမျိုးအစားများ", category: "Documents", description: "Document category hierarchy", enabled: true, paths: ["/categories/"] },

  // Departments Category
  { id: "departments", name: "Departments", myanmarName: "ဌာနများ", category: "Departments", description: "Organizational departments list", enabled: true, paths: ["/departments/"] },
  { id: "buildings", name: "Buildings", myanmarName: "အဆောက်အအုံများ", category: "Departments", description: "Facility buildings directory", enabled: true, paths: ["/buildings/"] },
  { id: "rooms", name: "Rooms", myanmarName: "အခန်းများ", category: "Departments", description: "Office rooms and location mapping", enabled: true, paths: ["/rooms/"] },

  // Users Category
  { id: "users", name: "User Management", myanmarName: "အသုံးပြုသူ စီမံခန့်ခွဲမှု", category: "Users", description: "System user accounts and access", enabled: true, paths: ["/users/"] },
  { id: "chatbot", name: "AI Chatbot", myanmarName: "AI ဓာတ်ခွဲလက်ထောက်", category: "Users", description: "AI document assistant chatbot", enabled: true, paths: ["/users/chatbot/"] },
  { id: "deepsearch", name: "Deep Search", myanmarName: "နက်ရှိုင်းသော ရှာဖွေမှု", category: "Users", description: "Advanced cross-document search", enabled: true, paths: ["/documents/deepsearch/"] },

  // System Category
  { id: "locations", name: "Activity Records", myanmarName: "လှုပ်ရှားမှု မှတ်တမ်းများ", category: "System", description: "Geographic photo activity records", enabled: true, paths: ["/locations/"] },
  { id: "calendar", name: "Calendar", myanmarName: "ပြက္ခဒိန်", category: "System", description: "Event and task calendar", enabled: true, paths: ["/calendar"] },
  { id: "logs", name: "Audit Logs", myanmarName: "စနစ်မှတ်တမ်းများ", category: "System", description: "System security and activity logs", enabled: true, paths: ["/logs/"] },
];

export const MODULE_CHANGE_EVENT = "moge_module_change";

/**
 * Dispatch a module change event so the sidebar can react.
 * Called by ModulesControl after API updates.
 */
export function dispatchModuleChange(statusMap: Record<string, boolean>) {
  window.dispatchEvent(new CustomEvent(MODULE_CHANGE_EVENT, { detail: statusMap }));
}
