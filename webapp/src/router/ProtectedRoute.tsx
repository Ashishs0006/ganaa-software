import { Navigate } from "react-router-dom";

import { Props } from "@/router/type";
import { useAuth } from "@/providers/AuthProvider";

export const ProtectedRoute = ({ resource, action = "read", children }: Props) => {
  const { auth, hasAccess } = useAuth();

  const canAccess = hasAccess(resource, action);
  if (!canAccess && auth.user.roleId.permissions) {
    const isFamilyAccess = auth.user.roleId.permissions.some((p) => p.resource === "Family Portal");
    let redirectTo = "/admin";
    if (isFamilyAccess) {
      redirectTo = "/family/family-portal";
    }
    return <Navigate to={redirectTo} replace />;
  }
  return hasAccess(resource, action) ? children : <Navigate to="/no-access" replace />;
};
