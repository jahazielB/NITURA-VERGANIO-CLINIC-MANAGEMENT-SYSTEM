import Login from "../pages/Login";
import DashboardPage from "../pages/Dashboard";
import Patients from "../pages/patients";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import PatientProfilePage from "../pages/PatientProfilePage";
import AppointmentsPage from "../components/appointments/AppointmentsPage";
import LaboratorySidebarPage from "../pages/LaboratorySidebarPage";
import BillingPage from "../pages/BillingPage";
import AccountsPage from "../pages/accounts/AccountsPage";

import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
import DoctorQueuePage from "../pages/doctor/queue/page/DoctorQueuePage";
import DoctorPatientsPage from "../pages/doctor/patients/DoctorPatientPage";
import DoctorSoapPage from "../pages/doctor/Soap/DoctorSoapPage";
import DoctorPrescriptionsPage from "../pages/doctor/Prescriptions/DoctorPrescriptionsPage";
import DoctorLabReviewPage from "../pages/doctor/labReview/DoctorLabReviewPage";

import MedTechDashboardPage from "../pages/medTech/MedTechDashboardPage";
import MedTechLaboratoryPage from "../pages/medTech/laboratory/MedTechLaboratoryPage";
import MedTechPatientsPage from "../pages/medTech/patients/MedTechPatientsPage";

import NurseDashboardPage from "../pages/nurse/NurseDashboardPage";
import NurseQueuePage from "../pages/nurse/queue/NurseQueuePage";
import NursePatientsPage from "../pages/nurse/patients/NursePatientsPage";

import ProtectedRoute from "../auth/ProtectedRoute";
import RootRedirect from "../auth/RootRedirect";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allowRoles={["Admin"]} />}>
          <Route path="/Admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfilePage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="laboratory" element={<LaboratorySidebarPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="accounts" element={<AccountsPage />} />
          </Route>
        </Route>

        {/* Doctor */}
        <Route element={<ProtectedRoute allowRoles={["Doctor"]} />}>
          <Route path="/Doctor" element={<AdminLayout />}>
            <Route path="dashboard" element={<DoctorDashboardPage />} />
            <Route path="queue" element={<DoctorQueuePage />} />
            <Route path="patients" element={<DoctorPatientsPage />} />
            <Route path="patients/:id" element={<PatientProfilePage />} />
            <Route path="soap" element={<DoctorSoapPage />} />
            <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
            <Route path="lab-review" element={<DoctorLabReviewPage />} />
          </Route>
        </Route>

        {/* MedTech */}
        <Route element={<ProtectedRoute allowRoles={["MedTech"]} />}>
          <Route path="/MedTech" element={<AdminLayout />}>
            <Route path="dashboard" element={<MedTechDashboardPage />} />
            <Route path="laboratory" element={<MedTechLaboratoryPage />} />
            <Route path="patients" element={<MedTechPatientsPage />} />
            <Route path="patients/:id" element={<PatientProfilePage />} />
          </Route>
        </Route>

        {/* Nurse */}
        <Route element={<ProtectedRoute allowRoles={["Nurse"]} />}>
          <Route path="/Nurse" element={<AdminLayout />}>
            <Route path="dashboard" element={<NurseDashboardPage />} />
            <Route path="queue" element={<NurseQueuePage />} />
            <Route path="patients" element={<NursePatientsPage />} />
            <Route path="patients/:id" element={<PatientProfilePage />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
