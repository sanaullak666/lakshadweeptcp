import React, { useEffect, useState } from 'react';
import { History, Shield, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { getAuditLogs } from '../../services/api';
import { AuditLogItem } from '../../types';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAuditLogs(page, 30);
      setLogs(res.logs);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalCount(res.pagination.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Security & Operational Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system audit trail tracking officer access, document downloads, status changes, and exports.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full mb-3" />
            <p className="text-xs text-slate-500">Loading audit trail...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-red-600 text-center">{error}</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No audit logs recorded</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Officer / Actor</th>
                    <th className="p-3.5 font-bold">Action</th>
                    <th className="p-3.5 font-bold">Target</th>
                    <th className="p-3.5 font-bold">Details</th>
                    <th className="p-3.5 font-bold">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {log.admin_username || 'System / Public'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {log.target_type ? `${log.target_type}: ${log.target_id || ''}` : '—'}
                      </td>
                      <td className="p-3.5 text-slate-700 font-sans text-xs max-w-xs break-words">
                        {log.details || '—'}
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total actions logged)
              </span>

              <div className="flex space-x-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
