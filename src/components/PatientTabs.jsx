import {
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import VisitHistoryTable from "./VisitHistoryTable";
import RecentPrescriptionsCard from "./RecentPrescriptionsCard";
import LatestSoapNoteCard from "./LatestSoapNoteCard";

function TabPanel({ value, index, children }) {
  return value === index ? <Box className="pt-4">{children}</Box> : null;
}

export default function PatientTabs({
  tab,
  setTab,
  visits,
  prescriptions,
  latestSoap,
}) {
  return (
    <Card className="rounded-2xl shadow-2xl">
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Overview" />
        <Tab label="Visits" />
        <Tab label="Prescriptions" />
        <Tab label="Lab Results" />
      </Tabs>
      <Divider />

      <CardContent>
        <TabPanel value={tab} index={0}>
          <Card className="rounded-2xl shadow">
            <CardContent>
              <Typography className="font-semibold mb-2">
                Latest Vitals (sample)
              </Typography>
              <Box className="flex flex-wrap gap-2">
                <Chip label="Temp: 37.8°C" />
                <Chip label="BP: 120/80" />
                <Chip label="Pulse: 86" />
                <Chip label="Weight: 72kg" />
                <Chip label="SpO₂: 97%" />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-2"
              >
                Vitals should be stored per visit.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Box className="space-y-4">
            <VisitHistoryTable rows={visits} />
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RecentPrescriptionsCard items={prescriptions} />
              <LatestSoapNoteCard soap={latestSoap} />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Card className="rounded-2xl shadow">
            <CardContent>
              <Typography className="font-semibold mb-3">
                All Prescriptions
              </Typography>
              <Box className="space-y-2">
                {prescriptions.map((m, idx) => (
                  <Box
                    key={idx}
                    className="flex items-center justify-between gap-3"
                  >
                    <Typography variant="body2">{m}</Typography>
                    <Chip label="Active" size="small" color="success" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Card className="rounded-2xl shadow">
            <CardContent>
              <Typography className="font-semibold">Lab Results</Typography>
              <Typography variant="body2" color="text.secondary">
                Build later: lab requests + result file + status.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </CardContent>
    </Card>
  );
}
