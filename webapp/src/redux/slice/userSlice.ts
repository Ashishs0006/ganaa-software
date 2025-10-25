import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPagination } from "./types";

type IGender = "Male" | "Female" | "Other" | "";

interface ICenter {
  _id?: string;
  centerName?: string;
  googleMapLink?: string;
  centerUID?: string;
}

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IRoles {
  _id?: string;
  name?: string;
  permissions?: IPermission[];
}

export interface IUser {
  _id?: string;
  roleId?: IRoles;
  centerId: ICenter[];
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  password?: string;
  gender?: IGender;
  profilePic?: string;
  isDeleted?: boolean;
}

interface IUserState {
  loading: boolean;
  data: IUser[];
  pagination: IPagination;
}

const initialState: IUserState = {
  loading: true,
  data: [],
  pagination: {
    page: 1,
    limit: 300,
    totalDocuments: 0,
    totalPages: 0
  }
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<{ data: IUser[]; pagination: IPagination }>) {
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    resetUser(state) {
      state.data = initialState.data;
      state.pagination = initialState.pagination;
    }
  }
});

export const { setUsers,resetUser } = userSlice.actions;

export default userSlice.reducer;
