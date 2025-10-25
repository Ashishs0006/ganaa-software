import React, { useContext, useEffect, useRef, useState } from "react";
import { DeviceContext } from "@/context/DeviceContext";
import { useLocation, useNavigate } from "react-router-dom";

const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();

  return <DeviceContext.Provider value={[isMobile, () => {}]}>{children}</DeviceContext.Provider>;
};

export default DeviceProvider;

export const DeviceRedirector = () => {
  const [isMobile] = useContext(DeviceContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Store the last valid non-mobile path
  const lastValidPath = useRef<string | null>(null);

  useEffect(() => {
    const isOnInvalidPage = location.pathname === "/InValid";

    if (isMobile && !isOnInvalidPage) {
      // Save the current path before redirecting to /InValid
      lastValidPath.current = location.pathname;
      navigate("/InValid");
    } else if (!isMobile && isOnInvalidPage) {
      // Redirect back to previous path if it exists, or default to "/"
      navigate(lastValidPath.current || "/");
    }
  }, [isMobile, location.pathname]);

  return null;
};


// hooks/useIsMobile.ts

const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};
