import { Box, Button, Card, Typography, Divider } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRef, useState, useEffect } from "react";

export default function RecentPrescriptionsCard({
  items,
  onViewAll,
  maxHeight = 160,
}) {
  const latestPrescription = items
    ?.flatMap((v) => v.prescription_orders || [])
    ?.reduce(
      (latest, current) =>
        !latest || new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest,
      null,
    );

  const prescriptionItems = latestPrescription?.prescription_items || [];
  const scrollRef = useRef();

  return (
    <Card elevation={0} className="rounded-xl border border-gray-200 bg-white">
      <Box className="p-2.5 flex flex-col gap-2">
        {/* Compact Header */}
        <Typography className="font-bold text-gray-900 text-[13px] px-1">
          Recent Prescriptions
        </Typography>

        {/* Dense List */}
        <Box
          ref={scrollRef}
          className="overflow-y-auto pr-1"
          style={{ maxHeight, scrollBehavior: "smooth" }}
        >
          {prescriptionItems.length > 0 ? (
            <Box className="flex flex-col ">
              {prescriptionItems.map((m) => (
                <Box
                  key={m.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50"
                >
                  <Box className="flex flex-col overflow-hidden">
                    <Typography
                      sx={{ fontSize: "17px", lineHeight: 1.2 }}
                      className="font-semibold text-gray-800 text-[10px] truncate"
                    >
                      {m.medication}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "14px", lineHeight: 1.2 }}
                      className="text-gray-500 text-[9px]"
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

        {/* Footer */}
        <Divider />
        <Button
          onClick={onViewAll}
          fullWidth
          size="small"
          className="text-blue-600 font-bold text-[11px] py-0 hover:bg-blue-50"
          endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}
