import React from "react";
import { Chip } from "@mui/material";
import { APPT_STATUS } from "../helpers/appointmentHelpers";

export default function StatusChip({ status }) {
  const color =
    status === APPT_STATUS.WAITING
      ? "warning"
      : status === APPT_STATUS.IN_CONSULT
        ? "info"
        : status === APPT_STATUS.DONE
          ? "success"
          : status === APPT_STATUS.SCHEDULED
            ? "primary"
            : status === APPT_STATUS.CANCELLED
              ? "error"
              : status === APPT_STATUS.NO_SHOW
                ? "default"
                : "default";

  return <Chip size="small" label={status} color={color} />;
}
