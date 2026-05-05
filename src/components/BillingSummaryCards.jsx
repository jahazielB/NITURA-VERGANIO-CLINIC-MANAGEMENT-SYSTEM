import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { money } from "./helpers/billingHelpers";

export default function BillingSummaryCards({ todaySummary, onOpenReport }) {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Today&apos;s Revenue
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(todaySummary?.total_revenue)}
            </Typography>
          </Box>
          <PaymentsIcon />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Today&apos;s outstanding balance
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(todaySummary?.total_balance)}
            </Typography>
          </Box>
          <WarningAmberIcon />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Today&apos;s Unpaid/Partial Invoices
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {todaySummary?.unpaid_count}
            </Typography>
          </Box>

          <Box className="flex items-center gap-2">
            <ReceiptLongIcon />
            <Button
              size="small"
              variant="outlined"
              startIcon={<SummarizeIcon />}
              onClick={onOpenReport}
            >
              Report
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
