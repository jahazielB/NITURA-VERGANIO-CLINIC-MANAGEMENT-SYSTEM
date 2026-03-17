import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabaseClient";

export const fetchPatientProfile = createAsyncThunk(
  "patientProfile/fetchPatientProfile",
  async (id, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          *,
          visits (
            *,
            doctor:user_profiles (
              id,
              full_name
            ),
            vitals(*,
        taken_by_user:user_profiles (
          id,
          full_name
        )),
            soap_notes(*),
            lab_requests(
              *,
              lab_result_items(*),
              lab_services(*)
            ),
            prescription_orders(
              *,
              prescription_items(*)
            ),
            billings(
              *,
              billing_items(*),
              payments(*)
            )
          )
        `,
        )
        .eq("id", id)
        .order("created_at", { foreignTable: "visits", ascending: false })
        .single();

      if (error) throw error;

      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const patientProfileSlice = createSlice({
  name: "patientProfile",
  initialState: {
    patientInfo: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPatientProfile: (state) => {
      state.patientInfo = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.patientInfo = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load patient profile";
      });
  },
});

export const { clearPatientProfile } = patientProfileSlice.actions;

export default patientProfileSlice.reducer;
