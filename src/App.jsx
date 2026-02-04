import Login from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import Patients from "./pages/patients";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import PatientProfilePage from "./pages/PatientProfilePage";
import AppointmentsPage from "./components/appointments/AppointmentsPage";
import LaboratorySidebarPage from "./pages/LaboratorySidebarPage";
import BillingPage from "./pages/BillingPage";
import AccountsPage from "./pages/accounts/AccountsPage";
import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage";
import DoctorQueuePage from "./pages/doctor/queue/page/DoctorQueuePage";
import DoctorPatientsPage from "./pages/doctor/patients/DoctorPatientPage";
import DoctorSoapPage from "./pages/doctor/Soap/DoctorSoapPage";
import DoctorPrescriptionsPage from "./pages/doctor/Prescriptions/DoctorPrescriptionsPage";
import DoctorLabReviewPage from "./pages/doctor/labReview/DoctorLabReviewPage";
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
          <Route path="billing" element={<BillingPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>
        <Route path="/doctor" element={<AdminLayout />}>
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="queue" element={<DoctorQueuePage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="/doctor/patients/:id" element={<PatientProfilePage />} />
          <Route path="soap" element={<DoctorSoapPage />} />
          <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
          <Route path="lab-review" element={<DoctorLabReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
