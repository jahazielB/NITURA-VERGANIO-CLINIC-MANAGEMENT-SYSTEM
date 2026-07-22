import {
  ArrowForwardRounded,
  CheckCircleRounded,
  HourglassTopRounded,
  PendingActionsRounded,
  ScienceRounded,
} from "@mui/icons-material";
import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";

const actions = [
  {
    title: "Open Laboratory Worklist",
    description: "Go straight to the live request queue.",
    icon: ScienceRounded,
    keyName: "worklist",
  },
  {
    title: "Pending Requests",
    description: "Review unprocessed specimens.",
    icon: PendingActionsRounded,
    keyName: "Pending",
  },
  {
    title: "Processing Queue",
    description: "Track samples currently being worked on.",
    icon: HourglassTopRounded,
    keyName: "Processing",
  },
  {
    title: "Ready For Release",
    description: "Open results waiting for release.",
    icon: CheckCircleRounded,
    keyName: "Ready",
  },
  {
    title: "Released Results",
    description: "View completed and released lab work.",
    icon: ArrowForwardRounded,
    keyName: "Released",
  },
];

export default function MedTechQuickActions({
  onGoWorklist,
  onGoStatus,
}) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <CardContent className="space-y-4">
        <Box>
          <Typography variant="h6" className="font-bold">
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Workflow shortcuts for the lab team.
          </Typography>
        </Box>

        <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const handleClick =
              action.keyName === "worklist"
                ? onGoWorklist
                : () => onGoStatus?.(action.keyName);

            return (
              <Card
                key={action.keyName}
                variant="outlined"
                className="rounded-2xl border-slate-200 hover:border-slate-300 transition"
              >
                <CardActionArea
                  onClick={handleClick}
                  className="h-full"
                  sx={{ height: "100%", alignItems: "stretch" }}
                >
                  <CardContent className="h-full flex flex-col gap-3">
                    <Box className="flex items-start justify-between gap-3">
                      <Box className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                        <Icon />
                      </Box>
                    </Box>
                    <Box className="space-y-1">
                      <Typography variant="subtitle2" className="font-semibold">
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
