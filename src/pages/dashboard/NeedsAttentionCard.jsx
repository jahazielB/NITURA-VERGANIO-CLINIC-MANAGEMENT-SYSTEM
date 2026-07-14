import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import { supabase } from "../../lib/supabaseClient";

const severityConfig = {
  critical: { icon: <ErrorIcon />, color: "text-red-600", bg: "bg-red-50" },
  warning: { icon: <WarningIcon />, color: "text-yellow-600", bg: "bg-yellow-50" },
  info: { icon: <InfoIcon />, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function NeedsAttentionCard() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: pendingLab },
        { count: unpaid },
        { count: waiting },
      ] = await Promise.all([
        supabase
          .from("lab_requests")
          .select("*", { count: "exact", head: true })
          .in("status", ["Pending", "Processing"]),
        supabase
          .from("billings")
          .select("*", { count: "exact", head: true })
          .eq("status", "Unpaid"),
        supabase
          .from("queue_entries")
          .select("*", { count: "exact", head: true })
          .eq("status", "Waiting")
          .gte("created_at", today.toISOString()),
      ]);

      if (!cancelled) {
        setItems([
          { label: "Pending Lab Results", count: pendingLab || 0, severity: "critical" },
          { label: "Unpaid Invoices", count: unpaid || 0, severity: "warning" },
          { label: "Waiting Queue Patients", count: waiting || 0, severity: "info" },
        ]);
      }
    };

    fetchCounts();

    return () => { cancelled = true; };
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography className="font-extrabold mb-3">Needs Attention</Typography>
        {!items ? (
          <Box className="flex justify-center py-4">
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List dense disablePadding>
            {items.map((item, i) => {
              const cfg = severityConfig[item.severity];
              return (
                <ListItem
                  key={i}
                  className={`rounded-lg mb-2 ${cfg.bg}`}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }} className={cfg.color}>
                    {cfg.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={cfg.color}>
                        <span className="font-bold">{item.count}</span> {item.label}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
