import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabaseClient";

export const initializeAuth = createAsyncThunk(
  "auth/init",
  async (_, { rejectWithValue }) => {
    try {
      const { data: sessRes, error: sessError } =
        await supabase.auth.getSession();
      if (sessError) throw sessError;

      const user = sessRes?.session.user ?? null;
      if (!user) return { user: null, role: null };

      const { data: prof, error: profErr } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profErr) throw profErr;
      return { user, role: prof?.role ?? null };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // After login, load session + role into Redux
      await dispatch(initializeAuth()).unwrap();
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, role: null, loading: true, error: true },
  reducers: {
    // setUser: (state, action) => {},
    // logOut: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.role = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
