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
  Download
} from 'lucide-react';
import { getDashboardStats } from '../../services/api';
import { DashboardStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res))
      .catch(err => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

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
