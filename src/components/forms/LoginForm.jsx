import { Box, Button, TextField, Typography } from "@mui/material";

import { data, useNavigate } from "react-router-dom";
import { signIn } from "../../auth/auth";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { Email, Password } from "@mui/icons-material";
export default function LoginForm() {
  const [loginCredentials, setLoginCredentials] = useState({
    Email: "",
    Password: "",
  });
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      await signIn(loginCredentials.Email, loginCredentials.Password);

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;

      const { data: prof, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!prof?.role) throw new Error("No role assigned to this account");

      const role = prof.role;
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (e) {
      alert(e.message);
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
