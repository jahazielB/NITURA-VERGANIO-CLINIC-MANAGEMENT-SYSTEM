import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import patientsSlice from "./patientSlice";
export const store = configureStore({
  reducer: {
    auth: authSlice,
    patients: patientsSlice,
  },
});
