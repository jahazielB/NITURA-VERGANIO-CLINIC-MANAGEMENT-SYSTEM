import {
  Card,
  Typography,
  Stack,
  Chip,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PrescriptionsSection({
  prescriptions,
  setPrescriptions,
  mode,
}) {
  const isEdit = mode === "edit";

  const handleChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleAdd = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: Date.now(),
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
      },
    ]);
  };

  const handleDelete = (index) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updated);
  };

  return (
    <Card className="rounded-2xl p-4 shadow-sm">
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <MedicationIcon fontSize="small" color="success" />
        <Typography fontWeight={600} flexGrow={1}>
          Prescriptions
        </Typography>
        {/* {isEdit && (
          <IconButton size="small" onClick={handleAdd}>
            <AddIcon fontSize="small" />
          </IconButton>
        )} */}
      </Box>

      <Stack spacing={2} maxHeight={400} overflow="auto">
        {prescriptions.length > 0 ? (
          prescriptions.map((p, index) => (
            <Box
              key={p.id}
              className="p-2 rounded-lg border bg-gray-50"
              display="flex"
              alignItems="center"
              gap={1}
              flexWrap="wrap"
            >
              {isEdit ? (
                <>
                  <TextField
                    size="small"
                    label="Medication"
                    value={p.medication}
                    onChange={(e) =>
                      handleChange(index, "medication", e.target.value)
                    }
                    sx={{ minWidth: 150, flexGrow: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Dosage"
                    value={p.dosage}
                    onChange={(e) =>
                      handleChange(index, "dosage", e.target.value)
                    }
                    sx={{ minWidth: 100, flexGrow: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Frequency"
                    value={p.frequency}
                    onChange={(e) =>
                      handleChange(index, "frequency", e.target.value)
                    }
                    sx={{ minWidth: 120, flexGrow: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Instructions"
                    value={p.instructions}
                    onChange={(e) =>
                      handleChange(index, "instructions", e.target.value)
                    }
                    sx={{ minWidth: 120, flexGrow: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Duration"
                    value={p.duration}
                    onChange={(e) =>
                      handleChange(index, "duration", e.target.value)
                    }
                    sx={{ minWidth: 120, flexGrow: 1 }}
                  />
                </>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={p.medication} size="small" color="primary" />
                  <Chip label={p.dosage} size="small" />
                  <Chip label={p.instructions} size="small" />
                  <Chip label={p.frequency} size="small" />
                  {p.duration && <Chip label={p.duration} size="small" />}
                </Stack>
              )}
            </Box>
          ))
        ) : (
          <Typography className="text-gray-400 italic">
            No prescriptions
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
