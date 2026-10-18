import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  Send,
  AlertCircle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Eye,
  Download,
  Power
} from 'lucide-react';
import { getDashboardStats, getPublicSettings, updateAppSetting } from '../../services/api';
import { DashboardStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(true);
  const [isTogglingRegistration, setIsTogglingRegistration] = useState<boolean>(false);
  const [registrationActionMsg, setRegistrationActionMsg] = useState<string>('');

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res))
      .catch(err => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));

    getPublicSettings()
      .then(settings => {
        setRegistrationOpen(settings.registration_open !== 'false');
      })
      .catch(() => {});
  }, []);

  const handleToggleRegistration = async () => {
    const nextState = !registrationOpen;
    const confirmMsg = nextState
      ? 'Are you sure you want to RE-OPEN public registrations?'
      : 'Are you sure you want to CLOSE registrations? Public users will no longer be able to submit objections.';

    if (!window.confirm(confirmMsg)) return;

    setIsTogglingRegistration(true);
    setRegistrationActionMsg('');
    try {
      await updateAppSetting('registration_open', nextState ? 'true' : 'false');
      setRegistrationOpen(nextState);
      setRegistrationActionMsg(nextState ? 'Registration opened successfully' : 'Registration closed successfully');
      setTimeout(() => setRegistrationActionMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update registration status');
    } finally {
      setIsTogglingRegistration(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-slate-500">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
        {error || 'Error loading dashboard statistics'}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-gov-blue', bg: 'bg-blue-50' },
    { label: "Today's Submissions", value: stats.today, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'This Week', value: stats.thisWeek, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'This Month', value: stats.thisMonth, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  const statusCards = [
    { label: 'Submitted (New)', count: stats.statusCounts.Submitted || 0, color: 'bg-blue-100 text-blue-800' },
    { label: 'Under Review', count: stats.statusCounts['Under Review'] || 0, color: 'bg-amber-100 text-amber-800' },
    { label: 'Reviewed', count: stats.statusCounts.Reviewed || 0, color: 'bg-purple-100 text-purple-800' },
    { label: 'Forwarded to Dept', count: stats.statusCounts.Forwarded || 0, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Rejected', count: stats.statusCounts.Rejected || 0, color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administration Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time tracking of public objections to the Draft Lakshadweep Town & Country Planning Rules, 2026
        </p>
      </div>

      {/* Registration ON / OFF Control Banner */}
      <div
        className={`p-4 sm:p-5 rounded-xl border transition-all ${
          registrationOpen
            ? 'bg-emerald-50/70 border-emerald-300'
            : 'bg-red-50/80 border-red-300'
        } flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              registrationOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            <Power className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Public Registration Status</h2>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  registrationOpen
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-red-200 text-red-900'
                }`}
              >
                {registrationOpen ? '● REGISTRATION IS OPEN' : '■ REGISTRATION IS CLOSED'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {registrationOpen
                ? 'The public form is active and accepting submissions. Click the button to close registrations.'
                : 'The public form is closed. New submissions are blocked (tracking and PDF downloads remain open).'}
            </p>
            {registrationActionMsg && (
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                ✓ {registrationActionMsg}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleRegistration}
            disabled={isTogglingRegistration}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              registrationOpen
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } ${isTogglingRegistration ? 'opacity-70 cursor-wait' : ''}`}
          >
            <Power className="w-4 h-4" />
            <span>
              {isTogglingRegistration
                ? 'Updating...'
                : registrationOpen
                ? 'Turn OFF (Close Registration)'
                : 'Turn ON (Open Registration)'}
            </span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ${c.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">{c.label}</span>
                <span className="text-2xl font-extrabold text-slate-900">{c.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown Pills */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Status Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statusCards.map((sc, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${sc.color} flex flex-col justify-between`}>
              <span className="text-xs font-semibold">{sc.label}</span>
              <span className="text-xl font-bold mt-2">{sc.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Grid: Island Breakdown & Activity Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Island Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gov-blue" />
              <span>Submissions by Island Jurisdiction</span>
            </h2>
            <span className="text-xs text-slate-400">All 11 Islands</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {stats.islandCounts && stats.islandCounts.length > 0 ? (
              stats.islandCounts.map((isl, idx) => {
                const percentage = stats.total > 0 ? Math.round((isl.count / stats.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{isl.island}</span>
                      <span className="text-slate-500 font-semibold">{isl.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gov-blue h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No submissions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Timeline activity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Submission Trend (Recent Days)</span>
            </h2>
            <Link to="/admin/submissions" className="text-xs text-gov-blue hover:underline font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {stats.timeline && stats.timeline.length > 0 ? (
              stats.timeline.map((t, idx) => {
                const dateClean = String(t.date || '').split('T')[0];
                const parts = dateClean.split('-');
                const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateClean;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                    <span className="font-mono text-slate-600">{displayDate}</span>
                    <span className="font-bold text-gov-blue bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                      {t.count} Submissions
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No timeline activity to display.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
