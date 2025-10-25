import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Header, Loader } from "@/components";
import { DeviceRedirector } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider";

const Admin = () => {
  const { auth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return auth.loading && !auth.status ? (
    <div className="min-w-screen min-h-[calc(100vh-64px)] flex items-center justify-center">
      <Loader />
    </div>
  ) : (
    <div id="admin">
      <DeviceRedirector />
      <Header />
      <Outlet />
    </div>
  );
};

export default Admin;
