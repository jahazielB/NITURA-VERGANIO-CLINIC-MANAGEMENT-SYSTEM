import { Card, CardContent, Typography, Box } from "@mui/material";

export default function DoctorStatCard({
  title,
  value,
  icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}) {
  return (
    <Card className="w-full">
      <CardContent className={`flex items-center gap-4 shadow-2xl ${iconBg}`}>
        <Box className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>{icon}</Box>

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
