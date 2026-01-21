import { Box } from "@mui/material";
import LoginCard from "../components/LoginCard";

export default function Login() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#2c3c4d",
        px: 2,
      }}
    >
      <LoginCard />
    </Box>
  );
}
