import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventIcon from "@mui/icons-material/Event";
import ScienceIcon from "@mui/icons-material/Science";
import PaymentsIcon from "@mui/icons-material/Payments";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import LockIcon from "@mui/icons-material/Lock";
import { supabase } from "../../lib/supabaseClient";

const activityIcons = {
  account_created: <PersonAddIcon fontSize="small" color="primary" />,
  account_updated: <EventIcon fontSize="small" color="secondary" />,
  account_enabled: <PaymentsIcon fontSize="small" color="success" />,
  account_disabled: <LockIcon fontSize="small" color="error" />,
  password_reset: <LockIcon fontSize="small" color="warning" />,
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

export default function RecentActivityCard() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          id,
          action,
          description,
          severity,
          created_at,
          user_profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Activity Log Fetch Error", error);
        setActivities([]);
      } else if (!cancelled) {
        setActivities(data || []);
      }
      if (!cancelled) setLoading(false);
    };

    fetchActivities();

    return () => { cancelled = true; };
  }, []);

  return (
    <Card className="h-full">
      <CardContent>
        <Box className="flex justify-between items-center mb-3">
          <Typography className="font-extrabold">Recent Activity</Typography>
        </Box>
        {loading ? (
          <Box className="flex justify-center py-4">
            <CircularProgress size={24} />
          </Box>
        ) : activities.length === 0 ? (
          <Typography variant="body2" color="text.secondary" className="py-2">
            No recent activity.
          </Typography>
        ) : (
          <List dense disablePadding>
            {activities.map((item, i) => {
              const icon = activityIcons[item.action] || <EventIcon fontSize="small" color="info" />;
              const name = item.user_profiles?.full_name;
              return (
                <Box key={item.id}>
                  {i > 0 && <Divider component="li" />}
                  <ListItem disablePadding sx={{ py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <span className="font-medium text-gray-500">{formatTime(item.created_at)}</span>
                          {" "}{item.description}
                          {name ? <span className="text-gray-400"> — {name}</span> : null}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
