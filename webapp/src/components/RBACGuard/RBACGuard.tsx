import { useAuth } from "@/providers/AuthProvider";
import { IRBACGUARD } from "@/components/RBACGuard/type";

export const RBACGuard = ({ resource, action = "*", children }: IRBACGUARD) => {
  const { hasAccess } = useAuth();
  return hasAccess(resource, action) ? children : null;
};
