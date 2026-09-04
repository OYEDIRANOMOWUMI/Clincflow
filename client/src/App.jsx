import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import LayoutShell from './components/LayoutShell';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientRegisterPage from './pages/auth/PatientRegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import DoctorShiftPage from './pages/admin/DoctorShiftPage';
import WaitlistPage from './pages/admin/WaitlistPage';
import ReferralPage from './pages/admin/ReferralPage';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import PatientAppointmentBooking from './pages/patient/AppointmentBooking';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NurseDashboard from './pages/nurse/NurseDashboard';
import ReceptionistDashboard from './pages/staff/ReceptionistDashboard';
import PharmacyDashboard from './pages/staff/PharmacyDashboard';
import LaboratoryDashboard from './pages/staff/LaboratoryDashboard';
import StaffPatientsPage from './pages/staff/StaffPatientsPage';
import BillingPage from './pages/billing/BillingPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import MedicationReminderManagement from './pages/admin/MedicationReminderManagement';

const dashboardRoutes = [
  { path: '/dashboard/admin', roles: ['admin'], title: 'Admin', element: <AdminDashboardPage /> },
  { path: '/dashboard/admin/shifts', roles: ['admin'], title: 'Doctor Shifts', element: <DoctorShiftPage /> },
  { path: '/dashboard/admin/waitlist', roles: ['admin'], title: 'Waitlist', element: <WaitlistPage /> },
  { path: '/dashboard/admin/referrals', roles: ['admin'], title: 'Referrals', element: <ReferralPage /> },
  { path: '/dashboard/admin/appointments', roles: ['admin'], title: 'Appointments', element: <AppointmentManagement /> },
  { path: '/dashboard/admin/settings', roles: ['admin'], title: 'Settings', element: <AdminSettingsPage /> },
  { path: '/dashboard/receptionist/appointments', roles: ['receptionist'], title: 'Reception Appointments', element: <AppointmentManagement /> },
  { path: '/dashboard/patients', roles: ['doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin'], title: 'Patient Records', element: <StaffPatientsPage /> },
  { path: '/dashboard/billing', roles: ['admin', 'patient'], title: 'Billing', element: <BillingPage /> },
  { path: '/dashboard/admin/audit-logs', roles: ['admin'], title: 'Audit Log', element: <AuditLogPage /> },
  { path: '/dashboard/admin/medication-reminders', roles: ['admin'], title: 'Medication Reminders', element: <MedicationReminderManagement /> },
  { path: '/dashboard/doctor', roles: ['doctor'], title: 'Doctor', element: <DoctorDashboard /> },
  { path: '/dashboard/nurse', roles: ['nurse'], title: 'Nurse', element: <NurseDashboard /> },
  { path: '/dashboard/receptionist', roles: ['receptionist'], title: 'Reception', element: <ReceptionistDashboard /> },
  { path: '/dashboard/pharmacy', roles: ['pharmacy'], title: 'Pharmacy', element: <PharmacyDashboard /> },
  { path: '/dashboard/laboratory', roles: ['laboratory'], title: 'Laboratory', element: <LaboratoryDashboard /> },
  { path: '/dashboard/patient', roles: ['patient'], title: 'Patient', element: <PatientDashboard /> },
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/book-appointment"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <LayoutShell title="Book Appointment"><PatientAppointmentBooking /></LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/patient" element={<PatientRegisterPage />} />

      {dashboardRoutes.map(({ path, roles, title, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute allowedRoles={roles}>
              <LayoutShell title={title}>{element}</LayoutShell>
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
