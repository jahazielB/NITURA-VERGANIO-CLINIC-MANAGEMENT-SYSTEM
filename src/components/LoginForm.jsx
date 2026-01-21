import { Box, Button, TextField, Typography } from "@mui/material";

export default function LoginForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to Supabase Auth
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
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
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        required
        margin="normal"
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
