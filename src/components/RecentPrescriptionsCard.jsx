import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function RecentPrescriptionsCard({ items, onViewAll }) {
  return (
    <Card className="rounded-2xl shadow-2xl h-full">
      <CardContent>
        <Typography className="font-semibold mb-3">
          Recent Prescriptions
        </Typography>

        <Box className="space-y-2">
          {items.map((m, idx) => (
            <Box key={idx} className="flex items-start gap-2">
              <span className="mt-[7px] h-2 w-2 rounded-full bg-slate-400" />
              <Typography variant="body2">{m}</Typography>
            </Box>
          ))}
        </Box>

        <Box className="mt-3">
          <Button
            size="small"
            endIcon={<ChevronRightIcon />}
            onClick={onViewAll}
            className="px-0"
          >
            View All
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
