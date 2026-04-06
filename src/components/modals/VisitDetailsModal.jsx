import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import VitalsSection from "./visitDetailsModals/VitalsSection";
import SoapSection from "./visitDetailsModals/SoapSection";
import PrescriptionsSection from "./visitDetailsModals/PrescriptionsSection";
import LabsSection from "./visitDetailsModals/LabsSection";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

import { useDispatch } from "react-redux";
import { fetchPatientProfile } from "../../store/patientProfileSlice";

import { useParams } from "react-router-dom";

export default function VisitDetailsModal({
  open,
  onClose,
  records,
  mode,
  setSnack,
}) {
  const [editVitals, setEditVitals] = useState([]);
  const [editSoap, setEditSoap] = useState([]);
  const [editPrescriptions, setEditPrescriptions] = useState([]);
  const [editLabs, setEditLabs] = useState([]);
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();
  const { id } = useParams();

  const vitalsRecords = records?.flatMap((v) => v.vitals) || [];
  const soapNotes = records?.flatMap((s) => s.soap_notes) || [];
  const prescriptionsOrder = records?.flatMap((p) => p.prescription_orders);
  const prescriptions =
    prescriptionsOrder?.flatMap((p) => p.prescription_items) || [];
  const labRequests = records?.flatMap((l) => l.lab_requests) || [];

  useEffect(() => {
    if (!open) return;

    // **Deep copy objects to avoid mutating original records**
    setEditVitals(
      vitalsRecords.map((v) => ({
        blood_pressure_dia: v.blood_pressure_dia,
        blood_pressure_sys: v.blood_pressure_sys,
        bmi: v.bmi,
        created_at: v.created_at,
        heart_rate: v.heart_rate,
        height_cm: v.height_cm,
        id: v.id,
        notes: v.notes,
        respiratory_rate: v.respiratory_rate,
        spo2: v.spo2,
        taken_at: v.taken_at,
        taken_by: v.taken_by,
        temperature_c: v.temperature_c,
        updated_at: v.updated_at,
        visit_id: v.visit_id,
        weight_kg: v.weight_kg,
      })),
    );
    setEditSoap(soapNotes.map((s) => ({ ...s })));
    setEditPrescriptions(prescriptions.map((p) => ({ ...p })));
    setEditLabs(labRequests.map((l) => ({ ...l })));
  }, [open]);

  useEffect(() => {
    console.log(editVitals ? editVitals : "");
  }, [open]);

  const saveVisitEdits = async ({
    soapNote,
    vitalsArray,
    prescriptionItems,
  }) => {
    try {
      const [updatedSoap, updatedVitals, updatedPrescriptionItems] =
        await Promise.all([
          // SOAP notes
          Promise.all(
            soapNote.map(async (soap) => {
              const { data, error } = await supabase
                .from("soap_notes")
                .update(soap)
                .eq("id", soap.id)
                .select()
                .single();

              if (error) throw error;
              return data;
            }),
          ),

          // Vitals
          Promise.all(
            vitalsArray.map(async (vital) => {
              const { data, error } = await supabase
                .from("vitals")
                .update(vital)
                .eq("id", vital.id)
                .select()
                .single();

              if (error) throw error;
              return data;
            }),
          ),

          // Prescription Items
          Promise.all(
            prescriptionItems.map(async (item) => {
              const { data, error } = await supabase
                .from("prescription_items")
                .update(item)
                .eq("id", item.id)
                .select()
                .single();

              if (error) throw error;
              return data;
            }),
          ),
        ]);

      return {
        soap: updatedSoap,
        vitals: updatedVitals,
        prescriptionItems: updatedPrescriptionItems,
      };
    } catch (err) {
      console.error("Error saving visit edits:", err);
      throw err;
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography className="font-bold text-lg">Visit Details</Typography>

          <Chip label="Completed" color="success" size="small" />
        </Box>
      </DialogTitle>

      <DialogContent dividers className="space-y-6">
        <VitalsSection
          vitals={mode === "edit" ? editVitals : vitalsRecords}
          mode={mode}
          setVitals={setEditVitals}
        />

        <SoapSection
          soapNotes={mode === "edit" ? editSoap : soapNotes}
          mode={mode}
          setSoapNotes={setEditSoap}
        />

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className={mode === "edit" ? "col-span-2" : ""}>
            <PrescriptionsSection
              prescriptions={
                mode === "edit" ? editPrescriptions : prescriptions
              }
              mode={mode}
              setPrescriptions={setEditPrescriptions}
            />
          </Box>

          {mode === "view" && (
            <LabsSection labRequests={labRequests} mode={mode} />
          )}
        </Box>

        <Divider />

        <Typography variant="body2" color="text.secondary">
          Tip: Later we can add “Print Visit Summary”.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>

        {mode === "edit" && (
          <Button
            disabled={
              saving ||
              (editSoap.length === 0 &&
                editPrescriptions.length === 0 &&
                editVitals.length === 0)
            }
            startIcon={
              saving ? <CircularProgress size={20} color="inherit" /> : null
            }
            variant="contained"
            onClick={async () => {
              try {
                setSaving(true);
                const result = await saveVisitEdits({
                  soapNote: editSoap,
                  vitalsArray: editVitals, // multiple vitals objects
                  prescriptionItems: editPrescriptions,
                });
                setSnack({
                  open: true,
                  message: "Updated Successfully!",
                  severity: "success",
                });
                dispatch(fetchPatientProfile(id));
                setTimeout(() => onClose(), 1200);

                setSaving(false);
              } catch {
                setSnack({
                  open: true,
                  message: "Failed to save visit edits. Please try again.",
                  severity: "error",
                });
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
