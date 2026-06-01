import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabaseClient";

const formatBirthDate = (value) => {
  if (!value) return null;

  if (typeof value?.format === "function") {
    return value.format("YYYY-MM-DD");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeName = (value) => (value || "").trim().toLowerCase();

async function findDuplicatePatient({
  firstName,
  middleName,
  lastName,
  birthDate,
  excludeId = null,
}) {
  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, middle_name, last_name, birth_date")
    .eq("birth_date", birthDate);

  if (error) throw error;

  return (data ?? []).find((patient) => {
    if (excludeId && patient.id === excludeId) {
      return false;
    }

    return (
      normalizeName(patient.first_name) === firstName &&
      normalizeName(patient.middle_name) === middleName &&
      normalizeName(patient.last_name) === lastName
    );
  });
}

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async ({ page, rowsPerPage, search }, { rejectWithValue }) => {
    try {
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;

      let query = supabase
        .from("patients")
        .select(`*`, { count: "exact" })
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
      const middleName = (form.middleName || "").trim();
      const lastName = (form.lastName || "").trim();
      const contact = (form.contact || "").trim();
      const address = (form.address || "").trim();
      const date = form.dateOfBirth;
      const birthDate = formatBirthDate(date);
      const normalizedFirstName = normalizeName(firstName);
      const normalizedMiddleName = normalizeName(middleName);
      const normalizedLastName = normalizeName(lastName);

      if (!firstName || !lastName || !middleName) {
        throw new Error("First name, last name, and middle name are required.");
      }
      if (!date || !birthDate) throw new Error("Birthday is required!");

      const duplicate = await findDuplicatePatient({
        firstName: normalizedFirstName,
        middleName: normalizedMiddleName,
        lastName: normalizedLastName,
        birthDate,
      });

      if (duplicate) {
        throw new Error(
          "Duplicate patient found. Full name and birth date must be unique.",
        );
      }

      const payload = {
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        contact_number: contact,
        gender: form.gender || null,
        birth_date: birthDate,
        address: address,
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
export const editPatient = createAsyncThunk(
  "patients/editPatient",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      // ✅ trim + validate
      const firstName = (updatedData.firstName || "").trim();
      const middleName = (updatedData.middleName || "").trim();
      const lastName = (updatedData.lastName || "").trim();
      const contact = (updatedData.contact || "").trim();
      const address = (updatedData.address || "").trim();
      const gender = updatedData.gender || null;
      const date = updatedData.dateOfBirth;
      const birthDate = formatBirthDate(date);
      const normalizedFirstName = normalizeName(firstName);
      const normalizedMiddleName = normalizeName(middleName);
      const normalizedLastName = normalizeName(lastName);

      if (!firstName || !lastName || !middleName) {
        throw new Error("First name, last name, and middle name are required.");
      }

      if (!date || !birthDate) throw new Error("Birthday is required!");

      const duplicate = await findDuplicatePatient({
        firstName: normalizedFirstName,
        middleName: normalizedMiddleName,
        lastName: normalizedLastName,
        birthDate,
        excludeId: id,
      });

      if (duplicate) {
        throw new Error(
          "Duplicate patient found. Full name and birth date must be unique.",
        );
      }

      const updatedPayload = {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        contact_number: contact,
        address: address,
        gender: gender,
        birth_date: birthDate,
      };
      const { data, error } = await supabase
        .from("patients")
        .update(updatedPayload)
        .eq("id", id)
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
    total: 0,
    loading: false,
    adding: false,
    updating: false,
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
      })
      //edit
      .addCase(editPatient.pending, (state) => {
        state.updating = true;
      })
      .addCase(editPatient.fulfilled, (state, action) => {
        state.updating = false;

        const index = state.rows.findIndex((p) => p.id === action.payload.id);

        if (index !== -1) {
          state.rows[index] = action.payload;
        }
      })
      .addCase(editPatient.rejected, (state) => {
        state.updating = false;
      });
  },
});

export default patientsSlice.reducer;
