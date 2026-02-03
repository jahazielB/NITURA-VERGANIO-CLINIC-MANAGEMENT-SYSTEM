import {
  Card,
  CardContent,
  TextField,
  Box,
  Chip,
  Tab,
  Tabs,
} from "@mui/material";

const STATUS = ["All", "Waiting", "In Consult", "Done"];

export default function DoctorQueueFilters({ q, setQ, status, setStatus }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent className="space-y-3 flex ">
        <TextField
          label="Search"
          size="small"
          sx={{ width: "50%" }}
          placeholder="Search patient or reason..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <Tabs variant="scrollable" scrollButtons="auto" sx={{ minHeight: 44 }}>
          <Tab label="Queue (Today)" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled / No-show" />
        </Tabs>
      </CardContent>
    </Card>
  );
}
