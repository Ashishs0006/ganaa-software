import React, { createContext, useContext, useState, useEffect } from "react";

import { me } from "@/apis";
import { Loader } from "@/components";
import { IAuthState, AuthContextType } from "@/context/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<IAuthState>({
    loading: true,
    status: null,
    user: {
      _id: "",
      centerId: [
        {
          _id: "",
          centerName: "",
          googleMapLink: "",
          centerUID: "",
          createdAt: ""
        }
      ],
      roleId: { _id: "", name: "", permissions: [] },
      firstName: "",
      lastName: "",
      dob: "",
      email: "",
      gender: "",
      isEmailVerified: false,
      isSystemGeneratedPassword: false,
      createdAt: "",
      profilePic: ""
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAuth((prev) => ({
          ...prev,
          status: false,
          loading: false
        }));
        return;
      }

      try {
        const { data: response } = await me();
        setAuth({
          status: true,
          user: response.data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAuth((prev) => ({
          ...prev,
          status: false,
          loading: false
        }));
      }
    };

    checkAuth();
  }, []);

  const hasAccess = (resource: string, action: string = "read") => {
    if (auth.loading || !auth.status || !auth.user.roleId.permissions) return false;

    return auth.user.roleId.permissions.some(
      (p) =>
        (p.resource === resource || p.resource === "*") &&
        (p.actions.includes(action) || p.actions.includes("*"))
    );
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuth({
      loading: true,
      status: null,
      user: {
        _id: "",
        centerId: [
          {
            _id: "",
            centerName: "",
            googleMapLink: "",
            centerUID: "",
            createdAt: ""
          }
        ],
        roleId: { _id: "", name: "", permissions: [] },
        firstName: "",
        lastName: "",
        dob: "",
        email: "",
        gender: "",
        isEmailVerified: false,
        isSystemGeneratedPassword: false,
        createdAt: "",
        profilePic: ""
      }
    });
    window.location.href = "/";
  };

  // Delay rendering children until auth check is complete
  if (auth.loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center">
        {/* <p className="text-center font-medium text-lg mb-2">Authenticating . . .</p> */}
        <Loader color="primary" size="sm" />
      </div>
    ); // Replace with a spinner if you have one
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, hasAccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
