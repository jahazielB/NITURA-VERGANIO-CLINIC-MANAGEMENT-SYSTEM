import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useEffect } from "react";
import { getLatestRecord } from "./helpers/getLatestRecord";
import { useSelector } from "react-redux";

export default function LatestSoapNoteCard({ onViewNote }) {
  const { patientInfo } = useSelector((s) => s.patientProfile);
  const visit = patientInfo?.visits;
  const latestSoap = [getLatestRecord(visit, "soap_notes")];

  const SoapSection = ({ icon, label, value }) => (
    <Box className="flex gap-2 items-start">
      <Box className="text-blue-600 mt-[2px]">{icon}</Box>

      <Box className="flex-1">
        <Typography
          variant="caption"
          className="uppercase font-semibold text-slate-500 leading-none"
        >
          {label}
        </Typography>

        <Typography variant="body2" className="text-slate-700 leading-snug">
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card className="rounded-xl shadow-lg h-full border border-slate-200">
      <CardContent className="p-4">
        {/* Header */}
        <Typography
          variant="subtitle1"
          className="font-semibold text-slate-800 mb-2"
        >
          Latest SOAP Note
        </Typography>

        {latestSoap?.length > 0 && latestSoap[0] ? (
          latestSoap.map((s, index) => (
            <Box
              key={index}
              className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2"
            >
              <SoapSection
                icon={<PersonOutlineIcon fontSize="small" />}
                label="Subjective"
                value={s.subjective}
              />

              <Divider />

              <SoapSection
                icon={<ScienceOutlinedIcon fontSize="small" />}
                label="Objective"
                value={s.objective}
              />

              <Divider />

              <SoapSection
                icon={<PsychologyOutlinedIcon fontSize="small" />}
                label="Assessment"
                value={s.assessment}
              />

              <Divider />

              <SoapSection
                icon={<AssignmentOutlinedIcon fontSize="small" />}
                label="Plan"
                value={s.plan}
              />
            </Box>
          ))
        ) : (
          <Box className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center">
            <Typography variant="body2" className="text-slate-500">
              No SOAP note recorded
            </Typography>
          </Box>
        )}

        {/* Button */}
        <Box className="flex justify-end mt-3">
          <Button
            size="small"
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={() => onViewNote()}
            className="rounded-lg"
          >
            View All SOAP
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
