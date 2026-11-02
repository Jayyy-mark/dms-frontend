import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Archive,
  ArrowUpRight,
  Award,
  BookOpen,
  Bot,
  Building,
  Building2,
  Clock,
  CornerDownLeft,
  DoorOpen,
  ExternalLink,
  FileSearch,
  FileText,
  FolderTree,
  LayoutDashboard,
  Layers,
  MapPin,
  NotebookText,
  PlusCircle,
  Recycle,
  Search,
  Settings,
  Shield,
  Sliders,
  User,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import {
  dashboardApi,
  GlobalSearchResponse,
  GlobalSearchResultItem,
} from "../../api/dashboardApi";
import { useAuth, PermissionAction } from "../../context/AuthContext";
import { API_SERVER } from "../../helpers/api";
import { SpinnerIcon } from "../ui/button/ActionButton";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  keywords: string[];
  url: string;
  icon: React.ReactNode;
  feature?: string;
  action?: PermissionAction;
  roles?: string[];
  badge?: string;
}

type SelectableEntry =
  | { kind: "command"; item: CommandItem }
  | { kind: "record"; item: GlobalSearchResultItem };

const RECENT_SEARCHES_KEY = "moge_recent_global_searches_v1";
const MAX_RECENT_SEARCHES = 5;

const SYSTEM_COMMANDS: CommandItem[] = [
  {
    id: "cmd-dashboard",
    title: "Dashboard Overview",
    subtitle: "System KPIs, analytics & summary",
    keywords: ["home", "overview", "dashboard", "analytics", "kpi"],
    url: "/",
    icon: <LayoutDashboard size={15} className="text-[#B88E2F]" />,
    badge: "Page",
  },
  {
    id: "cmd-dashboard-docs",
    title: "Documents Dashboard",
    subtitle: "Document traffic & category analytics",
    keywords: ["dashboard", "documents", "traffic", "chart"],
    url: "/dashboard/documents",
    feature: "documents",
    action: "view",
    icon: <LayoutDashboard size={15} className="text-blue-600" />,
    badge: "Analytics",
  },
  {
    id: "cmd-dashboard-locs",
    title: "Photo Locations Dashboard",
    subtitle: "Interactive Myanmar map & activity records",
    keywords: ["dashboard", "locations", "map", "photos", "activities"],
    url: "/dashboard/locations",
    feature: "locations",
    action: "view",
    icon: <MapPin size={15} className="text-emerald-600" />,
    badge: "Map",
  },
  {
    id: "cmd-docs-view",
    title: "View Documents",
    subtitle: "Browse, filter & manage all documents",
    keywords: ["documents", "files", "list", "view", "ဖိုင်", "စာရွက်စာတမ်း"],
    url: "/documents/",
    feature: "documents",
    action: "view",
    icon: <FileText size={15} className="text-[#B88E2F]" />,
    badge: "Page",
  },
  {
    id: "cmd-docs-add",
    title: "Upload Document",
    subtitle: "Create and upload a new document",
    keywords: ["upload", "add", "create", "new", "document", "ဖိုင်တင်ရန်"],
    url: "/documents/add/",
    feature: "documents",
    action: "add",
    icon: <PlusCircle size={15} className="text-emerald-600" />,
    badge: "Action",
  },
  {
    id: "cmd-deepsearch",
    title: "Deep Search Documents",
    subtitle: "Full-text OCR & content search inside PDF/Word files",
    keywords: ["deep", "search", "content", "ocr", "text", "filter", "ရှာဖွေရန်"],
    url: "/documents/deepsearch/",
    feature: "deepsearch",
    action: "view",
    icon: <FileSearch size={15} className="text-purple-600" />,
    badge: "Search",
  },
  {
    id: "cmd-locations-view",
    title: "View Activity Locations",
    subtitle: "Browse all field locations & activity records",
    keywords: ["locations", "activities", "view", "map", "တည်နေရာ"],
    url: "/locations/",
    feature: "locations",
    action: "view",
    icon: <MapPin size={15} className="text-[#B88E2F]" />,
    badge: "Page",
  },
  {
    id: "cmd-locations-add",
    title: "Upload Activity Location",
    subtitle: "Add a new location with photos & coordinates",
    keywords: ["add", "upload", "create", "location", "activity", "photo"],
    url: "/locations/add/",
    feature: "locations",
    action: "add",
    icon: <PlusCircle size={15} className="text-emerald-600" />,
    badge: "Action",
  },
  {
    id: "cmd-staffs-view",
    title: "Staffs List",
    subtitle: "View and manage all staff members",
    keywords: ["staff", "employees", "hr", "list", "ဝန်ထမ်း"],
    url: "/staffs/",
    feature: "employees",
    action: "view",
    icon: <Users size={15} className="text-indigo-600" />,
    badge: "Page",
  },
  {
    id: "cmd-staffs-add",
    title: "Add Staff Member",
    subtitle: "Register a new employee record",
    keywords: ["add", "create", "new", "staff", "employee"],
    url: "/staffs/add/",
    feature: "employees",
    action: "add",
    icon: <PlusCircle size={15} className="text-emerald-600" />,
    badge: "Action",
  },
  {
    id: "cmd-departments",
    title: "Departments",
    subtitle: "Manage MOGE departments & assigned rooms",
    keywords: ["departments", "office", "division", "ဌာန"],
    url: "/departments/",
    feature: "departments",
    action: "view",
    icon: <Building2 size={15} className="text-amber-600" />,
    badge: "Page",
  },
  {
    id: "cmd-categories",
    title: "Document Categories",
    subtitle: "Manage hierarchical document categories",
    keywords: ["categories", "folders", "classification", "အမျိုးအစား"],
    url: "/categories/",
    feature: "categories",
    action: "view",
    icon: <FolderTree size={15} className="text-amber-600" />,
    badge: "Page",
  },
  {
    id: "cmd-archives",
    title: "Archived Documents",
    subtitle: "View and restore archived documents",
    keywords: ["archives", "archived", "history", "မော်ကွန်း"],
    url: "/documents/archives/",
    feature: "archives",
    action: "view",
    icon: <Archive size={15} className="text-amber-600" />,
    badge: "Page",
  },
  {
    id: "cmd-recycles",
    title: "Recycle Bin",
    subtitle: "Restore or permanently delete recycled documents",
    keywords: ["recycle", "trash", "bin", "deleted"],
    url: "/documents/recycles/",
    feature: "recycle_bin",
    action: "view",
    icon: <Recycle size={15} className="text-rose-500" />,
    badge: "Page",
  },
  {
    id: "cmd-chatbot",
    title: "MOGE AI Assistant (Chatbot)",
    subtitle: "Ask AI questions about documents and staff",
    keywords: ["ai", "chatbot", "assistant", "chat", "ask"],
    url: "/users/chatbot/",
    feature: "chatbot",
    action: "view",
    icon: <Bot size={15} className="text-blue-600" />,
    badge: "AI",
  },
  {
    id: "cmd-users-view",
    title: "Users Management",
    subtitle: "View and manage system user accounts",
    keywords: ["users", "accounts", "admin"],
    url: "/users/",
    feature: "users",
    action: "view",
    icon: <UserCheck size={15} className="text-indigo-600" />,
    badge: "Page",
  },
  {
    id: "cmd-users-add",
    title: "Create User Account",
    subtitle: "Add a new user, admin, or super admin",
    keywords: ["add", "create", "user", "account", "admin"],
    url: "/users/add/",
    feature: "users",
    action: "add",
    icon: <PlusCircle size={15} className="text-emerald-600" />,
    badge: "Action",
  },
  {
    id: "cmd-buildings",
    title: "Buildings",
    subtitle: "Manage office buildings",
    keywords: ["buildings", "facility", "အဆောက်အဦး"],
    url: "/buildings/",
    feature: "buildings",
    action: "view",
    icon: <Building size={15} className="text-slate-600" />,
    badge: "Page",
  },
  {
    id: "cmd-rooms",
    title: "Rooms",
    subtitle: "Manage building rooms",
    keywords: ["rooms", "office", "အခန်း"],
    url: "/rooms/",
    feature: "rooms",
    action: "view",
    icon: <DoorOpen size={15} className="text-slate-600" />,
    badge: "Page",
  },
  {
    id: "cmd-dtypes",
    title: "Document Types",
    subtitle: "Permanent & temporary document types",
    keywords: ["document types", "dtypes", "permanent", "temporary"],
    url: "/dtypes/",
    feature: "dtypes",
    action: "view",
    icon: <Layers size={15} className="text-slate-600" />,
    badge: "Page",
  },
  {
    id: "cmd-stypes",
    title: "Staff Types",
    subtitle: "Manage staff employment types",
    keywords: ["staff types", "stypes"],
    url: "/stypes/",
    feature: "staff_types",
    action: "view",
    icon: <UserCog size={15} className="text-slate-600" />,
    badge: "Page",
  },
  {
    id: "cmd-roles",
    title: "Staff Roles",
    subtitle: "Manage organizational roles",
    keywords: ["roles", "position", "ရာထူး"],
    url: "/roles/",
    feature: "roles",
    action: "view",
    icon: <Shield size={15} className="text-slate-600" />,
    badge: "Page",
  },
  {
    id: "cmd-ranks",
    title: "Staff Ranks",
    subtitle: "Manage staff ranks",
    keywords: ["ranks", "grade", "အဆင့်"],
    url: "/ranks/",
    feature: "ranks",
    action: "view",
    icon: <Award size={15} className="text-slate-600" />,
    badge: "Page",
  },
  {
    id: "cmd-logs",
    title: "System Audit Logs",
    subtitle: "Inspect user activity and security audit trail",
    keywords: ["logs", "audit", "activity", "history", "security", "မှတ်တမ်း"],
    url: "/logs/",
    feature: "logs",
    action: "view",
    icon: <NotebookText size={15} className="text-amber-600" />,
    badge: "Audit",
  },
  {
    id: "cmd-profile",
    title: "My User Profile",
    subtitle: "View and update your account & password",
    keywords: ["profile", "account", "password", "me", "settings"],
    url: "/profile",
    icon: <User size={15} className="text-[#B88E2F]" />,
    badge: "Account",
  },
  {
    id: "cmd-modules",
    title: "Modules Control",
    subtitle: "Enable or disable system modules & features",
    keywords: ["modules", "features", "control", "settings", "toggle"],
    url: "/modules",
    roles: ["admin", "super admin"],
    icon: <Sliders size={15} className="text-amber-600" />,
    badge: "Admin",
  },
  {
    id: "cmd-user-roles",
    title: "User Roles & Permissions",
    subtitle: "Configure role-based access control matrix",
    keywords: ["permissions", "rbac", "user roles", "access", "security"],
    url: "/settings/user-roles",
    roles: ["admin", "super admin"],
    icon: <Settings size={15} className="text-amber-600" />,
    badge: "Admin",
  },
];

