import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";

const Root = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { auth } = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (auth.status === false && location.pathname.startsWith("/admin")) {
      navigate("/auth/login");
      return;
    }
    if (auth.user.isSystemGeneratedPassword) {
      navigate("/auth/change-password");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.status]);

  return <Outlet />;
};

export default Root;
