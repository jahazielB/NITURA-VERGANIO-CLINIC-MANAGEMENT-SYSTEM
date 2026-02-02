import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { money } from "./helpers/billingHelpers";

export default function BillingSummaryCards({
  todayRevenue,
  outstandingBalance,
  unpaidCount,
  onOpenReport,
}) {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Today&apos;s Revenue
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(todayRevenue)}
            </Typography>
          </Box>
          <PaymentsIcon />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Outstanding Balance
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(outstandingBalance)}
            </Typography>
          </Box>
          <WarningAmberIcon />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="flex items-center justify-between gap-2">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Unpaid Invoices
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {unpaidCount}
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
