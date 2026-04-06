import { Card, Typography, Stack, Chip, Box, TextField } from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

import { useState } from "react";

export default function VitalsSection({ vitals, setVitals, mode }) {
  const isEdit = mode === "edit";

  // Handler for updating a field
  const handleChange = (index, field, value) => {
    const updated = [...vitals];
    updated[index][field] = value;
    setVitals(updated);
  };

  return (
    <Card className="rounded-2xl p-4 shadow-sm">
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <MonitorHeartIcon fontSize="small" color="error" />
        <Typography fontWeight={600}>Vitals</Typography>
      </Box>

      <Stack spacing={3} maxHeight={200} overflow="auto">
        {vitals.length > 0 ? (
          vitals.map((v, i) => (
            <Box key={i} className="p-3 rounded-xl border bg-gray-50">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {isEdit ? (
                  <>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr 1fr",
                          sm: "repeat(3, 1fr)",
                          md: "repeat(4, 1fr)",
                        },
                        gap: 1, // spacing between fields
                      }}
                    >
                      <TextField
                        size="small"
                        label="Temp (°C)"
                        type="number"
                        inputProps={{ step: "0.01" }}
                        value={v.temperature_c || ""}
                        onChange={(e) =>
                          handleChange(i, "temperature_c", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="BP Systolic"
                        value={v.blood_pressure_sys || ""}
                        onChange={(e) =>
                          handleChange(i, "blood_pressure_sys", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="BP Diastolic"
                        value={v.blood_pressure_dia || ""}
                        onChange={(e) =>
                          handleChange(i, "blood_pressure_dia", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="Pulse"
                        value={v.heart_rate || ""}
                        onChange={(e) =>
                          handleChange(i, "heart_rate", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="Resp Rate"
                        value={v.respiratory_rate || ""}
                        onChange={(e) =>
                          handleChange(i, "respiratory_rate", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="Weight (kg)"
                        value={v.weight_kg || ""}
                        onChange={(e) =>
                          handleChange(i, "weight_kg", e.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="SpO₂"
                        value={v.spo2 || ""}
                        onChange={(e) =>
                          handleChange(i, "spo2", e.target.value)
                        }
                      />
                    </Box>
                  </>
                ) : (
                  <>
                    <Chip label={`Temp: ${v.temperature_c}°C`} size="small" />
                    <Chip
                      label={`BP: ${v.blood_pressure_sys}/${v.blood_pressure_dia}`}
                      size="small"
                    />
                    <Chip label={`Pulse: ${v.heart_rate}`} size="small" />
                    <Chip label={`RR: ${v.respiratory_rate}`} size="small" />
                    <Chip label={`Weight: ${v.weight_kg}kg`} size="small" />
                    <Chip label={`SpO₂: ${v.spo2}`} size="small" />
                    <Chip
                      label={`Recorded: ${new Date(v.taken_at).toLocaleString(
                        [],
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}`}
                      size="small"
                    />
                  </>
                )}
              </Stack>
            </Box>
          ))
        ) : (
          <Typography className="text-gray-400 italic">
            No vitals recorded
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
