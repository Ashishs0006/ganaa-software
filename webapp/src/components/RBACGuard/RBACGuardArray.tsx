import { useAuth } from "@/providers/AuthProvider";
import { IRBACGUARDARRAY } from "./type";

export const RBACGuardArray = ({ resource, children }: IRBACGUARDARRAY) => {
  const { hasAccess } = useAuth();

  const canAccess = resource.some(({ resource, action }) => hasAccess(resource, action));

  return canAccess ? children : null;
};
