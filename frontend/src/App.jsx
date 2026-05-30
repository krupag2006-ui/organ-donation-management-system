import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import DonorsPage from './pages/donors/DonorsPage';
import RecipientsPage from './pages/recipients/RecipientsPage';
import HospitalsPage from './pages/hospitals/HospitalsPage';
import TransplantRequestsPage from './pages/requests/TransplantRequestsPage';
import MatchingSystemPage from './pages/requests/MatchingSystemPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RoleRoute permission="dashboard"><DashboardHome /></RoleRoute>} />
          <Route path="donors" element={<RoleRoute permission="donors"><DonorsPage /></RoleRoute>} />
          <Route path="recipients" element={<RoleRoute permission="recipients"><RecipientsPage /></RoleRoute>} />
          <Route path="hospitals" element={<RoleRoute permission="hospitals"><HospitalsPage /></RoleRoute>} />
          <Route path="requests" element={<RoleRoute permission="requests"><TransplantRequestsPage /></RoleRoute>} />
          <Route path="matching" element={<RoleRoute permission="matching"><MatchingSystemPage /></RoleRoute>} />
          <Route path="analytics" element={<RoleRoute permission="analytics"><AnalyticsPage /></RoleRoute>} />
          <Route path="profile" element={<RoleRoute permission="profile"><ProfilePage /></RoleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
