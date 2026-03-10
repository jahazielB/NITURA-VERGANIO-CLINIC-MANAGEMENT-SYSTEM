import {
  Card,
  Typography,
  Stack,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SoapSection({ soapNotes, setSoapNotes, mode }) {
  const isEdit = mode === "edit";

  // Handle field changes
  const handleChange = (index, field, value) => {
    const updated = [...soapNotes];
    updated[index][field] = value;
    setSoapNotes(updated);
  };

  // Add new SOAP note
  const handleAdd = () => {
    setSoapNotes([
      ...soapNotes,
      {
        id: Date.now(),
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      },
    ]);
  };

  // Delete SOAP note
  const handleDelete = (index) => {
    const updated = soapNotes.filter((_, i) => i !== index);
    setSoapNotes(updated);
  };

  return (
    <Card className="rounded-2xl p-4 shadow-sm">
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <DescriptionIcon fontSize="small" color="primary" />
        <Typography fontWeight={600} flexGrow={1}>
          SOAP Notes
        </Typography>
      </Box>

      <Stack spacing={3} maxHeight={400} overflow="auto">
        {soapNotes.length > 0 ? (
          soapNotes.map((s, index) => (
            <Box
              key={s.id}
              className="p-3 rounded-xl border bg-gray-50"
              display="flex"
              flexDirection="column"
              gap={1}
            >
              {isEdit ? (
                <>
                  <TextField
                    size="small"
                    label="Subjective"
                    value={s.subjective}
                    onChange={(e) =>
                      handleChange(index, "subjective", e.target.value)
                    }
                  />
                  <TextField
                    size="small"
                    label="Objective"
                    value={s.objective}
                    onChange={(e) =>
                      handleChange(index, "objective", e.target.value)
                    }
                  />
                  <TextField
                    size="small"
                    label="Assessment"
                    value={s.assessment}
                    onChange={(e) =>
                      handleChange(index, "assessment", e.target.value)
                    }
                  />
                  <TextField
                    size="small"
                    label="Plan"
                    value={s.plan}
                    onChange={(e) =>
                      handleChange(index, "plan", e.target.value)
                    }
                  />
                </>
              ) : (
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <b>S:</b> {s.subjective}
                  </Typography>
                  <Typography variant="body2">
                    <b>O:</b> {s.objective}
                  </Typography>
                  <Typography variant="body2">
                    <b>A:</b> {s.assessment}
                  </Typography>
                  <Typography variant="body2">
                    <b>P:</b> {s.plan}
                  </Typography>
                </Stack>
              )}
            </Box>
          ))
        ) : (
          <Typography className="text-gray-400 italic">
            No SOAP recorded
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
