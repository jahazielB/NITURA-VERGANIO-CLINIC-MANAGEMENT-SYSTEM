import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import patientsSlice from "./patientSlice";
import patientProfileSlice from "./patientProfileSlice";
export const store = configureStore({
  reducer: {
    auth: authSlice,
    patients: patientsSlice,
    patientProfile: patientProfileSlice,
  },
});
