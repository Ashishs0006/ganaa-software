import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Loader } from "@/components";
import { useAuth } from "@/providers/AuthProvider";

const Home = () => {
  const navigate = useNavigate();

  const { auth } = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (auth.status === false) navigate("/auth/login");
    if (auth.status === true) navigate("/admin");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center">
      <p className="text-center font-medium text-lg mb-2">Authenticating . . .</p>
      <Loader color="primary" size="sm" />
    </div>
  );
};

export default Home;
