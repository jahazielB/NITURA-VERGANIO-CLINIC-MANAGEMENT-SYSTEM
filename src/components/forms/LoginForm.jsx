import { Box, Button, TextField, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { signIn } from "../../auth/auth";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
export default function LoginForm() {
  const [loginCredentials, setLoginCredentials] = useState({
    Email: "",
    Password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((s) => s.auth);
  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      await dispatch(
        login({
          email: loginCredentials.Email,
          password: loginCredentials.Password,
        }),
      ).unwrap();
      // const { data: sessRes, error: sessError } =
      //   await supabase.auth.getSession();
      // if (sessError) throw sessError;

      // const user = sessRes?.data.user ?? null;

      navigate(`/`);
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Nitura-Verganio Clinic System
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={1}>
        Please sign in to continue
      </Typography>

      <TextField
        label="Email"
        type="email"
        fullWidth
        required
        margin="normal"
        onChange={(e) =>
          setLoginCredentials((prev) => ({
            ...prev,
            Email: e.target.value,
          }))
        }
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        required
        margin="normal"
        onChange={(e) =>
          setLoginCredentials((prev) => ({
            ...prev,
            Password: e.target.value,
          }))
        }
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 3, py: 1.3 }}
      >
        Login
      </Button>
    </Box>
  );
}
