import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabaseClient";

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async ({ page, rowsPerPage, search }, { rejectWithValue }) => {
    try {
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;

      let query = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search?.trim()) {
        const value = search.trim();

        query = query.or(
          `first_name.ilike.%${value}%,last_name.ilike.%${value}%,address.ilike.%${value}%`,
        );
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        rows: data ?? [],
        total: count ?? 0,
      };
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
        address: form.address,
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
export const deletePatient = createAsyncThunk(
  "patients/deletePatient",
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) throw error;

      return id; // return deleted id
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const patientsSlice = createSlice({
  name: "patients",
  initialState: {
    rows: [],
    total: 0,
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
        state.rows = action.payload.rows;
        state.total = action.payload.total;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load patients";
        state.total = 0;
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
      })

      //delete
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;

        // remove deleted patient from state
        state.rows = state.rows.filter(
          (patient) => patient.id !== action.payload,
        );

        // decrease total count
        state.total = state.total - 1;
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete patient";
      });
  },
});

export default patientsSlice.reducer;
