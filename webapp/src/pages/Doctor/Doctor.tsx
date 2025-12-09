import { Header } from "@/components";
import { Outlet } from "react-router-dom";

const Doctor = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Doctor;
