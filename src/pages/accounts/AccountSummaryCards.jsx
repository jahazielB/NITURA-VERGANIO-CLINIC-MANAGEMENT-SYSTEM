import { Card, CardContent, Typography, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

export default function AccountsSummaryCards({ total, active, disabled }) {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Staff
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {total}
            </Typography>
          </Box>
          <PeopleIcon />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {active}
            </Typography>
          </Box>
          <CheckCircleIcon />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Disabled
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {disabled}
            </Typography>
          </Box>
          <BlockIcon />
        </CardContent>
      </Card>
    </Box>
  );
}
