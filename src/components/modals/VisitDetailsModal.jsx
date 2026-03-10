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
} from "@mui/material";
import VitalsSection from "./visitDetailsModals/VitalsSection";
import SoapSection from "./visitDetailsModals/SoapSection";
import PrescriptionsSection from "./visitDetailsModals/PrescriptionsSection";
import LabsSection from "./visitDetailsModals/LabsSection";

import { useState, useEffect } from "react";
import { compose } from "@reduxjs/toolkit";

import { supabase } from "../../lib/supabaseClient";

export default function VisitDetailsModal({ open, onClose, records, mode }) {
  const [editVitals, setEditVitals] = useState([]);
  const [editSoap, setEditSoap] = useState([]);
  const [editPrescriptions, setEditPrescriptions] = useState([]);
  const [editLabs, setEditLabs] = useState([]);

  const vitalsRecords = records?.flatMap((v) => v.vitals) || [];
  const soapNotes = records?.flatMap((s) => s.soap_notes) || [];
  const prescriptionsOrder = records?.flatMap((p) => p.prescription_orders);
  const prescriptions =
    prescriptionsOrder?.flatMap((p) => p.prescription_items) || [];
  const labRequests = records?.flatMap((l) => l.lab_requests) || [];

  useEffect(() => {
    if (!open) return;

    // **Deep copy objects to avoid mutating original records**
    setEditVitals(vitalsRecords.map((v) => ({ ...v })));
    setEditSoap(soapNotes.map((s) => ({ ...s })));
    setEditPrescriptions(prescriptions.map((p) => ({ ...p })));
    setEditLabs(labRequests.map((l) => ({ ...l })));
  }, [open]);

  useEffect(() => {
    console.log("prescriptions:", editSoap, mode);
  }, [vitalsRecords]);
  const saveVisitEdits = async ({
    soapNote,
    vitalsArray,
    prescriptionItems,
  }) => {
    try {
      // 🔹 Run all updates concurrently
      const [updatedSoap, updatedVitals, updatedPrescriptionItems] =
        await Promise.all([
          // 1️⃣ SOAP Note update
          supabase
            .from("soap_notes")
            .update(soapNote)
            .eq("id", soapNote.id)
            .then(({ data, error }) => {
              if (error) throw error;
              return data[0];
            }),

          // 2️⃣ Vitals update (multiple objects)
          Promise.all(
            vitalsArray.map((vital) =>
              supabase
                .from("vitals")
                .update(vital)
                .eq("id", vital.id)
                .then(({ data, error }) => {
                  if (error) throw error;
                  return data[0];
                }),
            ),
          ),

          // 3️⃣ Prescription Items update (multiple objects)
          Promise.all(
            prescriptionItems.map((item) =>
              supabase
                .from("prescription_items")
                .update(item)
                .eq("id", item.id)
                .then(({ data, error }) => {
                  if (error) throw error;
                  return data[0];
                }),
            ),
          ),
        ]);

      // 🔹 Return everything
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
          soapNotes={soapNotes}
          mode={mode}
          setSoapNotes={setEditSoap}
        />

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className={mode === "edit" ? "col-span-2" : ""}>
            <PrescriptionsSection
              prescriptions={prescriptions}
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
            variant="contained"
            onClick={async () => {
              try {
                const result = await saveVisitEdits({
                  soapNote: editSoap,
                  vitalsArray: editVitals, // multiple vitals objects
                  prescriptionItems: editPrescriptions,
                });

                console.log("Saved successfully:", result);

                alert("Visit updated successfully!");
              } catch {
                alert("Failed to save visit edits. Please try again.");
              }
            }}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
