import { SyntheticEvent, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

import { login } from "@/apis";
import { Button, Input, Loader } from "@/components";

import bgImage from "@/assets/images/login-bg.png";
import logo from "@/assets/images/logo.png";
import { DeviceContext } from "@/context/DeviceContext";
import { useAuth } from "@/providers/AuthProvider";
import { IUser } from "@/context/types";
import { RESOURCES } from "@/constants/resources";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [isMobile, _setIsMobile] = useContext(DeviceContext);

  const [state, setState] = useState({ loading: false, show: false });

  const [data, setdata] = useState({ email: "", password: "" });

  const handleChange = useCallback((e: SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setdata((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleShow = (_e: SyntheticEvent) => {
    setState((prev) => ({ ...prev, show: !state.show }));
  };

  const resolveDashboard = (user: IUser) => {
    const accessible = user?.roleId?.permissions?.map((p) => p.resource);

    // if (accessible && accessible.includes(RESOURCES.DASHBOARD)) return "/dashboard";
    if (accessible && accessible.includes(RESOURCES.FAMILY_PORTAL)) return "/family/family-portal";
    return "/admin";
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data: response } = await login(data);

      localStorage.setItem("authToken", response.token);

      setAuth((prev) => ({ ...prev, status: true, loading: false, user: response.data }));
      setState((prev) => ({ ...prev, loading: false }));

      if (response.data.isSystemGeneratedPassword) {
        navigate("/auth/change-password");
      } else if (response.data.roleId.name == "Admin" && isMobile) {
        navigate("/invalid");
      } else {
        navigate(resolveDashboard(response.data));
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Something went wrong");
      }
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div
      id="login-page"
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-2 sm:p-0"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-sm w-full bg-white rounded-lg shadow-sm p-6 md:p-10">
        <div className="logo flex items-center justify-center">
          <img className="w-36" alt="logo" src={logo} />
        </div>

        <form className="w-full mt-8" onSubmit={handleSubmit} noValidate>
          {/* <h3 className="font-bold text-center mb-5 text-xl">Login to View Patient Details</h3> */}
          <Input
            id="email"
            label="Email"
            placeholder="Enter email address"
            name="email"
            type="email"
            required
            value={data.email}
            onChange={handleChange}
          />
          <div className="w-full relative">
            <Input
              id="password"
              containerClass="mt-6"
              label="Password"
              placeholder="Enter password"
              name="password"
              type={state.show ? "Text" : "password"}
              required
              value={data.password}
              onChange={handleChange}
            />
            {state.show ? (
              <FaRegEyeSlash
                onClick={handleShow}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            ) : (
              <FaRegEye
                onClick={handleShow}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            )}
          </div>

          <Button className="mt-6 w-full" variant="contained" size="md" disabled={state.loading}>
            Login {state.loading && <Loader size="xs" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
