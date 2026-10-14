import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  Eye,
  Printer,
  Archive,
  ArrowRight,
  FileText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubmissionResult } from '../types';
import { downloadLetterAsPdf } from '../utils/pdfDownloader';

export const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionResult = location.state?.submissionResult as SubmissionResult | undefined;

  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    // Launch celebratory confetti if coming from fresh submission
    if (submissionResult) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [submissionResult]);

  if (!submissionResult) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Active Submission Found</h2>
        <p className="text-xs text-slate-500">
          If you have already submitted your objections, you can track them using your Submission ID.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/submit"
            className="px-4 py-2 bg-gov-blue text-white rounded text-sm font-semibold hover:bg-gov-navy"
          >
            Submit New Objections
          </Link>
          <Link
            to="/track"
            className="px-4 py-2 border border-slate-300 rounded text-sm font-semibold hover:bg-slate-50 text-slate-700"
          >
            Track by ID
          </Link>
        </div>
      </div>
    );
  }

  const { submissionId, submissionDate, applicant, letters, zipDownloadUrl } = submissionResult;

  const handleCopyId = () => {
    navigator.clipboard.writeText(submissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLetter = async (letterIndex: number) => {
    const l = letters[letterIndex];
    if (!l) return;
    setDownloading(l.letterNumber);
    try {
      const safeName = (applicant?.fullName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadLetterAsPdf(
        l.finalHtml || l.viewUrl,
        `Objection_Letter_${l.letterNumber}_${submissionId}_${safeName}.pdf`,
        l.downloadUrl
      );
    } catch (err) {
      console.error('Download error:', err);
      if (l.downloadUrl) {
        const a = document.createElement('a');
        a.href = l.downloadUrl;
        a.download = `Objection_Letter_${l.letterNumber}_${submissionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(999);
    try {
      for (let i = 0; i < letters.length; i++) {
        await handleDownloadLetter(i);
        await new Promise(r => setTimeout(r, 600));
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* Success Banner */}
      <div className="bg-white rounded-xl border border-emerald-200 p-6 md:p-8 shadow-sm text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Your objections have been submitted successfully.
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Three legally separate objection letters have been prepared and registered under your single submission.
        </p>

        {/* Submission ID Highlight Box */}
        <div className="bg-slate-50 border-2 border-dashed border-gov-blue/40 rounded-xl p-4 max-w-md mx-auto mt-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Official Submission Reference ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-extrabold text-gov-blue tracking-wider">
              {submissionId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-colors"
              title="Copy Submission ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Please keep your Submission ID for future reference and tracking.
          </span>
        </div>
      </div>

      {/* Generated Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gov-blue" />
            <span>Generated Statutory Objection Letters</span>
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
            3 Letters Created
          </span>
        </div>

        {/* Letters Cards */}
        <div className="space-y-4">
          {/* Letter 1 Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-gov-blue rounded border border-blue-200">
                  OBJECTION LETTER 1
                </span>
                <span className="text-xs text-slate-400 font-mono">Board Rules</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Planning and Development Board Rules, 2026
              </h3>
              <p className="text-xs text-slate-500">
                Applicant: {applicant.fullName} | Island: {applicant.island} | Date: {submissionDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={letters[0]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </a>
              <a
                href={letters[0]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </a>
              <button
                onClick={() => handleDownloadLetter(0)}
                disabled={downloading === 1}
                className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === 1 ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Letter 2 Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                  OBJECTION LETTER 2
                </span>
                <span className="text-xs text-slate-400 font-mono">Qualifications Rules</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Chief Town Planner Qualifications Rules, 2026
              </h3>
              <p className="text-xs text-slate-500">
                Applicant: {applicant.fullName} | Island: {applicant.island} | Date: {submissionDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={letters[1]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </a>
              <a
                href={letters[1]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </a>
              <button
                onClick={() => handleDownloadLetter(1)}
                disabled={downloading === 2}
                className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === 2 ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Letter 3 Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  OBJECTION LETTER 3
                </span>
                <span className="text-xs text-slate-400 font-mono">Authority Rules</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Planning and Development Authority Rules, 2026
              </h3>
              <p className="text-xs text-slate-500">
                Applicant: {applicant.fullName} | Island: {applicant.island} | Date: {submissionDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={letters[2]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </a>
              <a
                href={letters[2]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </a>
              <button
                onClick={() => handleDownloadLetter(2)}
                disabled={downloading === 3}
                className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === 3 ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Download All Letters Button */}
        <div className="bg-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-gov-blue shadow-sm">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Download All 3 Letters (PDF)</p>
              <p className="text-xs text-slate-500">
                Download all 3 official legal PDFs with your personal information and signature.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadAll}
            disabled={downloading === 999}
            className="w-full sm:w-auto px-5 py-2.5 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading === 999 ? 'Generating All...' : 'Download All 3 Letters'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation & Tracking Notice */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <ShieldCheck className="w-4 h-4 text-gov-gold" />
          <span>Statutory Acknowledgment</span>
        </div>
        <p>
          {applicant.email ? (
            <>A copy of your submission acknowledgment has been sent to <strong>{applicant.email}</strong>.{' '}</>
          ) : (
            <>Your submission acknowledgment has been successfully registered with mobile number <strong>{applicant.phone}</strong>.{' '}</>
          )}
          You can track this submission at any time using your Submission ID <strong>{submissionId}</strong>.
        </p>
        <div className="pt-2">
          <Link to={`/track?id=${submissionId}`} className="text-gov-blue hover:underline font-semibold flex items-center gap-1">
            <span>Go to public tracking page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
