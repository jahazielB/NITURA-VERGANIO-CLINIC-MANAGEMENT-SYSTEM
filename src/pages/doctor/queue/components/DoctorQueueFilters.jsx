import { Card, CardContent, TextField, Tab, Tabs } from "@mui/material";

const STATUS = ["All", "Waiting", "In Consult", "Done"];

export default function DoctorQueueFilters({ q, setQ, status, setStatus }) {
  const tabIndex = STATUS.indexOf(status);
  const handleChange = (_, idx) => setStatus(STATUS[idx]);

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

        <Tabs
          value={tabIndex === -1 ? 0 : tabIndex}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 44 }}
        >
          {STATUS.map((s) => (
            <Tab key={s} label={s} />
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
