import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Search, Lock, UserCheck } from 'lucide-react';
import { getAdminToken, clearAdminToken } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = !!getAdminToken();

  return (
    <header className="bg-gov-navy text-white shadow-md border-b-2 border-gov-gold">
      {/* Main navigation */}
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 border-2 border-gov-gold shadow-sm group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-7 h-7 text-gov-navy" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-sky-200 transition-colors">
              Lakshadweep Town & Country Planning
            </h1>
            <p className="text-xs text-sky-200/90 font-medium">
              Public Objections & Suggestions Portal (Rules 2026)
            </p>
          </div>
        </Link>

        {/* Action navigation */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/submit"
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              location.pathname === '/submit'
                ? 'bg-gov-gold text-slate-950 shadow'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Submit Objections</span>
          </Link>

          <Link
            to="/track"
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              location.pathname === '/track'
                ? 'bg-sky-700 text-white'
                : 'hover:bg-white/10 text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track Status</span>
          </Link>

          {isAdmin ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/admin"
                className="px-3 py-1.5 bg-gov-emerald hover:bg-emerald-700 text-white rounded text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  clearAdminToken();
                  window.location.href = '/admin/login';
                }}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="px-3 py-1.5 text-xs sm:text-sm text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Official Admin Access"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
