import { Box, Button, TextField, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import CustomSnackbar from "../modals/CustomSnackBar";
export default function LoginForm() {
  const [loginCredentials, setLoginCredentials] = useState({
    Email: "",
    Password: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      const message =
        typeof e === "string"
          ? e
          : e?.message || "Unable to sign in. Please contact an administrator.";
      console.error(message);
      setSnackbar({
        open: true,
        message,
        severity: "error",
      });
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

      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
