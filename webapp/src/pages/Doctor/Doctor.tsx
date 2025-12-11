import { Doctor_Header } from "@/components";
import { Outlet } from "react-router-dom";

const Doctor = () => {
   console.log("Rendered Doctor Route");
  return (
    <>
      <Doctor_Header />
      <Outlet />
    </>
  );
};

export default Doctor;
