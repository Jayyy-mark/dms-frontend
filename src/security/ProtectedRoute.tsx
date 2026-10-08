import { Navigate } from "react-router";
import { useAuth, PermissionAction } from "../context/AuthContext";
import { JSX } from "react";

export default function ProtectedRoute({
  children,
  roles,
  feature,
  action = "view",
}: {
  children: JSX.Element;
  roles?: string[];
  feature?: string;
  action?: PermissionAction;
}) {
  const { user, loading, hasPermission } = useAuth();

  // Wait until auth check finishes
  if (loading) return null;

  if (!user) return <Navigate to="/signin" replace />;

  // 1. Role-based check (if explicitly supplied)
  if (roles && !roles.includes(user.role)) {
    if (user.role === "user") {
      return <Navigate to="/documents/" replace />;
    }
    return <Navigate to="/404" replace />;
  }

  // 2. Dynamic permission & module enablement check based on UserRolePermission
  if (feature) {
    if (!hasPermission(feature, action)) {
      if (user.role === "user") {
        return <Navigate to="/documents/" replace />;
      }
      return <Navigate to="/404" replace />;
    }
  }

  return children;
}