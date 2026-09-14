import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
  UserIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import {
  ArchiveIcon, Award, BookAIcon, Building,
  Building2, DoorOpen, FoldersIcon, Landmark, Layers, NotebookIcon,
  RecycleIcon, Shield, UserCog, UsersIcon
}
  from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getStoredModules, MODULE_CHANGE_EVENT } from "../utils/moduleManager";



type Role = "admin" | "user" | "super admin";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: Role[];
  subItems?: { name: string; path: string; roles?: Role[]; pro?: boolean; new?: boolean }[];
};


const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "dashboard",
    roles: ["admin", "super admin"],
    subItems: [
      { name: "Overview", path: "/", roles: ["admin", "super admin"] },
      { name: "Documents", path: "/dashboard/documents", roles: ["admin", "super admin"] },
      { name: "Photo Locations", path: "/dashboard/locations", roles: ["admin", "super admin"] },
    ]
  },
  {
    icon: <UserIcon />,
    name: "users",
    roles: ["admin", "super admin"],
    subItems: [
      { name: "User Lists", path: "/users/", roles: ["admin"] },
      { name: "Add Users", path: "/users/add/", roles: ["admin"] },
      { name: "Chat bot", path: "/users/chatbot/", roles: ["admin", "super admin"] },
      { name: "Deep Search", path: "/documents/deepsearch/", roles: ["super admin"] },
    ]
  },
  {
    icon: <Landmark />,
    name: "Activity Records",
    roles: ["admin", "super admin"],
    subItems: [
      { name: "View Activities", path: "/locations/", roles: ["admin", "super admin"] },
      { name: "Upload Activities", path: "/locations/add/", roles: ["admin"] },]
  },
];

const othersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    roles: ["admin", "super admin", "user"],
    path: "/profile",
  },
  {
    icon: <GridIcon />,
    name: "Settings",
    roles: ["admin", "super admin"],
    subItems: [
      { name: "Modules", path: "/modules", roles: ["admin", "super admin"] },
      { name: "User Roles & Permissions", path: "/settings/user-roles", roles: ["admin", "super admin"] },
    ]
  }
];


const buildingItems: NavItem[] = [
  {
    icon: <Building2 />,
    name: "departments",
    path: "/departments/"
  },
  {
    icon: <Building />,
    name: "buildings",
    path: "/buildings/"
  },
  {
    icon: <DoorOpen />,
    name: "rooms",
    roles: ["admin"],
    path: "/rooms/"
  },
];



const staffItems: NavItem[] = [
  {
    icon: <UsersIcon />,
    name: "staffs",
    roles: ["admin", "user", "super admin"],
    subItems: [
      { name: "Staffs Lists", path: "/staffs/", roles: ["admin", "user", "super admin"] },
      { name: "Add Staffs", path: "/staffs/add/", roles: ["admin", "user"] },
    ]
  },
  {
    icon: <UserCog />,
    name: "staff_types",
    roles: ["admin"],
    path: "/stypes/"
  },
  {
    icon: <Shield />,
    name: "roles",
    roles: ["admin"],
    path: "/roles/"
  },
  {
    icon: <Award />,
    name: "ranks",
    roles: ["admin"],
    path: "/ranks/"
  },
  {
    icon: <NotebookIcon />,
    name: "user_logs",
    roles: ["admin", "super admin"],
    path: "/logs/",
  },
];

const documentItems: NavItem[] = [
  {
    icon: <BookAIcon />,
    name: "documents",
    roles: ["admin", "user", "super admin"],
    subItems: [
      { name: "View Documents", path: "/documents/", roles: ["admin", "user"] },
      { name: "Upload Documents", path: "/documents/add/", roles: ["admin", "user"] },
      { name: "Deep Search", path: "/documents/deepsearch/", roles: ["admin", "user", "super admin"] },
    ]
  },
  {
    icon: <ArchiveIcon />,
    name: "archives",
    roles: ["admin", "user"],
    subItems: [
      { name: "Archived Documents Lists", path: "/documents/archives/", roles: ["admin", "user"] },
    ]
  },
  {
    icon: <RecycleIcon />,
    name: "recycle_bin",
    roles: ["admin", "user"],
    subItems: [
      { name: "Recycled Documents Lists", path: "/documents/recycles/", roles: ["admin", "user"] },
    ]
  },
  {
    icon: <Layers />,
    name: "document_types",
    roles: ["admin"],
    path: "/dtypes/",
  },
  {
    icon: <FoldersIcon />,
    name: "categories",
    roles: ["admin"],
    path: "/categories/",
  },
];

