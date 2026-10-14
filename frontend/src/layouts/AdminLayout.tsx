import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  History,
  LogOut,
  ExternalLink,
  Shield,
  Download
} from 'lucide-react';
import { adminLogout, getExportCsvUrl } from '../services/api';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Submissions', path: '/admin/submissions', icon: FileSpreadsheet },
    { name: 'Letter Templates', path: '/admin/templates', icon: FileText },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Subheader Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center py-2.5 gap-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center -space-x-1.5 shrink-0">
              <img src="/lsalogo.jpeg" alt="LSA" className="w-5 h-5 rounded-full border border-gov-gold object-cover z-10" />
              <img src="/lsaflag.png" alt="LSA Flag" className="w-4 h-4 rounded-full border border-white object-cover" />
            </div>
            <span className="bg-gov-navy text-white text-[11px] font-bold px-2 py-0.5 rounded">
              ADMIN CONSOLE
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Lakshadweep Students Association Central Committee
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={getExportCsvUrl()}
              download
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All CSV</span>
            </a>

            <Link
              to="/"
              target="_blank"
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-gov-blue flex items-center gap-1"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 flex space-x-1 sm:space-x-4 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2.5 px-3 border-b-2 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-gov-blue text-gov-blue bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Admin View Container */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
