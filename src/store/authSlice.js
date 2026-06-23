import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabaseClient";
import {
  markUserLoggedIn,
  markUserLoggedOut,
  signIn,
  signOut,
} from "../auth/auth";

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
        .select("role,full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profErr) throw profErr;

      return { user, role: prof?.role ?? null, userName: prof.full_name };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const data = await signIn(email, password);
      const userId = data?.user?.id ?? data?.session?.user?.id;

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("is_active, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.is_active === false) {
        // Disabled users are signed out immediately so they cannot continue
        // into the app with a valid Supabase session.
        await supabase.auth.signOut();
        dispatch(clearAuthState());
        throw new Error(
          "This account has been disabled. Please contact an administrator.",
        );
      }

      // Track this login session after auth succeeds without changing the
      // existing sign-in flow or blocking the user if profile tracking fails.
      const sessionId =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      if (userId) {
        await markUserLoggedIn(userId, sessionId);
      }

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
      // Clear the profile session marker before signing out so the account
      // information reflects the logout immediately.
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (userId) {
        await markUserLoggedOut(userId);
      }

      await signOut();
      return true;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,
    userName: null,
    loading: true,
    error: true,
  },
  reducers: {
    clearAuthState: (state) => {
      state.user = null;
      state.role = null;
      state.userName = null;
      state.loading = false;
      state.error = null;
    },
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
        state.userName = action.payload.userName;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.role = null;
        state.userName = null;
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

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
