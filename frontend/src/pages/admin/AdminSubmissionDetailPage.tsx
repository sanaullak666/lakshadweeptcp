import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  Printer,
  FileText,
  User,
  MapPin,
  Calendar,
  Clock,
  Shield,
  MessageSquare,
  History,
  Archive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getSubmissionDetail, updateSubmissionStatus, addAdminNote } from '../../services/api';
import { SubmissionDetailData } from '../../types';

export const AdminSubmissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SubmissionDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Status Change State
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusRemarks, setStatusRemarks] = useState<string>('');
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  // New Note State
  const [newNote, setNewNote] = useState<string>('');
  const [noteAdding, setNoteAdding] = useState<boolean>(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getSubmissionDetail(id);
      setData(res);
      setNewStatus(res.submission.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStatus) return;
    setStatusUpdating(true);
    try {
      await updateSubmissionStatus(id, newStatus, statusRemarks);
      setStatusRemarks('');
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    setNoteAdding(true);
    try {
      await addAdminNote(id, newNote.trim());
      setNewNote('');
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setNoteAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-slate-500">Loading full submission record...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
        <p className="font-bold">Error loading submission</p>
        <p className="text-xs mt-1">{error || 'Submission could not be found'}</p>
        <Link to="/admin/submissions" className="inline-block mt-4 text-xs font-semibold underline">
          &larr; Back to all submissions
        </Link>
      </div>
    );
  }

  const { submission, letters, zipDownloadUrl, statusHistory, notes } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/submissions"
            className="p-2 border border-slate-300 hover:bg-white rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-gov-blue">
                {submission.submissionId}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                {submission.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {submission.submissionDate} at {new Date(submission.submittedAt).toLocaleTimeString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={zipDownloadUrl}
            download
            className="px-4 py-2 bg-gov-emerald hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow"
          >
            <Archive className="w-4 h-4" />
            <span>Download All 3 Letters (ZIP)</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Details & Letters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Profile & Signature */}
        <div className="lg:col-span-1 space-y-6">
          {/* Applicant Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <User className="w-4 h-4 text-gov-blue" />
              <span>Applicant Information</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block">Full Name:</span>
                <span className="font-bold text-slate-900 text-sm">{submission.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Relationship / Parent / Spouse:</span>
                <span className="font-medium text-slate-800">
                  {submission.relationship} {submission.parentSpouseName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">House Name:</span>
                <span className="font-medium text-slate-800">{submission.houseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Island & PIN Code:</span>
                <span className="font-bold text-gov-blue">
                  {submission.island} – {submission.pinCode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Mobile Number:</span>
                <span className="font-mono text-slate-800">{submission.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address:</span>
                <span className="font-mono text-slate-800 break-all">{submission.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <span className="text-slate-400 block">Place of Signing:</span>
                  <span className="font-medium text-slate-800">{submission.place}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Signing:</span>
                  <span className="font-medium text-slate-800">{submission.submissionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Preview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900">Captured Signature</h2>
              <span className="text-[11px] text-slate-400 uppercase">
                {submission.signatureType || 'Image'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center min-h-[90px]">
              {submission.signatureUrl ? (
                <img
                  src={submission.signatureUrl}
                  alt={`Signature of ${submission.fullName}`}
                  className="max-h-16 max-w-[200px] object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400 italic">Signature embedded in letters</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Signed by {submission.fullName}
            </p>
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <History className="w-4 h-4 text-gov-blue" />
              <span>Status History</span>
            </h2>

            <div className="space-y-3 max-h-56 overflow-y-auto text-xs">
              {statusHistory.map((h, i) => (
                <div key={i} className="border-l-2 border-gov-blue pl-3 py-0.5 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{h.new_status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className="text-slate-500">By: {h.changed_by}</p>
                  {h.remarks && <p className="text-slate-600 italic">"{h.remarks}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: The Two Stored Immutable Objection Letters & Status/Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* OBJECTION LETTER 1 SECTION */}
          <div className="bg-white rounded-xl border-2 border-blue-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-gov-blue rounded border border-blue-200">
                  OBJECTION LETTER 1
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Planning and Development Board Rules, 2026
                </h3>
                <span className="text-xs text-slate-400">
                  Stored Submission Version: {letters[0]?.templateVersion || '1.0'} (Immutable)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={letters[0]?.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Stored Letter</span>
                </a>
                <a
                  href={letters[0]?.downloadUrl}
                  download
                  className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1">
              <p>
                <strong>Statutory Reference:</strong> Objections under Section 153(7) of the Regulation No. 8 of 2026 to the Planning and Development Board Rules.
              </p>
              <p>
                <strong>Addressed To:</strong> The Director (Urban Development), Department of Urban Development, Kavaratti.
              </p>
              <p className="text-slate-400 text-[11px] pt-1">
                Notice: This letter is frozen and stored permanently. Modifying templates in the admin settings will never alter this applicant's submitted letter.
              </p>
            </div>
          </div>

          {/* OBJECTION LETTER 2 SECTION */}
          <div className="bg-white rounded-xl border-2 border-amber-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                  OBJECTION LETTER 2
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Chief Town Planner Qualifications Rules, 2026
                </h3>
                <span className="text-xs text-slate-400">
                  Stored Submission Version: {letters[1]?.templateVersion || '1.0'} (Immutable)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={letters[1]?.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Stored Letter</span>
                </a>
                <a
                  href={letters[1]?.downloadUrl}
                  download
                  className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1">
              <p>
                <strong>Statutory Reference:</strong> Objections under Section 153(7) of the Regulation No. 8 of 2026 to the Chief Town Planner Qualifications Rules.
              </p>
              <p>
                <strong>Addressed To:</strong> The Director (Urban Development), Department of Urban Development, Kavaratti (Copy to 5 statutory authorities).
              </p>
              <p className="text-slate-400 text-[11px] pt-1">
                Notice: Completely separate objection arguments regarding Rule 3, qualifications, UPSC consultation, and local ST preferences.
              </p>
            </div>
          </div>

          {/* OBJECTION LETTER 3 SECTION */}
          <div className="bg-white rounded-xl border-2 border-emerald-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  OBJECTION LETTER 3
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Planning and Development Authority Rules, 2026
                </h3>
                <span className="text-xs text-slate-400">
                  Stored Submission Version: {letters[2]?.templateVersion || '1.0'} (Immutable)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={letters[2]?.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Stored Letter</span>
                </a>
                <a
                  href={letters[2]?.downloadUrl}
                  download
                  className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1">
              <p>
                <strong>Statutory Reference:</strong> Objections under Section 153(7) of the Regulation No. 8 of 2026 to the Planning and Development Authority Rules.
              </p>
              <p>
                <strong>Addressed To:</strong> The Director (Urban Development), Department of Urban Development, Kavaratti (Copy to 4 statutory authorities).
              </p>
              <p className="text-slate-400 text-[11px] pt-1">
                Notice: Detailed objections regarding Planning and Development Authority Rules, 2026, Section 21 & Section 153(2) statutory mandates, protective rules, and rule-by-rule analysis table.
              </p>
            </div>
          </div>

          {/* Status Update Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Update Submission Status</h3>
            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select New Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue"
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
                    Remarks / Audit Trail Reason:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Scrutinized and forwarded to Secretary UD."
                    value={statusRemarks}
                    onChange={e => setStatusRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-4 py-2 bg-gov-blue hover:bg-gov-navy text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {statusUpdating ? 'Updating Status...' : 'Save Status Change'}
                </button>
              </div>
            </form>
          </div>

          {/* Private Admin Notes Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gov-blue" />
                <span>Internal Officer Notes (Private)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Never visible to applicant</span>
            </div>

            {/* Previous Notes */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes && notes.length > 0 ? (
                notes.map(n => (
                  <div key={n.id} className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-700">{n.admin_name}</span>
                      <span>{new Date(n.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-slate-800">{n.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No internal notes added yet.</p>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t">
              <textarea
                rows={2}
                placeholder="Write an internal note (e.g. Verified resident ST certificate)..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
              />
              <div className="text-right">
                <button
                  type="submit"
                  disabled={noteAdding || !newNote.trim()}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                >
                  {noteAdding ? 'Adding Note...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
