import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import Check from "./Check";
import { getDashboardPathForRole, getLoginPathForRole, getSession, isAuthenticated } from "./auth";

import DemoLogin from "./pages/DemoLogin";
import AdminLog from "./pages/admin/AdminLog";
import HospitalSignUp from "./pages/admin/HospitalSignUp";
import Login from "./pages/doctors/Login";
import DoctorDashboard from "./pages/doctors/DoctorDashboard";
import AdminDash from "./pages/admin/AdminDash";
import CheckUser from "./pages/admin/CheckUser";
import DoctorSignUp from "./pages/admin/DoctorSignUp";
import NurseDashboard from "./pages/staff/NurseDashboard";
import PharmacyDashboard from "./pages/staff/PharmacyDashboard";
import LabDashboard from "./pages/staff/LabDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

const ProtectedRoute = ({ children, role }) => {
  const session = getSession();
  const actualRole = session?.role;

  if (!actualRole) {
    return <Navigate to={getLoginPathForRole(role)} replace />;
  }

  if (String(actualRole).trim().toLowerCase() !== String(role).trim().toLowerCase()) {
    return <Navigate to={getDashboardPathForRole(actualRole)} replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Check pageTitle="ClinicFlow" />} />
        <Route path="/doctor" element={<Login />} />
        <Route path="/__demo_login/:role" element={<DemoLogin />} />
        <Route path="/demo/:role" element={<DemoLogin />} />

        <Route path="/dashboard/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/nurse" element={<ProtectedRoute role="nurse"><NurseDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/pharmacy" element={<ProtectedRoute role="pharmacy"><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/laboratory" element={<ProtectedRoute role="laboratory"><LabDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminLog />} />
        <Route path="/hospital-register" element={<HospitalSignUp />} />
        <Route path="/dashboard/admin" element={<ProtectedRoute role="admin"><AdminDash /></ProtectedRoute>} />
        <Route path="/doctorsignup" element={<DoctorSignUp />} />
        <Route path="/checkUser" element={<CheckUser />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
