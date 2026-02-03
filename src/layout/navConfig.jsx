import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import PaymentsIcon from "@mui/icons-material/Payments";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import FactCheckIcon from "@mui/icons-material/FactCheck"; // SOAP
import MedicationIcon from "@mui/icons-material/Medication"; // Prescriptions
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck"; // Queue

export const ROLE_HOME = {
  Admin: "/admin/dashboard",
  Doctor: "/doctor/dashboard",
  MedTech: "/medtech/dashboard",
  Nurse: "/nurse/dashboard",
};

export const NAV_BY_ROLE = {
  Admin: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "Appointments", icon: <EventIcon />, path: "appointments" },
    { text: "Patients", icon: <PeopleIcon />, path: "patients" },
    { text: "Laboratory", icon: <ScienceIcon />, path: "laboratory" },
    { text: "Billing", icon: <PaymentsIcon />, path: "billing" },
    { text: "Manage Accounts", icon: <ManageAccountsIcon />, path: "accounts" },
  ],

  Doctor: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "Queue Today", icon: <PlaylistAddCheckIcon />, path: "queue" },
    { text: "Patients", icon: <PeopleIcon />, path: "patients" },
    { text: "SOAP Notes", icon: <FactCheckIcon />, path: "soap" },
    { text: "Prescriptions", icon: <MedicationIcon />, path: "prescriptions" },
    { text: "Lab Review", icon: <ScienceIcon />, path: "lab-review" },
  ],

  // later
  MedTech: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "Laboratory", icon: <ScienceIcon />, path: "laboratory" },
    { text: "Patients", icon: <PeopleIcon />, path: "patients" },
  ],

  Nurse: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "Queue", icon: <PlaylistAddCheckIcon />, path: "queue" },
    { text: "Patients", icon: <PeopleIcon />, path: "patients" },
  ],
};

export const ROLE_TOPBAR = {
  Admin: {
    title: "Welcome, Admin",
    subtitle: "Manage clinic activities and view reports",
    avatar: "AD",
  },
  Doctor: {
    title: "Welcome, Doctor",
    subtitle: "View your queue, write SOAP notes, and review labs",
    avatar: "DR",
  },
  "Med Tech": {
    title: "Welcome, Med Tech",
    subtitle: "Process and release laboratory results",
    avatar: "MT",
  },
  Nurse: {
    title: "Welcome, Nurse",
    subtitle: "Manage vitals, queue, and patient intake",
    avatar: "NR",
  },
};
