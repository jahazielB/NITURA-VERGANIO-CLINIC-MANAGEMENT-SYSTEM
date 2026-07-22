import { Card, CardContent, TextField } from "@mui/material";

export default function SoapFilters({ q, setQ }) {
  return (
    <Card className="rounded-2xl shadow">
      <CardContent>
        <TextField
          label="Search"
          size="small"
          fullWidth
          placeholder="Patient name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
