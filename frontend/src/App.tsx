import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SubmitPage } from './pages/SubmitPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { TrackPage } from './pages/TrackPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminSubmissionDetailPage } from './pages/admin/AdminSubmissionDetailPage';
import { AdminTemplatesPage } from './pages/admin/AdminTemplatesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { getAdminToken } from './services/api';

// Protected Route Guard for Admin views
const AdminProtectedRoute: React.FC = () => {
  const token = getAdminToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout />;
};

// Main Public Layout
const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdminLogin && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portal Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Protected Admin Portal Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="submissions/:id" element={<AdminSubmissionDetailPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
