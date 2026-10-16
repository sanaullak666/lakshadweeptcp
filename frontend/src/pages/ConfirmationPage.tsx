import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Eye,
  Printer,
  ArrowRight,
  FileText,
  ShieldCheck,
  AlertCircle,
  Mail,
  Send,
  X,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubmissionResult } from '../types';

export const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionResult = location.state?.submissionResult as SubmissionResult | undefined;

  const [copied, setCopied] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);

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

  const { submissionId, submissionDate, applicant, letters } = submissionResult;

  const emailTarget = 'lak-ud@utl.gov.in';
  const emailSubject = `Objections to Draft TCP Rules 2026 - ${submissionId} - ${applicant.fullName}`;
  const emailBody = `Respected Sir/Madam,\n\nPlease find attached my formal objection letters (Letters 1, 2, and 3) regarding the Draft Lakshadweep Town and Country Planning and Development Rules, 2026.\n\nSubmission Reference ID: ${submissionId}\nApplicant Name: ${applicant.fullName}\nIsland: ${applicant.island}\nSubmission Date: ${submissionDate}\n\nKindly acknowledge receipt of these statutory objection letters.\n\nYours sincerely,\n${applicant.fullName}\n${applicant.phone}`;

  const mailtoUrl = `mailto:${emailTarget}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(submissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailTarget);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(emailSubject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* Modal Popup Window for Mailing Notification */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gov-navy to-gov-blue text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-gov-gold" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gov-gold block">
                    Important Statutory Action Required
                  </span>
                  <h3 className="text-base sm:text-lg font-bold">
                    Email Your Objection Letters to the Department
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-sm">
              <p className="text-slate-600 text-xs sm:text-sm">
                Your 3 statutory objection letters have been registered and signed! Under Section 153(7), you must save each letter and email them directly to the Department of Urban Development to ensure they are formally recorded on official record.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-amber-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>2 Easy Steps to Complete Submission:</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong>Save Each Letter:</strong> Click the <span className="text-gov-blue font-semibold">Print</span> button on Letter 1, 2, and 3 below and choose <span className="font-semibold">"Save as PDF"</span> in your browser's print window (or click <span className="font-semibold">View</span> to inspect).
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong>Email the Saved Letters to:</strong>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 border border-amber-300 rounded text-xs select-all">
                          {emailTarget}
                        </span>
                        <button
                          onClick={handleCopyEmail}
                          className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Line Helper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Recommended Email Subject:</span>
                  <button
                    onClick={handleCopySubject}
                    className="text-gov-blue hover:underline text-[11px] font-medium flex items-center gap-1"
                  >
                    {copiedSubject ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 break-all">
                  {emailSubject}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={mailtoUrl}
                  className="flex-1 py-2.5 px-4 bg-gov-blue hover:bg-gov-navy text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <Send className="w-4 h-4" />
                  <span>Open Email App to Send</span>
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                >
                  View & Print Letters Below
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Statutory Mail Submission Notice Banner */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Mail className="w-4 h-4 text-amber-600" />
            <span>MANDATORY STEP: Email Saved Letters to Administration</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-gov-blue hover:underline font-semibold self-start sm:self-auto flex items-center gap-1"
          >
            <span>View Full Instructions Window</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          To ensure your legal objections are officially counted, please <strong>Print/Save each of the 3 letters below as PDF</strong>, and email them to the official email address:
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">Official Email:</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm select-all">
              {emailTarget}
            </span>
          </div>

          <button
            onClick={handleCopyEmail}
            className="px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
          </button>

          <a
            href={mailtoUrl}
            className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Email</span>
          </a>
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
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-gov-blue" />
                <span>View</span>
              </a>
              <a
                href={letters[0]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </a>
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
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-gov-blue" />
                <span>View</span>
              </a>
              <a
                href={letters[1]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </a>
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
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-gov-blue" />
                <span>View</span>
              </a>
              <a
                href={letters[2]?.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-gov-blue hover:bg-gov-navy text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </a>
            </div>
          </div>
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
