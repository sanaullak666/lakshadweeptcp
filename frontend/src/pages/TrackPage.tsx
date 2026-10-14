import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileText, CheckCircle2, Clock, Eye, Printer, Shield, AlertCircle } from 'lucide-react';
import { getSubmission } from '../services/api';

export const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id') || '';
  const tokenFromUrl = searchParams.get('token') || '';

  const [submissionId, setSubmissionId] = useState<string>(idFromUrl);
  const [accessToken, setAccessToken] = useState<string>(tokenFromUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (idFromUrl) {
      handleTrack(idFromUrl, tokenFromUrl);
    }
  }, [idFromUrl, tokenFromUrl]);

  const handleTrack = async (searchId: string, tokenVal?: string) => {
    if (!searchId.trim()) {
      setError('Please enter a valid Submission ID or registered Mobile Number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await getSubmission(searchId.trim(), tokenVal || accessToken);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Submission not found. Please verify the Submission ID or Mobile Number.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">Submitted</span>;
      case 'Under Review':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">Under Review</span>;
      case 'Reviewed':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs">Reviewed</span>;
      case 'Forwarded':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">Forwarded to Department</span>;
      case 'Rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-xs">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-xs">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-gov-gold uppercase tracking-wider">
            Public Tracking Service
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Track Objection Submission Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your official Submission Reference ID (e.g., LDR-2026-000001) or registered 10-digit Mobile Number to verify acknowledgment status.
          </p>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleTrack(submissionId);
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Submission ID (LDR-...) or 10-digit Mobile Number"
              value={submissionId}
              onChange={e => setSubmissionId(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gov-blue hover:bg-gov-navy text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <span>Checking...</span> : <span>Search Status</span>}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Display */}
      {data && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <span className="text-xs text-slate-400 font-mono">Submission Reference</span>
              <h2 className="text-2xl font-bold font-mono text-gov-blue">{data.submissionId}</h2>
            </div>
            <div>{getStatusBadge(data.status)}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg text-xs">
            <div>
              <span className="text-slate-400 block">Submission Date</span>
              <span className="font-semibold text-slate-800">{data.submissionDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Island Jurisdiction</span>
              <span className="font-semibold text-slate-800">{data.island || data.submission?.island}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Generated Letters</span>
              <span className="font-bold text-gov-blue">{data.letters ? `${data.letters.length} Letters` : '3 Letters'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">System Acknowledged</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
          </div>

          {/* Objection Letters Display */}
          {data.letters && data.letters.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Generated Objection Letters</h3>
                  <p className="text-xs text-slate-500">View or print your official objection letters.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-gov-blue rounded-full border border-blue-100">
                  {data.letters.length} Letters
                </span>
              </div>

              <div className="space-y-3">
                {data.letters.map((letter: any) => (
                  <div
                    key={letter.letterNumber}
                    className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/80 transition-colors shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gov-blue block">
                        Letter {letter.letterNumber} (Version {letter.templateVersion})
                      </span>
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">{letter.title}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={letter.viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                        title="View Letter in New Tab"
                      >
                        <Eye className="w-3.5 h-3.5 text-gov-blue" />
                        <span>View</span>
                      </a>

                      <a
                        href={letter.viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Open Print Dialog"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
