import { Box } from "@mui/material";
import logo from "../assets/NV-logo.png";

export default function Logo() {
  return (
    <Box
      component="img"
      src={logo}
      alt="Clinic Logo"
      sx={{
        width: 120,
        height: "auto",
        mb: 2,
      }}
    />
  );
}
