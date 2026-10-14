import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileText, CheckCircle2, Clock, Download, Eye, Shield, AlertCircle } from 'lucide-react';
import { getSubmission } from '../services/api';
import { downloadLetterAsPdf } from '../utils/pdfDownloader';

export const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id') || '';
  const tokenFromUrl = searchParams.get('token') || '';

  const [submissionId, setSubmissionId] = useState<string>(idFromUrl);
  const [accessToken, setAccessToken] = useState<string>(tokenFromUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    if (idFromUrl) {
      handleTrack(idFromUrl, tokenFromUrl);
    }
  }, [idFromUrl, tokenFromUrl]);

  const handleTrack = async (searchId: string, tokenVal?: string) => {
    if (!searchId.trim()) {
      setError('Please enter a valid Submission ID (e.g. LDR-2026-000001)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await getSubmission(searchId.trim(), tokenVal || accessToken);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Submission not found. Please verify the Submission ID.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async (letterIndex: number) => {
    if (!data?.letters) return;
    const l = data.letters[letterIndex];
    if (!l) return;
    setDownloading(l.letterNumber);
    try {
      const applicantName = data.submission?.fullName || data.fullName || 'Applicant';
      const safeName = applicantName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sId = data.submission?.submissionId || data.submissionId || 'Submission';
      await downloadLetterAsPdf(
        l.finalHtml || l.viewUrl,
        `Objection_Letter_${l.letterNumber}_${sId}_${safeName}.pdf`,
        l.downloadUrl
      );
    } catch (err) {
      console.error('Download error:', err);
      if (l.downloadUrl) {
        const a = document.createElement('a');
        a.href = l.downloadUrl;
        a.download = `Objection_Letter_${l.letterNumber}_${data.submissionId || 'Submission'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!data?.letters) return;
    setDownloading(999);
    try {
      for (let i = 0; i < data.letters.length; i++) {
        await handleDownloadLetter(i);
        await new Promise(r => setTimeout(r, 600));
      }
    } finally {
      setDownloading(null);
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
            Enter your official Submission Reference ID (e.g., LDR-2026-000001) to verify acknowledgment status.
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
              placeholder="e.g. LDR-2026-000001"
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

          {/* If Authorized with Token */}
          {data.authorized && data.letters && (
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-slate-900 text-sm">Download Stored Objection Letters</h3>

              <div className="space-y-3">
                {data.letters.map((letter: any, idx: number) => (
                  <div
                    key={letter.letterNumber}
                    className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-gov-blue block">
                        Letter {letter.letterNumber} (Version {letter.templateVersion})
                      </span>
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">{letter.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={letter.viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold hover:bg-white text-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadLetter(idx)}
                        disabled={downloading === letter.letterNumber}
                        className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloading === letter.letterNumber ? 'Generating PDF...' : 'Download PDF'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={downloading === 999}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === 999 ? 'Generating All PDFs...' : 'Download All Letters (PDF)'}</span>
                </button>
              </div>
            </div>
          )}

          {!data.authorized && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-gov-blue shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Privacy Protection Enabled</p>
                <p className="text-slate-600 mt-0.5">
                  Full personal details and direct PDF download links are sent to the registered applicant email for privacy and protection.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
