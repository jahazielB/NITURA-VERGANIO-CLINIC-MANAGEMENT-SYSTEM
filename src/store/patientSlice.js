import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabaseClient";

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("patients").select("*");

      if (error) throw error;
      return data || [];
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);
export const addPatient = createAsyncThunk(
  "patients/addPatient",
  async (form, { rejectWithValue }) => {
    try {
      // ✅ trim + validate
      const firstName = (form.firstName || "").trim();
      const lastName = (form.lastName || "").trim();
      const contact = (form.contact || "").trim();
      const date = form.dateOfBirth;

      if (!firstName || !lastName || !contact) {
        throw new Error("First name, last name, and contact are required.");
      }

      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        middle_name: form.middleName,
        contact_number: form.contact,
        gender: form.gender || null,
        birth_date: date.$d || null,
      };

      const { data, error } = await supabase
        .from("patients")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const patientsSlice = createSlice({
  name: "patients",
  initialState: {
    rows: [],
    loading: false,
    adding: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load patients";
      })

      // add
      .addCase(addPatient.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addPatient.fulfilled, (state, action) => {
        state.adding = false;
        state.rows = [action.payload, ...state.rows]; // ✅ instant UI update
      })
      .addCase(addPatient.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload || "Failed to add patient";
      });
  },
});

export default patientsSlice.reducer;
