import { Paper, Box } from "@mui/material";
import Logo from "./Logo";
import LoginForm from "./forms/LoginForm";

export default function LoginCard() {
  return (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        width: "100%",
        maxWidth: 420,
        borderRadius: 3,
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Logo />
        <LoginForm />
      </Box>
    </Paper>
  );
}
