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
  { id: "promotions", name: "Promotions", myanmarName: "ရာထူးတိုး", category: "HR", description: "Employee promotion tracking and management", enabled: true, paths: ["/hr/promotions"] },
  { id: "transfers", name: "Transfers", myanmarName: "ပြောင်းရွှေ့", category: "HR", description: "Employee department/location transfers", enabled: true, paths: ["/hr/transfers"] },
  { id: "training", name: "Training", myanmarName: "သင်တန်း", category: "HR", description: "Staff training courses and schedules", enabled: true, paths: ["/hr/training"] },
  { id: "overseas", name: "Overseas Travel", myanmarName: "နိုင်ငံခြားခရီးစဉ်", category: "HR", description: "Overseas duty and travel logs", enabled: true, paths: ["/hr/overseas"] },
  { id: "awards", name: "Awards", myanmarName: "ဆုတံဆိပ်များ", category: "HR", description: "Employee honors and awards records", enabled: true, paths: ["/hr/awards"] },
  { id: "punishments", name: "Punishments", myanmarName: "ပြစ်ဒဏ်များ", category: "HR", description: "Disciplinary actions and punishments", enabled: true, paths: ["/hr/punishments"] },
  { id: "reports", name: "HR Reports", myanmarName: "အစီရင်ခံစာများ", category: "HR", description: "HR analytics and summary reports", enabled: true, paths: ["/hr/reports"] },
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

const STORAGE_KEY = "moge_enabled_modules";
export const MODULE_CHANGE_EVENT = "moge_module_change";

export function getStoredModules(): Record<string, boolean> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse module settings from sessionStorage:", e);
  }

  const defaults: Record<string, boolean> = {};
  DEFAULT_MODULES.forEach(m => {
    defaults[m.id] = true;
  });
  return defaults;
}

export function setModuleEnabled(id: string, enabled: boolean) {
  const current = getStoredModules();
  current[id] = enabled;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent(MODULE_CHANGE_EVENT, { detail: current }));
}

export function setAllModulesEnabled(enabled: boolean) {
  const current: Record<string, boolean> = {};
  DEFAULT_MODULES.forEach(m => {
    current[m.id] = enabled;
  });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent(MODULE_CHANGE_EVENT, { detail: current }));
}

export function resetModulesToDefault() {
  sessionStorage.removeItem(STORAGE_KEY);
  const defaults: Record<string, boolean> = {};
  DEFAULT_MODULES.forEach(m => {
    defaults[m.id] = true;
  });
  window.dispatchEvent(new CustomEvent(MODULE_CHANGE_EVENT, { detail: defaults }));
}

export function isModuleEnabled(id: string): boolean {
  const stored = getStoredModules();
  return stored[id] !== false;
}
