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
import OverviewVitalsCard from "./OverviewVitalsCard";
import PrescriptionsTab from "./PrescriptionsTab";
import SoapTab from "./SoapTab";
import LabResultsTab from "./LabResultsTab";
import BillingTab from "./BillingTab";
import { useSelector } from "react-redux";
function TabPanel({ value, index, children }) {
  return value === index ? <Box className="pt-4">{children}</Box> : null;
}

export default function PatientTabs({
  tab,
  setTab,
  visits,

  vitalsByVisit,
  selectedVisitId,
  onSelectVisit,
  patient,
}) {
  const { role } = useSelector((s) => s.auth);
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
        <Tab label="SOAP" />
        {role === "Admin" && <Tab label="BILLING" />}
      </Tabs>
      <Divider />

      <CardContent>
        <TabPanel value={tab} index={0}>
          <OverviewVitalsCard
            vitalsByVisit={vitalsByVisit}
            selectedVisitId={selectedVisitId}
            onSelectVisit={onSelectVisit}
          />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Box className="space-y-4">
            <VisitHistoryTable />
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RecentPrescriptionsCard onViewAll={() => setTab(2)} />
              <LatestSoapNoteCard onViewNote={() => setTab(4)} />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <PrescriptionsTab />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <LabResultsTab visits={visits} role={role} />
        </TabPanel>
        <TabPanel value={tab} index={4}>
          <SoapTab visits={visits} />
        </TabPanel>
        {role === "Admin" && (
          <TabPanel value={tab} index={5}>
            <BillingTab patient={patient} />
          </TabPanel>
        )}
      </CardContent>
    </Card>
  );
}
