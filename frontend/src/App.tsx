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

      {/* Floating Corner Icon: Lakshadweep Students Association Central Committee */}
      <div
        className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-full shadow-lg hover:shadow-xl pl-1.5 pr-2.5 sm:pr-3.5 py-1.5 flex items-center gap-2 transition-all hover:scale-105 group select-none"
        title="Lakshadweep Students Association Central Committee"
      >
        <div className="flex items-center -space-x-2 shrink-0">
          <img
            src="/lsalogo.jpeg"
            alt="LSA Logo"
            className="w-7 h-7 rounded-full border border-gov-gold object-cover shadow-xs z-10 bg-white"
          />
          <img
            src="/lsaflag.png"
            alt="LSA Flag"
            className="w-6 h-6 rounded-full border border-white object-cover shadow-xs bg-white"
          />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[11px] font-bold text-slate-800 leading-tight group-hover:text-gov-blue transition-colors">
            LSA Central Committee
          </p>
          <p className="text-[9px] text-slate-500 leading-tight">
            Official Initiative
          </p>
        </div>
      </div>
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
