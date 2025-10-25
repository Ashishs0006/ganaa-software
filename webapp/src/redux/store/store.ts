import { configureStore } from "@reduxjs/toolkit";
import dropdownReducer from "@/redux/slice/dropDown";
import patientReducer from "@/redux/slice/patientSlice";
import stepperReducer from "@/redux/slice/stepperSlice";
import resourcesReducer from "@/redux/slice/resourceSlice";
import noteReducer from "@/redux/slice/noteSlice";
import leadReducer from "@/redux/slice/LeadSlice";
import UserReducer from "@/redux/slice/userSlice";
import rolesReducer from "@/redux/slice/roleSlice";
export const store = configureStore({
  reducer: {
    dropdown: dropdownReducer,
    patient: patientReducer,
    stepper: stepperReducer,
    notes: noteReducer,
    resources: resourcesReducer,
    leads: leadReducer,
    users: UserReducer,
    roles: rolesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
