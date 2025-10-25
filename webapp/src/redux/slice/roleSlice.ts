import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IRoles } from "./userSlice";
import { IPagination } from "./types";

interface IRolesState {
  loading: boolean;
  data: IRoles[];
  pagination: IPagination;
}

const initialState: IRolesState = {
  loading: true,
  data: [],
  pagination: {
    page: 1,
    limit: 300,
    totalDocuments: 0,
    totalPages: 0
  }
};

const rolesSlice = createSlice({
  name: "roleSlice",
  initialState,
  reducers: {
    setRoles(state, action: PayloadAction<{ data: IRoles[]; pagination: IPagination }>) {
      state.data = action.payload.data;
      state.loading = false;
    }
  }
});

export const { setRoles } = rolesSlice.actions;

export default rolesSlice.reducer;
