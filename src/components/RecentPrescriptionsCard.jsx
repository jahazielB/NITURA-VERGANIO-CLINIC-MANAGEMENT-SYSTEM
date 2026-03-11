import { Box, Button, Card, Typography, Divider } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRef } from "react";
import { getLatestRecord } from "./helpers/getLatestRecord";
import { useSelector } from "react-redux";

export default function RecentPrescriptionsCard({
  onViewAll,
  maxHeight = 160,
}) {
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const visit = patientInfo?.visits;
  const latestPrescription = getLatestRecord(visit, "prescription_orders");

  const prescriptionItems = latestPrescription?.prescription_items || [];
  const scrollRef = useRef();

  const visibleItems = prescriptionItems.slice(0, 5);
  const hasOverflow = prescriptionItems.length > 5;

  return (
    <Card elevation={0} className="rounded-xl border border-gray-200 bg-white">
      <Box className="p-2.5 flex flex-col gap-2">
        {/* Header */}
        <Typography className="font-bold text-gray-900 text-[13px] px-1">
          Recent Prescriptions
        </Typography>

        {/* List Container */}
        <Box className="relative">
          <Box
            ref={scrollRef}
            className={`${hasOverflow ? "overflow-y-auto pr-1" : ""}`}
            style={hasOverflow ? { maxHeight, scrollBehavior: "smooth" } : {}}
          >
            {visibleItems.length > 0 ? (
              <Box className="flex flex-col">
                {visibleItems.map((m) => (
                  <Box
                    key={m.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50"
                  >
                    <Box className="flex flex-col overflow-hidden">
                      <Typography
                        sx={{ fontSize: "13px", lineHeight: 1.2 }}
                        className="font-semibold text-gray-800 truncate"
                      >
                        {m.medication}
                      </Typography>

                      <Typography
                        sx={{ fontSize: "11px", lineHeight: 1.2 }}
                        className="text-gray-500"
                      >
                        {m.dosage} • {m.frequency}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography className="text-gray-400 text-[11px] p-2 italic">
                No active prescriptions
              </Typography>
            )}
          </Box>

          {/* Gradient Fade */}
          {hasOverflow && (
            <Box className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
          )}
        </Box>

        {/* Footer */}
        <Divider />

        <div className="self-start">
          <Button
            onClick={() => onViewAll()}
            variant="contained"
            size="small"
            className="text-blue-600 font-bold text-[11px] py-0 hover:bg-blue-50"
            endIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
          >
            View All Prescriptions
          </Button>
        </div>
      </Box>
    </Card>
  );
}
