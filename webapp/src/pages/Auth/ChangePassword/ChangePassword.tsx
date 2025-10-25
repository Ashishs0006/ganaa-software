import { SyntheticEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

import { changePassword } from "@/apis";
import { Button, Input, Loader } from "@/components";

import bgImage from "@/assets/images/bgImagePassword.png";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: false,
    showPassword: {
      oldPassword: false,
      password: false,
      confirmPassword: false
    }
  });

  const [data, setdata] = useState({ oldPassword: "", password: "", confirmPassword: "" });

  const handleChange = useCallback((e: SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setdata((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleShow = (_e: SyntheticEvent, field: keyof typeof state.showPassword) => {
    setState((prev) => ({
      ...prev,
      showPassword: {
        ...prev.showPassword,
        [field]: !prev.showPassword[field]
      }
    }));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      setState((prev) => ({ ...prev, loading: true }));
      if (data.confirmPassword == data.password) {
        const response = await changePassword({
          oldPassword: data.oldPassword,
          newPassword: data.confirmPassword
        });
        if (response.data.status == "success") {
          setState((prev) => ({ ...prev, loading: false }));
          toast.success("Updated Successfully");
          localStorage.clear();
          navigate("/auth/login");
        }
      } else {
        toast.error("Password Doesn't Match");
        setState((prev) => ({ ...prev, loading: false }));
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
        <div className="logo flex items-center ">
          {/* <img className="w-36" alt="logo" src={logo} /> */}
          <div className="text-left text-xl font-bold">Change Password</div>
        </div>

        <div className="w-full mt-4">
          <div className="w-full relative">
            <Input
              id="Old Password"
              label="Old Password"
              placeholder="Enter old password"
              name="oldPassword"
              type={state.showPassword.oldPassword ? "text" : "password"}
              required
              value={data.oldPassword}
              onChange={handleChange}
            />
            {!state.showPassword.oldPassword ? (
              <FaRegEyeSlash
                onClick={(e) => handleShow(e, "oldPassword")}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            ) : (
              <FaRegEye
                onClick={(e) => handleShow(e, "oldPassword")}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            )}
          </div>

          <div className="w-full relative">
            <Input
              labelClassName="mt-4"
              id="New Password"
              label="New Password"
              placeholder="Enter new password"
              name="password"
              type={state.showPassword.password ? "text" : "password"}
              required
              value={data.password}
              onChange={handleChange}
            />
            {!state.showPassword.password ? (
              <FaRegEyeSlash
                onClick={(e) => handleShow(e, "password")}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            ) : (
              <FaRegEye
                onClick={(e) => handleShow(e, "password")}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            )}
          </div>

          <div className="w-full relative">
            <Input
              id="password"
              containerClass="mt-6"
              label="Confirm Password"
              placeholder="Confirm password"
              name="confirmPassword"
              type={state.showPassword.confirmPassword ? "text" : "password"}
              required
              value={data.confirmPassword}
              onChange={handleChange}
            />
            {!state.showPassword.confirmPassword ? (
              <FaRegEyeSlash
                onClick={(e) => handleShow(e, "confirmPassword")}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            ) : (
              <FaRegEye
                onClick={(e) => handleShow(e, "confirmPassword")}
                className="absolute right-[5%] bottom-[20%] cursor-pointer"
                size={20}
              />
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="mt-6 w-full"
            variant="contained"
            size="md"
            disabled={state.loading}
          >
            Submit {state.loading && <Loader size="xs" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
