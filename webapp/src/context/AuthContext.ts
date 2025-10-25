import React from "react";

import { IAuthContext } from "@/context/types";

export const AuthContext = React.createContext<[IAuthContext["auth"], IAuthContext["setAuth"]]>([
  {
    loading: true,
    status: null,
    user: {
      centerId:[ {
        _id: "",
        centerName: "",
        googleMapLink: "",
        centerUID: "",
        createdAt: ""
      }],
      _id: "",
      roleId: { _id: "", name: "", permissions: [{ resource: "", actions: [""] }] },

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
  },
  () => {}
]);
