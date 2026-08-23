// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Root
import RoleSelection from '../pages/RoleSelection';

// Patient pages
import Welcome       from '../pages/patient/Welcome';
import Consent       from '../pages/patient/Consent';
import Registration  from '../pages/patient/Registration';
import Interview     from '../pages/patient/Interview';
import Documents     from '../pages/patient/Documents';
import Review        from '../pages/patient/Review';
import Confirmation  from '../pages/patient/Confirmation';

// Doctor pages
import DoctorLogin    from '../pages/doctor/Login';
import DoctorDashboard from '../pages/doctor/Dashboard';
import PatientDetail  from '../pages/doctor/PatientDetail';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/doctor/login" replace />;
  if (role && user.role !== role) return <Navigate to="/doctor/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Role Selection */}
      <Route path="/" element={<RoleSelection />} />

      {/* Patient kiosk */}
      <Route path="/patient/welcome"      element={<Welcome />} />
      <Route path="/patient/consent"      element={<Consent />} />
      <Route path="/patient/registration" element={<Registration />} />
      <Route path="/patient/interview"    element={<Interview />} />
      <Route path="/patient/documents"    element={<Documents />} />
      <Route path="/patient/review"       element={<Review />} />
      <Route path="/patient/confirmation" element={<Confirmation />} />

      {/* Auth */}
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/admin/login"  element={<DoctorLogin />} />

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={
        <RequireAuth role="DOCTOR"><DoctorDashboard /></RequireAuth>
      } />
      <Route path="/doctor/queue" element={<Navigate to="/doctor/dashboard" replace />} />
      <Route path="/doctor/patients" element={<Navigate to="/doctor/dashboard" replace />} />
      <Route path="/doctor/patient/:id" element={<Navigate to="/doctor/dashboard" replace />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <RequireAuth role="ADMIN"><AdminDashboard /></RequireAuth>
      } />
      <Route path="/admin/analytics" element={
        <RequireAuth role="ADMIN"><AdminDashboard /></RequireAuth>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
