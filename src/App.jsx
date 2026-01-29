import Login from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import Patients from "./pages/patients";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import PatientProfilePage from "./pages/PatientProfilePage";
import AppointmentsPage from "./components/appointments/AppointmentsPage";
import LaboratorySidebarPage from "./pages/LaboratorySidebarPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientProfilePage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="laboratory" element={<LaboratorySidebarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
