import { supabase } from "../../lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  IconButton,
  TextField,
  Divider,
  Button,
  duration,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import CloseIcon from "@mui/icons-material/Close";
import clinicHeaderLogo from "../../assets/HEADER-CLINIC.png";

import { getAge } from "../helpers/dateHelper";
import { useSelector, useDispatch } from "react-redux";
import { fullName, upperCaseFirstLetter } from "../helpers/nameHelper";
import { fetchPatientProfile } from "../../store/patientProfileSlice";

import { useParams } from "react-router-dom";

export default function PrescriptionViewModal({
  open,
  onClose,
  item,
  visitLabel,
  setSave,
  saving,
  editing,
  setSnack,
}) {
  const [editForm, setEditForm] = useState([
    {
      id: "",
      medication: "",
      dosage: "",
      frequency: "",
      instructions: "",
      duration: "",
    },
  ]);

  const [editPrescription, setEditPrescription] = useState({});
  const dispatch = useDispatch();
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const data = useMemo(() => item?.resultDetails || {}, [item]);

  const { id } = useParams();

  const patientFullName =
    patientInfo?.first_name + " " + patientInfo?.last_name;
  const prescriptionItems = item?.prescription_items;
  const doctor = item?.doctor;

  useEffect(() => {
    if (!open || !item) return;

    if (!prescriptionItems.length) {
      setEditForm([
        {
          id: "",
          medication: "",
          dosage: "",
          frequency: "",
          instructions: "",
          duration: "",
        },
      ]);
      return;
    }

    setEditForm(
      prescriptionItems.map((p) => ({
        id: p.id ?? "",
        medication: p.medication ?? "",
        dosage: p.dosage ?? "",
        frequency: p.frequency ?? "",
        instructions: p.instructions ?? "",
        duration: p.duration ?? "",
      })),
    );
  }, [open, prescriptionItems]);
  // useEffect(() => {
  //   // console.log("editables: ", editForm, editing);
  //   console.log(prescriptionItems);
  // }, [open]);
  const handleSave = async () => {
    try {
      await Promise.all(
        editForm.map(async (item) => {
          const { data, error } = await supabase
            .from("prescription_items")
            .update({
              medication: item.medication,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
            })
            .eq("id", item.id)
            .select()
            .single();
          if (error) throw error;
        }),
      );
    } catch (e) {
      console.error("error updating: ", e);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          position: "relative",
          width: "95%",
          maxWidth: 850,
          maxHeight: "95vh",
          bgcolor: "white",
          p: 6,
          overflowY: "auto",
          borderRadius: 0,
          outline: "none",
        }}
      >
        {/* Top Utility Bar (Non-Printable) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          sx={{
            borderBottom: "1px solid #eee",
            pb: 1,
            "@media print": { display: "none" },
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            {visitLabel || "Medical Prescription"}
          </Typography>
          <div>
            {editing && (
              <Button
                disabled={saving}
                variant="contained"
                startIcon={
                  saving ? <CircularProgress size={20} color="inherit" /> : null
                }
                size="small"
                onClick={async () => {
                  try {
                    setSave(true);
                    await handleSave();
                    setSnack({
                      open: true,
                      message: "Updated Successfully!",
                      severity: "success",
                    });

                    dispatch(fetchPatientProfile(id));
                    setTimeout(() => onClose(), 1200);
                    setSave(false);
                  } catch (e) {
                    setSnack({
                      open: true,
                      message: "Error Updating Please try again",
                      severity: "error",
                    });
                  }
                }}
                sx={{
                  textTransform: "none",
                  "@media print": { display: "none" },
                }}
              >
                {saving ? "saving..." : "save"}
              </Button>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>
        </Box>

        {/* --- PRESCRIPTION CONTENT --- */}
        <Box>
          {/* Header Logo */}
          <Box textAlign="center" mb={4}>
            <img
              src={clinicHeaderLogo}
              alt="Clinic Header"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Box>

          {/* Patient Info Rows  */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {/* Row 1: Name and Date */}
            <Box display="flex" gap={3}>
              <Line
                label="PATIENT’S NAME"
                value={
                  <Box
                    component="span"
                    sx={{ fontSize: "17px", fontWeight: 600 }}
                  >
                    {fullName(patientFullName)}
                  </Box>
                }
                flex={3}
                valueProps={{ sx: { fontSize: "5.5rem", fontWeight: "bold" } }}
              />
              <Line
                label="DATE"
                value={new Date(item?.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                flex={1}
              />
            </Box>

            {/* Row 2: Address, Age, and Sex combined  */}
            <Box display="flex" gap={3}>
              <Line
                label="ADDRESS"
                value={upperCaseFirstLetter(patientInfo?.address)}
                flex={4}
              />
              <Line
                label="AGE"
                value={getAge(patientInfo?.birth_date)}
                flex={0.8}
              />
              <Line label="SEX" value={patientInfo?.gender} flex={0.8} />
            </Box>
          </Box>

          {/* Rx Symbol */}
          <Typography
            variant="h3"
            sx={{ fontFamily: "serif", fontWeight: "bold", mb: 2 }}
          >
            ℞
          </Typography>

          <Box sx={{ minHeight: 400, px: 1, mt: 2 }}>
            {/* Header Row */}
            <Box
              display="flex"
              sx={{ borderBottom: "2px solid #000", pb: 0.5, mb: 1 }}
            >
              <Typography
                flex={2}
                sx={{ fontWeight: 800, fontSize: "0.85rem" }}
              >
                MEDICATION
              </Typography>
              <Typography
                flex={1}
                sx={{ fontWeight: 800, fontSize: "0.85rem" }}
              >
                DOSAGE
              </Typography>
              <Typography
                flex={1}
                sx={{ fontWeight: 800, fontSize: "0.85rem" }}
              >
                FREQUENCY
              </Typography>
              <Typography
                flex={2}
                sx={{ fontWeight: 800, fontSize: "0.85rem" }}
              >
                INSTRUCTIONS / NOTES
              </Typography>
              <Typography
                flex={1}
                sx={{ fontWeight: 800, fontSize: "0.85rem" }}
              >
                DURATION
              </Typography>
              {/* {editing && (
                <Typography flex={1} alignItems={"left"}>
                  Action
                </Typography>
              )} */}
            </Box>

            {/* Data Rows */}
            {(editing ? editForm : prescriptionItems)?.map((med, index) => (
              <Box
                key={index}
                display="flex"
                gap={1}
                sx={{
                  py: 1,
                  borderBottom: "1px solid #eee",
                  fontFamily: "'Times New Roman', serif",
                  fontSize: "1rem",
                }}
              >
                <Box flex={2}>
                  {editing ? (
                    <TextField
                      value={editForm[index]?.medication ?? "sample"}
                      onChange={(e) => {
                        const updated = [...editForm];
                        updated[index].medication = e.target.value;
                        setEditForm(updated);
                      }}
                      variant="standard"
                      fullWidth
                    />
                  ) : (
                    <Typography sx={{ fontWeight: 600 }}>
                      {med.medication}
                    </Typography>
                  )}
                </Box>

                {/* DOSAGE */}
                <Box flex={1}>
                  {editing ? (
                    <TextField
                      value={editForm[index]?.dosage}
                      onChange={(e) => {
                        const updated = [...editForm];
                        updated[index].dosage = e.target.value;
                        setEditForm(updated);
                      }}
                      variant="standard"
                      fullWidth
                    />
                  ) : (
                    <Typography>{med.dosage}</Typography>
                  )}
                </Box>

                {/* FREQUENCY */}
                <Box flex={1}>
                  {editing ? (
                    <TextField
                      value={editForm[index]?.frequency}
                      onChange={(e) => {
                        const updated = [...editForm];
                        updated[index].frequency = e.target.value;
                        setEditForm(updated);
                      }}
                      variant="standard"
                      fullWidth
                    />
                  ) : (
                    <Typography>{med.frequency}</Typography>
                  )}
                </Box>

                {/* INSTRUCTIONS */}
                <Box flex={2}>
                  {editing ? (
                    <TextField
                      value={editForm[index]?.instructions}
                      onChange={(e) => {
                        const updated = [...editForm];
                        updated[index].instructions = e.target.value;
                        setEditForm(updated);
                      }}
                      variant="standard"
                      fullWidth
                    />
                  ) : (
                    <Typography sx={{ fontStyle: "italic", color: "#444" }}>
                      {med.instructions}
                    </Typography>
                  )}
                </Box>

                {/* DURATION */}
                <Box flex={1}>
                  {editing ? (
                    <TextField
                      value={editForm[index]?.duration}
                      onChange={(e) => {
                        const updated = [...editForm];
                        updated[index].duration = e.target.value;
                        setEditForm(updated);
                      }}
                      variant="standard"
                      fullWidth
                    />
                  ) : (
                    <Typography>{med.duration}</Typography>
                  )}
                </Box>
                {/* {editing && (
                  <Box flex={1} display="flex" justifyContent="left">
                    <IconButton onClick={() => console.log(med.id)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                )} */}
              </Box>
            ))}

            {/* Fallback for old text-based remarks if no items exist */}
            {!prescriptionItems?.length && (
              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Times New Roman', serif",
                }}
              >
                {data.medications || data.remarks}
              </Typography>
            )}
          </Box>

          {/* Signature Block */}
          <Box mt={6} display="flex" justifyContent="flex-end">
            <Box sx={{ textAlign: "center", width: 280 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 16,
                  mb: 0.5,
                  textTransform: "uppercase",
                }}
              >
                DR. {doctor?.full_name}
              </Typography>
              <Box
                sx={{ borderTop: "1.5px solid black", width: "100%", mb: 1 }}
              />
              <Typography
                variant="caption"
                sx={{ display: "block", fontWeight: 700 }}
              >
                Lic. No. _____{doctor?.lic}______
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", fontWeight: 700 }}
              >
                PTR No. ___________
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

/**
 * Flat Line UI helper
 * Ensures no shadows and clear underline
 */
function Line({ label, value, flex = 1 }) {
  return (
    <Box display="flex" gap={1} alignItems="flex-end" sx={{ flex: flex }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "0.75rem",
          whiteSpace: "nowrap",
          color: "#333",
        }}
      >
        {label}:
      </Typography>
      <Box
        flex={1}
        sx={{
          borderBottom: "1px solid black",
          fontSize: "0.9rem",
          px: 0.5,
          minHeight: 20,
          fontWeight: 500,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
