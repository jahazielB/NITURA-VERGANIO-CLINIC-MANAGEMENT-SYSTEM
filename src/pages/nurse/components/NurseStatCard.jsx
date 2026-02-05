import { Card, CardContent, Typography, Box } from "@mui/material";

export default function NurseStatCard({
  title,
  value,
  icon,
  bg = "bg-blue-100",
  color = "text-blue-700",
}) {
  return (
    <Card>
      <CardContent className={`flex items-center gap-4 shadow-2xl ${bg}`}>
        <Box className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h5" className="font-bold">
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
