import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Archive,
  RefreshCw,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import {
  getSubmissionsList,
  updateSubmissionStatus,
  getExportCsvUrl,
  updateSubmission,
  deleteSubmission
} from '../../services/api';
import { SubmissionListItem, ISLANDS_LIST } from '../../types';

export const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filters
  const [search, setSearch] = useState<string>('');
  const [island, setIsland] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Status Change Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionListItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Submitted');
  const [statusRemarks, setStatusRemarks] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Edit Submission Modal State
  const [editingSubmission, setEditingSubmission] = useState<SubmissionListItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    relationship: 'Son of',
    parentSpouseName: '',
    houseName: '',
    island: 'Kavaratti',
    pinCode: '682555',
    phone: '',
    email: '',
    place: '',
    submissionDate: '',
    status: 'Submitted'
  });
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Delete Submission Modal State
  const [deletingSubmission, setDeletingSubmission] = useState<SubmissionListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubmissionsList({
        page,
        limit: 15,
        search,
        island: island === 'All' ? undefined : island,
        status: status === 'All' ? undefined : status,
        dateRange: dateRange === 'all' ? undefined : dateRange
      });
      setSubmissions(res.submissions);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalCount(res.pagination.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, island, status, dateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissions();
  };

  const handleQuickStatusUpdate = async () => {
    if (!selectedSubmission) return;
    setIsUpdatingStatus(true);
    try {
      await updateSubmissionStatus(selectedSubmission.submission_id, newStatus, statusRemarks);
      setSelectedSubmission(null);
      setStatusRemarks('');
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStartEdit = (sub: SubmissionListItem) => {
    setEditingSubmission(sub);
    setEditFormData({
      fullName: sub.full_name || '',
      relationship: sub.relationship || 'Son of',
      parentSpouseName: sub.parent_spouse_name || '',
      houseName: sub.house_name || '',
      island: sub.island || 'Kavaratti',
      pinCode: sub.pin_code || '682555',
      phone: sub.phone || '',
      email: sub.email || '',
      place: sub.place || '',
      submissionDate: sub.submission_date || '',
      status: sub.status || 'Submitted'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSubmission) return;
    setIsSavingEdit(true);
    try {
      await updateSubmission(editingSubmission.submission_id, editFormData);
      setEditingSubmission(null);
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Failed to update submission response');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubmission) return;
    setIsDeleting(true);
    try {
      await deleteSubmission(deletingSubmission.submission_id);
      setDeletingSubmission(null);
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete submission');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDownloadUrl = (submissionId: string, letterNum: 1 | 2 | 3 | 'both', accessToken?: string) => {
    const adminToken = localStorage.getItem('lakshadweep_admin_token') || '';
    const tokenQuery = accessToken ? `token=${accessToken}` : (adminToken ? `admin_token=${adminToken}` : '');
    const base = letterNum === 'both'
      ? `/api/submissions/${submissionId}/download-both`
      : `/api/submissions/${submissionId}/letters/${letterNum}/download`;
    return tokenQuery ? `${base}?${tokenQuery}` : base;
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Submitted':
        return <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-[11px]">Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[11px]">Under Review</span>;
      case 'Reviewed':
        return <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold text-[11px]">Reviewed</span>;
      case 'Forwarded':
        return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">Forwarded</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-[11px]">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px]">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Registered Objection Submissions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total records found: <strong className="text-slate-800">{totalCount}</strong> submissions (each containing 2 separate legal objection letters)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubmissions}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={getExportCsvUrl(island, status)}
            download
            className="px-3.5 py-2 bg-gov-blue hover:bg-gov-navy text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Filtered CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Name, House, Island, Phone, Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          {/* Island Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Island Jurisdiction:</label>
            <select
              value={island}
              onChange={e => {
                setIsland(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue"
            >
              <option value="All">All Islands (11)</option>
              {ISLANDS_LIST.map(isl => (
                <option key={isl} value={isl}>
                  {isl}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Status:</label>
            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Forwarded">Forwarded</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Date Range:</label>
            <select
              value={dateRange}
              onChange={e => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full mb-3" />
            <p className="text-xs text-slate-500">Loading submissions data...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-red-600 text-center">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No submissions matching criteria</p>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3.5 font-bold">Submission ID</th>
                    <th className="p-3.5 font-bold">Applicant Name</th>
                    <th className="p-3.5 font-bold">House / Island</th>
                    <th className="p-3.5 font-bold">Contact</th>
                    <th className="p-3.5 font-bold">Date & Time</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map(sub => {
                    const dt = new Date(sub.created_at);
                    const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-gov-blue whitespace-nowrap">
                          {sub.submission_id}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900">{sub.full_name}</p>
                          <p className="text-[11px] text-slate-400">{sub.relationship} {sub.parent_spouse_name}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="text-slate-800">{sub.house_name}</p>
                          <p className="text-gov-blue font-semibold">{sub.island} – {sub.pin_code}</p>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <p>{sub.phone}</p>
                          <p className="text-slate-400 truncate max-w-[130px]">{sub.email}</p>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{sub.submission_date}</p>
                          <p className="text-[11px] text-slate-400">{timeStr}</p>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <a
                              href={getDownloadUrl(sub.submission_id, 1, sub.access_token)}
                              download
                              title="Download Letter 1 PDF (Planning & Dev Board Rules)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded text-[11px] font-semibold transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>L1</span>
                            </a>
                            <a
                              href={getDownloadUrl(sub.submission_id, 2, sub.access_token)}
                              download
                              title="Download Letter 2 PDF (Town Planner Qualifications)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200 rounded text-[11px] font-semibold transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>L2</span>
                            </a>
                            <a
                              href={getDownloadUrl(sub.submission_id, 3, sub.access_token)}
                              download
                              title="Download Letter 3 PDF (Planning & Dev Authority Rules)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded text-[11px] font-semibold transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>L3</span>
                            </a>
                            <a
                              href={getDownloadUrl(sub.submission_id, 'both', sub.access_token)}
                              download
                              title="Download All 3 Letters (ZIP Archive)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white border border-slate-300 rounded text-[11px] font-semibold transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>ZIP</span>
                            </a>
                            <Link
                              to={`/admin/submissions/${sub.submission_id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-gov-blue hover:text-white rounded text-[11px] font-semibold transition-colors"
                              title="View Submission Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setNewStatus(sub.status);
                              }}
                              className="inline-flex items-center px-2 py-1 border border-slate-300 hover:bg-slate-50 rounded text-[11px] font-medium text-slate-700"
                              title="Change Status"
                            >
                              Status
                            </button>
                            <button
                              onClick={() => handleStartEdit(sub)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded text-[11px] font-semibold transition-colors"
                              title="Edit Response Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingSubmission(sub)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded text-[11px] font-semibold transition-colors"
                              title="Delete Submission Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {submissions.map(sub => (
                <div key={sub.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-gov-blue text-sm">
                        {sub.submission_id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{sub.full_name}</h3>
                      <p className="text-xs text-slate-500">{sub.relationship} {sub.parent_spouse_name}</p>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg">
                    <p><strong>House:</strong> {sub.house_name}, {sub.island} – {sub.pin_code}</p>
                    <p><strong>Mobile:</strong> {sub.phone}</p>
                    <p><strong>Date:</strong> {sub.submission_date}</p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <a
                        href={getDownloadUrl(sub.submission_id, 1, sub.access_token)}
                        download
                        className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Letter 1</span>
                      </a>
                      <a
                        href={getDownloadUrl(sub.submission_id, 2, sub.access_token)}
                        download
                        className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Letter 2</span>
                      </a>
                      <a
                        href={getDownloadUrl(sub.submission_id, 3, sub.access_token)}
                        download
                        className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Letter 3</span>
                      </a>
                      <a
                        href={getDownloadUrl(sub.submission_id, 'both', sub.access_token)}
                        download
                        className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Archive className="w-3 h-3" />
                        <span>ZIP</span>
                      </a>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setNewStatus(sub.status);
                          }}
                          className="px-2.5 py-1 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => handleStartEdit(sub)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold flex items-center gap-1 hover:bg-indigo-100"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingSubmission(sub)}
                          className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold flex items-center gap-1 hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                      <Link
                        to={`/admin/submissions/${sub.submission_id}`}
                        className="px-3 py-1 bg-gov-blue text-white rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
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

      {/* Quick Status Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Change Status: {selectedSubmission.submission_id}
            </h3>
            <p className="text-xs text-slate-500">
              Applicant: <strong>{selectedSubmission.full_name}</strong> ({selectedSubmission.island})
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Status:
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue bg-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Forwarded">Forwarded to Department</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified residential eligibility and forwarded to Urban Development Directorate."
                  value={statusRemarks}
                  onChange={e => setStatusRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickStatusUpdate}
                disabled={isUpdatingStatus}
                className="px-4 py-1.5 text-xs bg-gov-blue hover:bg-gov-navy text-white font-bold rounded-lg transition-colors"
              >
                {isUpdatingStatus ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Submission Response: <span className="font-mono text-gov-blue">{editingSubmission.submission_id}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update applicant and response details. Updating will automatically regenerate the final objection letters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-4 pt-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Applicant Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S/o, D/o, W/o"
                    value={editFormData.relationship}
                    onChange={e => setEditFormData({ ...editFormData, relationship: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Parent / Spouse Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Parent / Spouse Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.parentSpouseName}
                    onChange={e => setEditFormData({ ...editFormData, parentSpouseName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Island */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Island <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.island}
                    onChange={e => setEditFormData({ ...editFormData, island: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue bg-white"
                  >
                    {ISLANDS_LIST.map(isl => (
                      <option key={isl} value={isl}>
                        {isl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* House Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    House Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.houseName}
                    onChange={e => setEditFormData({ ...editFormData, houseName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={editFormData.pinCode}
                    onChange={e => setEditFormData({ ...editFormData, pinCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Place */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Place <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.place}
                    onChange={e => setEditFormData({ ...editFormData, place: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Submission Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Submission Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM-DD or DD/MM/YYYY"
                    value={editFormData.submissionDate}
                    onChange={e => setEditFormData({ ...editFormData, submissionDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue bg-white"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Forwarded">Forwarded to Department</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
                  className="px-4 py-2 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 text-xs bg-gov-blue hover:bg-gov-navy text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-red-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0 mt-0.5">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Delete Submission Permanently?
                </h3>
                <p className="text-xs text-slate-600">
                  Are you sure you want to delete submission <strong className="font-mono text-red-600">{deletingSubmission.submission_id}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
              <p><strong>Applicant:</strong> {deletingSubmission.full_name}</p>
              <p><strong>Mobile:</strong> {deletingSubmission.phone}</p>
              <p><strong>Island:</strong> {deletingSubmission.island} ({deletingSubmission.house_name})</p>
              <p className="text-red-700 font-medium pt-1 text-[11px]">
                ⚠️ Warning: This will permanently remove this record, objection letters, signatures, and notes from the database. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeletingSubmission(null)}
                className="px-4 py-2 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
