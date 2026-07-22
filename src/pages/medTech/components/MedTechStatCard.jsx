import { Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";

export default function MedTechStatCard({
  title,
  value,
  icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-700",
  loading = false,
}) {
  return (
    <Card className="w-full">
      <CardContent className={`flex items-center gap-4 shadow-2xl ${iconBg}`}>
        <Box className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={20} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h5" className="font-bold">
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
