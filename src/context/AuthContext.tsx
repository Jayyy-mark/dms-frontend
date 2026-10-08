import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../helpers/api";
import { userRoleApi } from "../api/userRoleApi";
import { USER_ROLES_CHANGE_EVENT } from "../utils/userRoleManager";
import { MODULE_CHANGE_EVENT } from "../utils/moduleManager";

export type PermissionAction = "view" | "add" | "edit" | "delete";

export type User = {
  id: number;
  user_id: string;
  username: string;
  email: string;
  role: string;
  staff_id: number;
  is_active?: boolean;
};

export type FeaturePermissionRecord = {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
  permissions: Record<string, FeaturePermissionRecord>;
  featureStatus: Record<string, boolean>;
  hasPermission: (feature: string, action?: PermissionAction) => boolean;
  refreshPermissions: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, FeaturePermissionRecord>>({});
  const [featureStatus, setFeatureStatus] = useState<Record<string, boolean>>({});

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (e) {
      console.error("Logout failed:", e);
    }
    setUser(null);
    setPermissions({});
    setFeatureStatus({});
  };

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await userRoleApi.getMyPermissions();
      if (data) {
        if (data.permissions) {
          setPermissions(data.permissions);
        }
        if (data.feature_status) {
          setFeatureStatus(data.feature_status);
        }
      }
    } catch (err) {
      console.error("Failed to load permissions:", err);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get("auth/user/");
      if (data && data.is_active === false) {
        await logout();
        return;
      }
      setUser(data);
      // Once user is identified, fetch their live permissions
      try {
        const permData = await userRoleApi.getMyPermissions();
        if (permData) {
          if (permData.permissions) setPermissions(permData.permissions);
          if (permData.feature_status) setFeatureStatus(permData.feature_status);
        }
      } catch (err) {
        console.error("Failed to load user permissions:", err);
      }
    } catch {
      setUser(null);
      setPermissions({});
      setFeatureStatus({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Listen for permission and module changes dispatched in the application
  useEffect(() => {
    const handleRolesChange = () => {
      fetchPermissions();
    };
    const handleModuleChange = (e: CustomEvent<Record<string, boolean>>) => {
      if (e.detail) {
        setFeatureStatus({ ...e.detail });
      } else {
        fetchPermissions();
      }
    };

    window.addEventListener(USER_ROLES_CHANGE_EVENT, handleRolesChange);
    window.addEventListener(MODULE_CHANGE_EVENT as any, handleModuleChange as any);

    return () => {
      window.removeEventListener(USER_ROLES_CHANGE_EVENT, handleRolesChange);
      window.removeEventListener(MODULE_CHANGE_EVENT as any, handleModuleChange as any);
    };
  }, [fetchPermissions]);

  /**
   * Check if the authenticated user has permission for a specific feature and action.
   * If the feature is globally disabled, returns false.
   * If permission record exists, enforces the specific action (view/add/edit/delete).
   */
  const hasPermission = useCallback(
    (feature: string, action: PermissionAction = "view"): boolean => {
      if (!user) return false;

      // 1. Check if the feature is globally disabled via ModulesControl
      if (featureStatus[feature] === false) {
        return false;
      }

      // 2. Check role-based permission
      const perm = permissions[feature];
      if (!perm) {
        // If no permissions loaded yet, allow if super admin, else allow view by default
        return true;
      }

      switch (action) {
        case "view":
          return Boolean(perm.can_view);
        case "add":
          return Boolean(perm.can_create);
        case "edit":
          return Boolean(perm.can_edit);
        case "delete":
          return Boolean(perm.can_delete);
        default:
          return Boolean(perm.can_view);
      }
    },
    [user, permissions, featureStatus]
  );

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        permissions,
        featureStatus,
        hasPermission,
        refreshPermissions: fetchPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}