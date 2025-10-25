// routes/router.tsx
import { createBrowserRouter } from "react-router-dom";

import { RouteItem } from "@/router/type";
import { routes } from "@/router/routeConfig";
import { ProtectedRoute } from "@/router/ProtectedRoute";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapProtectedRoutes = (routes: RouteItem[]): any[] =>
  routes.map(({ path, element, resource, children }) => ({
    path,
    element: resource ? <ProtectedRoute resource={resource}>{element}</ProtectedRoute> : element,
    ...(children ? { children: wrapProtectedRoutes(children) } : {})
  }));

const router = createBrowserRouter(wrapProtectedRoutes(routes));

export default router;
