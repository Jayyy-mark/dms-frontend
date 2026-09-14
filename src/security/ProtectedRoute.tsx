import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: string[];
}) {
  const { user, loading } = useAuth();

  // 🔥 IMPORTANT: wait until auth check finishes
  if (loading) return null; // or spinner

  if (!user) return <Navigate to="/signin" replace />;

  if (roles && !roles.includes(user.role)) {
    
    if (user.role == "user") {
      return <Navigate to="/documents/" replace />
    }
    return <Navigate to="/404" replace />;
  }

  return children;
}