function highlightText(text: string, query: string) {
  const clean = query.trim();
  if (!clean || !text) return text;
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, idx) =>
    part.toLowerCase() === clean.toLowerCase() ? (
      <mark
        key={idx}
        className="bg-[#FEF3C7] text-[#997524] dark:bg-[#B88E2F]/30 dark:text-amber-200 rounded px-0.5 font-bold"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function getRecordIcon(type: GlobalSearchResultItem["type"]) {
  switch (type) {
    case "document":
      return <BookOpen size={15} className="text-[#B88E2F]" />;
    case "location":
      return <MapPin size={15} className="text-emerald-600" />;
    case "staff":
      return <Users size={15} className="text-indigo-600" />;
    case "department":
      return <Building2 size={15} className="text-amber-600" />;
    case "category":
      return <FolderTree size={15} className="text-purple-600" />;
    case "building":
      return <Building size={15} className="text-slate-600" />;
    case "room":
      return <DoorOpen size={15} className="text-slate-600" />;
    case "user":
      return <UserCheck size={15} className="text-blue-600" />;
    default:
      return <Search size={15} className="text-gray-400" />;
  }
}

export const GlobalSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [backendData, setBackendData] = useState<GlobalSearchResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Filter commands by user permissions & query
  const permittedCommands = useMemo(() => {
    const role = (user?.role || "").toLowerCase();
    return SYSTEM_COMMANDS.filter((cmd) => {
      if (cmd.roles && cmd.roles.length > 0) {
        if (!cmd.roles.map((r) => r.toLowerCase()).includes(role)) return false;
      }
      if (cmd.feature && cmd.action) {
        return hasPermission(cmd.feature, cmd.action);
      }
      return true;
    });
  }, [user?.role, hasPermission]);

  const matchedCommands = useMemo(() => {
    const clean = query.trim().toLowerCase().normalize("NFKC");
    if (!clean) {
      return permittedCommands.slice(0, 6);
    }
    return permittedCommands
      .filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(clean) ||
          cmd.subtitle.toLowerCase().includes(clean) ||
          cmd.keywords.some((k) => k.toLowerCase().includes(clean))
      )
      .slice(0, 5);
  }, [query, permittedCommands]);

  // Debounced + abortable backend search
  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      abortRef.current?.abort();
      setBackendData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await dashboardApi.globalSearch(clean, 5, controller.signal);
        if (!controller.signal.aborted) {
          setBackendData(res);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  // Flatten selectable entries for keyboard ↑/↓ navigation
  const recordGroups = useMemo(() => {
    if (!backendData?.results) return [];
    const r = backendData.results;
    const groups: { key: string; label: string; items: GlobalSearchResultItem[] }[] = [
      { key: "documents", label: "Documents", items: r.documents || [] },
      { key: "locations", label: "Activity Locations", items: r.locations || [] },
      { key: "staffs", label: "Staff Members", items: r.staffs || [] },
      { key: "departments", label: "Departments", items: r.departments || [] },
      { key: "categories", label: "Categories", items: r.categories || [] },
      { key: "facilities", label: "Buildings & Rooms", items: r.facilities || [] },
      { key: "users", label: "Users", items: r.users || [] },
    ];
    return groups.filter((g) => g.items.length > 0);
  }, [backendData]);

  const flatEntries = useMemo<SelectableEntry[]>(() => {
    const entries: SelectableEntry[] = [];
    matchedCommands.forEach((cmd) => entries.push({ kind: "command", item: cmd }));
    recordGroups.forEach((group) => {
      group.items.forEach((rec) => entries.push({ kind: "record", item: rec }));
    });
    return entries;
  }, [matchedCommands, recordGroups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, backendData]);

  // Global Cmd+K / Ctrl+K shortcut + outside click handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectEntry = useCallback(
    (entry: SelectableEntry) => {
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      setIsOpen(false);
      navigate(entry.item.url);
    },
    [navigate, query, saveRecentSearch]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) setIsOpen(true);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatEntries.length > 0) {
        setActiveIndex((prev) => (prev + 1) % flatEntries.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatEntries.length > 0) {
        setActiveIndex((prev) => (prev - 1 + flatEntries.length) % flatEntries.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatEntries[activeIndex];
      if (target) {
        handleSelectEntry(target);
      } else if (query.trim()) {
        saveRecentSearch(query.trim());
        setIsOpen(false);
        navigate("/documents/deepsearch/");
      }
    }
  };

  let runningIndex = -1;

  return (
    <div ref={containerRef} className="relative w-full lg:w-auto">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="relative group">
          <span className="absolute -translate-y-1/2 pointer-events-none left-3.5 top-1/2">
            <svg
              className="fill-gray-400 transition-colors group-focus-within:fill-[#B88E2F] dark:fill-gray-500"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search or type command..."
            aria-label="Global search or command palette"
            className="h-9 w-full rounded-full border border-gray-200 bg-gray-50/50 py-1.5 pl-10 pr-16 text-xs text-gray-800 transition-colors focus:border-[#B88E2F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#B88E2F] dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-[#B88E2F] lg:w-[320px] xl:w-[380px]"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <span className="text-[#B88E2F] flex items-center">
                <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
              </span>
            )}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setBackendData(null);
                  inputRef.current?.focus();
                }}
                className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen((prev) => !prev);
                inputRef.current?.focus();
              }}
              className="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] -tracking-[0.2px] text-gray-400 font-medium dark:border-gray-700 dark:bg-gray-800"
            >
              <span>⌘</span>
              <span>K</span>
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown Command & Search Palette */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[320px] sm:w-[480px] xl:w-[540px] max-h-[75vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] dark:border-gray-800 dark:bg-gray-900 z-50 overflow-hidden">
          <div
            className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
          >
            {/* Recent Searches (when input is empty) */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="p-2.5">
                <div className="flex items-center justify-between px-2.5 pb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Clock size={11} />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:border-[#B88E2F] hover:text-[#997524] transition-colors"
                    >
                      <Search size={11} className="text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Commands / Navigation */}
            {matchedCommands.length > 0 && (
              <div className="p-2">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  {query.trim() ? "Commands & Pages" : "Quick Navigation"}
                </div>
                <div className="space-y-0.5">
                  {matchedCommands.map((cmd) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => handleSelectEntry({ kind: "command", item: cmd })}
                        className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left transition-colors ${
                          isActive
                            ? "bg-[#FEF3C7]/60 dark:bg-[#B88E2F]/20 text-gray-900 dark:text-white"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            {cmd.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                              {highlightText(cmd.title, query)}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                              {highlightText(cmd.subtitle, query)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cmd.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              {cmd.badge}
                            </span>
                          )}
                          <ArrowUpRight size={13} className="text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Database Records Grouped by Entity */}
            {query.trim() &&
              recordGroups.map((group) => (
                <div key={group.key} className="p-2">
                  <div className="px-2.5 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {group.items.length} matched
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((rec) => {
                      runningIndex += 1;
                      const idx = runningIndex;
                      const isActive = idx === activeIndex;
                      return (
                        <div
                          key={`${rec.type}-${rec.id}`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => handleSelectEntry({ kind: "record", item: rec })}
                          className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                            isActive
                              ? "bg-[#FEF3C7]/60 dark:bg-[#B88E2F]/20 text-gray-900 dark:text-white"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              {getRecordIcon(rec.type)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                                  {highlightText(rec.title, query)}
                                </p>
                                {rec.code && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0">
                                    {highlightText(rec.code, query)}
                                  </span>
                                )}
                                {rec.status && rec.status !== "active" && (
                                  <span
                                    className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full shrink-0 ${
                                      rec.status === "archived"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {rec.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                {highlightText(rec.subtitle, query)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {rec.file_url && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`${API_SERVER}${rec.file_url}`, "_blank");
                                }}
                                className="p-1 rounded-md text-gray-400 hover:text-[#B88E2F] hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                title="Open document file"
                              >
                                <ExternalLink size={13} />
                              </button>
                            )}
                            <CornerDownLeft size={13} className="text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Empty State */}
            {query.trim() && !isLoading && flatEntries.length === 0 && (
              <div className="py-8 px-4 text-center">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  No matching records or commands for "{query}"
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Try searching inside document contents using Deep Search.
                </p>
                {hasPermission("deepsearch", "view") && (
                  <button
                    type="button"
                    onClick={() => {
                      saveRecentSearch(query.trim());
                      setIsOpen(false);
                      navigate("/documents/deepsearch/");
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#B88E2F] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#997524] transition-colors"
                  >
                    <FileSearch size={13} />
                    Open Deep Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-medium">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500">
                  ↵
                </kbd>
                Open
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500">
                  Esc
                </kbd>
                Close
              </span>
            </div>
            {backendData && query.trim() ? (
              <span>{backendData.total} database result(s)</span>
            ) : (
              <span>MOGE Quick Search</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;