const pathToModuleId: Record<string, string> = {
  "/departments/": "departments",
  "/buildings/": "buildings",
  "/rooms/": "rooms",
  "/users/": "users",
  "/users/add/": "users",
  "/users/edit/": "users",
  "/users/chatbot/": "chatbot",
  "/documents/deepsearch/": "deepsearch",
  "/locations/": "locations",
  "/locations/add/": "locations",
  "/locations/edit/": "locations",
  "/calendar": "calendar",
  "/logs/": "logs",
  "/staffs/": "employees",
  "/staffs/add/": "employees",
  "/staffs/edit/": "employees",
  "/stypes/": "staff_types",
  "/roles/": "roles",
  "/ranks/": "ranks",
  "/documents/": "documents",
  "/documents/add/": "documents",
  "/documents/edit/": "documents",
  "/documents/archives/": "archives",
  "/documents/recycles/": "recycle_bin",
  "/dtypes/": "dtypes",
  "/categories/": "categories",
};

const AppSidebar: React.FC = () => {

  const { user } = useAuth();

  const userRole = user?.role;

  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [modulesState, setModulesState] = useState<Record<string, boolean>>(getStoredModules);

  useEffect(() => {
    const handleModuleChange = (e: CustomEvent<Record<string, boolean>>) => {
      setModulesState({ ...e.detail });
    };

    window.addEventListener(MODULE_CHANGE_EVENT as any, handleModuleChange as any);
    return () => {
      window.removeEventListener(MODULE_CHANGE_EVENT as any, handleModuleChange as any);
    };
  }, []);

  const isItemEnabled = useCallback((item: { path?: string; subItems?: any[] }): boolean => {
    if (!item) return true;
    if (item.path === "/modules" || item.path === "/hr/settings" || item.path === "/settings/user-roles" || item.path === "/profile") return true;

    if (item.subItems && item.subItems.length > 0) {
      const validSubs = item.subItems.filter(sub => isItemEnabled(sub));
      return validSubs.length > 0;
    }

    if (item.path) {
      const modId = pathToModuleId[item.path];
      if (modId && modulesState[modId] === false) {
        return false;
      }
    }
    return true;
  }, [modulesState]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "staffs" | "documents" | "buildings" | "others" | "hr";
    name: string;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activePath = useMemo(() => {
    const allPaths: string[] = [];
    (["main", "staffs", "documents", "buildings", "others", "hr"] as const).forEach((menuType) => {
      const items =
        menuType === "main" ? navItems :
          menuType === "staffs" ? staffItems :
            menuType === "documents" ? documentItems :
              menuType === "buildings" ? buildingItems :
                othersItems;
      items.forEach((nav) => {
        if (nav.path) allPaths.push(nav.path);
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (subItem.path) allPaths.push(subItem.path);
          });
        }
      });
    });

    let bestMatch = "";
    const normalizedLoc = location.pathname.endsWith('/') && location.pathname !== '/' ? location.pathname.slice(0, -1) : location.pathname;

    for (const p of allPaths) {
      if (!p) continue;
      const normalizedP = p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p;

      if ((normalizedLoc === normalizedP || normalizedLoc.startsWith(normalizedP + '/')) && p.length > bestMatch.length) {
        bestMatch = p;
      }
    }
    return bestMatch;
  }, [location.pathname]);

  const isActive = useCallback(
    (path: string) => path !== "" && path === activePath,
    [activePath]
  );

  useEffect(() => {
    let submenuMatched = false;
    (["main", "staffs", "documents", "buildings", "others", "hr"] as const).forEach((menuType) => {
      const items =
        menuType === "main" ? navItems :
          menuType === "staffs" ? staffItems :
            menuType === "documents" ? documentItems :
              menuType === "buildings" ? buildingItems :
                othersItems;
      items.forEach((nav) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                name: nav.name,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.name}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (name: string, menuType: "main" | "staffs" | "documents" | "buildings" | "others" | "hr") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.name === name
      ) {
        return null;
      }
      return { type: menuType, name };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "staffs" | "documents" | "buildings" | "others" | "hr") => {

    const visibleItems = items
      .filter(item => !item.roles || item.roles.includes(userRole as Role))
      .filter(item => isItemEnabled(item));

    if (visibleItems.length === 0) return null;

    return (
      <ul className="flex flex-col gap-1.5">
        {visibleItems.map((nav) => {
          const visibleSubItems = nav.subItems?.filter(sub =>
            (!sub.roles || sub.roles.includes(userRole as Role)) && isItemEnabled(sub)
          );

          const hasSubItems = visibleSubItems && visibleSubItems.length > 0;

          return (
            <li key={nav.name}>
              {hasSubItems ? (
                <button
                  onClick={() => handleSubmenuToggle(nav.name, menuType)}
                  className={`menu-item !py-2.5 !px-3 group ${openSubmenu?.type === menuType && openSubmenu?.name === nav.name
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    } cursor-pointer ${!isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                    }`}
                >
                  <span
                    className={`menu-item-icon-size flex items-center justify-center shrink-0 ${openSubmenu?.type === menuType && openSubmenu?.name === nav.name
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text flex-1 text-left text-xs font-medium leading-snug">{t(nav.name)}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto shrink-0 w-4 h-4 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                        openSubmenu?.name === nav.name
                        ? "rotate-180 text-white"
                        : ""
                        }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`menu-item !py-2.5 !px-3 group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                      } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                  >
                    <span
                      className={`menu-item-icon-size flex items-center justify-center shrink-0 ${isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                        }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text flex-1 text-left text-xs font-medium leading-snug">{t(nav.name)}</span>
                    )}
                  </Link>
                )
              )}
              {hasSubItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${nav.name}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.name === nav.name
                        ? `${subMenuHeight[`${menuType}-${nav.name}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-1.5 space-y-1.5 ml-6">
                    {visibleSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item !py-2 !px-3 !text-xs ${isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                            }`}
                        >
                          <span className="leading-snug">{t(subItem.name)}</span>
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge !text-[10px] !px-1.5 !py-0.5`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge !text-[10px] !px-1.5 !py-0.5`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const mainNode = renderMenuItems(navItems, "main");
  const docNode = renderMenuItems(documentItems, "documents");
  const staffNode = renderMenuItems(staffItems, "staffs");
  const buildingNode = renderMenuItems(buildingItems, "buildings");
  const othersNode = renderMenuItems(othersItems, "others");

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3.5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-sm
        ${isExpanded || isMobileOpen
          ? "w-[250px]"
          : isHovered
            ? "w-[250px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-5 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start px-3"
          }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden max-h-[42px] w-auto object-contain"
                src="/images/logo/moeNew.jpg"
                alt="Logo"
              />
              <img
                className="hidden dark:block max-h-[36px] w-auto object-contain"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
              />
              <span className="text-xl font-bold text-[#006B2F]">
                MOGE
              </span>
            </>
          ) : (
            <img
              src="/images/logo/moeNew.jpg"
              alt="Logo"
              width={28}
              height={28}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-4">
          <div className="flex flex-col gap-3">
            {mainNode && (
              <div>
                <h2
                  className={`mb-2 px-3 text-xs uppercase flex items-center leading-[20px] text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("Menu")
                  ) : (
                    <HorizontaLDots className="size-5" />
                  )}
                </h2>
                {mainNode}
              </div>
            )}

            {docNode && (
              <div>
                <h2
                  className={`mb-2 px-3 text-xs uppercase flex items-center leading-[20px] text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("documents")
                  ) : (
                    <HorizontaLDots className="size-5" />
                  )}
                </h2>
                {docNode}
              </div>
            )}

            {staffNode && (
              <div>
                <h2
                  className={`mb-2 px-3 text-xs uppercase flex items-center leading-[20px] text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("staffs")
                  ) : (
                    <HorizontaLDots className="size-5" />
                  )}
                </h2>
                {staffNode}
              </div>
            )}


            {buildingNode && (
              <div>
                <h2
                  className={`mb-2 px-3 text-xs uppercase flex items-center leading-[20px] text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("buildings")
                  ) : (
                    <HorizontaLDots className="size-5" />
                  )}
                </h2>
                {buildingNode}
              </div>
            )}

            {othersNode && (
              <div>
                <h2
                  className={`mb-2 px-3 text-xs uppercase flex items-center leading-[20px] text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("Others")
                  ) : (
                    <HorizontaLDots className="size-5" />
                  )}
                </h2>
                {othersNode}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
