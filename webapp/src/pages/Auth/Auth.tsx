import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/admin");
    }
  }, []);

  return <Outlet />;
};

export default Auth;
