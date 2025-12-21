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

export interface IDoctor {
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

interface IDoctorState {
  loading: boolean;
  data: IDoctor[];
  pagination: IPagination;
}

const initialState: IDoctorState = {
  loading: true,
  data: [],
  pagination: {
    page: 1,
    limit: 300,
    totalDocuments: 0,
    totalPages: 0
  }
};

const doctorReferralSlice = createSlice({
  name: "doctorReferralSlice",
  initialState,
  reducers: {
    setDoctorReferral(state, action: PayloadAction<{ data: IDoctor[]; pagination: IPagination }>) {
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    resetDoctorReferral(state) {
      state.data = initialState.data;
      state.pagination = initialState.pagination;
    }
  }
});

export const { setDoctorReferral,resetDoctorReferral } = doctorReferralSlice.actions;

export default doctorReferralSlice.reducer;
