import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Code
} from 'lucide-react';
import {
  getTemplates,
  getTemplateById,
  createTemplateVersion,
  activateTemplateVersion,
  previewTemplate
} from '../../services/api';
import { LetterTemplateItem } from '../../types';

export const AdminTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<LetterTemplateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Selected template for full inspection or editing
  const [selectedLetterNumber, setSelectedLetterNumber] = useState<number>(1);
  const [activeTemplateDetails, setActiveTemplateDetails] = useState<LetterTemplateItem | null>(null);

  // New Version Form State
  const [showNewVersionModal, setShowNewVersionModal] = useState<boolean>(false);
  const [newVersion, setNewVersion] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newContentHtml, setNewContentHtml] = useState<string>('');
  const [activateImmediately, setActivateImmediately] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Live preview state
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const fetchAllTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getTemplates();
      setTemplates(list);

      // Find active template for the selected letter
      const active = list.find(t => t.letter_number === selectedLetterNumber && (t.is_active === 1 || t.is_active === true));
      if (active) {
        const fullDetail = await getTemplateById(active.id);
        setActiveTemplateDetails(fullDetail);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTemplates();
  }, [selectedLetterNumber]);

  const handleOpenNewVersion = () => {
    if (!activeTemplateDetails) return;
    const currentVerParts = activeTemplateDetails.version.split('.');
    const nextVer = `${currentVerParts[0]}.${parseInt(currentVerParts[1] || '0', 10) + 1}`;
    setNewVersion(nextVer);
    setNewTitle(activeTemplateDetails.title);
    setNewSubject(activeTemplateDetails.subject);
    setNewContentHtml(activeTemplateDetails.content_html || '');
    setActivateImmediately(false);
    setShowNewVersionModal(true);
  };

  const handleSaveNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion || !newTitle || !newContentHtml) {
      alert('Version, title, and HTML content are required');
      return;
    }

    setIsSaving(true);
    try {
      await createTemplateVersion({
        letterNumber: selectedLetterNumber,
        title: newTitle,
        version: newVersion,
        subject: newSubject,
        contentHtml: newContentHtml,
        activateImmediately
      });
      setShowNewVersionModal(false);
      await fetchAllTemplates();
      alert(`Version ${newVersion} created successfully! (Existing historical submissions remain frozen)`);
    } catch (err: any) {
      alert(err.message || 'Failed to save new template version');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm('Are you sure you want to activate this template version for all FUTURE submissions? Existing historical submissions will remain frozen.')) {
      return;
    }
    try {
      await activateTemplateVersion(id);
      await fetchAllTemplates();
    } catch (err: any) {
      alert(err.message || 'Failed to activate version');
    }
  };

  const handleLivePreview = async (htmlToPreview: string) => {
    try {
      const preview = await previewTemplate(htmlToPreview);
      setPreviewHtml(preview);
      setShowPreviewModal(true);
    } catch (err: any) {
      alert(err.message || 'Preview generation failed');
    }
  };

  const currentLetterTemplates = templates.filter(t => t.letter_number === selectedLetterNumber);

  return (
    <div className="space-y-6">
      {/* Title & Warning Banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Letter Template Versioning</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage statutory objection letter templates. Strict immutability guarantee: changes only affect future submissions.
        </p>
      </div>

      {/* Immutability Guarantee Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-gov-blue shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-gov-blue">Strict Submission Immutability Guarantee</p>
          <p>
            When you create or activate a new template version, all previously submitted objection letters remain frozen with the exact text and PDF that existed at the moment the applicant submitted.
          </p>
        </div>
      </div>

      {/* Letter Selector Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSelectedLetterNumber(1)}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            selectedLetterNumber === 1
              ? 'border-gov-blue text-gov-blue bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Letter 1: Planning & Development Board Rules</span>
        </button>

        <button
          onClick={() => setSelectedLetterNumber(2)}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            selectedLetterNumber === 2
              ? 'border-gov-blue text-gov-blue bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Letter 2: Chief Town Planner Qualifications Rules</span>
        </button>

        <button
          onClick={() => setSelectedLetterNumber(3)}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            selectedLetterNumber === 3
              ? 'border-gov-blue text-gov-blue bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Letter 3: Planning & Development Authority Rules</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Versions List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900">Version History</h2>
            <button
              onClick={handleOpenNewVersion}
              className="px-3 py-1 bg-gov-blue hover:bg-gov-navy text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Version</span>
            </button>
          </div>

          <div className="space-y-2">
            {currentLetterTemplates.map(tmpl => {
              const isActive = tmpl.is_active === 1 || tmpl.is_active === true;
              return (
                <div
                  key={tmpl.id}
                  className={`p-3 rounded-lg border text-xs space-y-2 ${
                    isActive ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-mono text-slate-800">
                      Version {tmpl.version}
                    </span>
                    {isActive ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivate(tmpl.id)}
                        className="text-[11px] text-gov-blue hover:underline font-semibold"
                      >
                        Activate for Future
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Created: {new Date(tmpl.created_at).toLocaleDateString('en-GB')} by {tmpl.created_by || 'system'}
                  </p>

                  <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      onClick={async () => {
                        const detail = await getTemplateById(tmpl.id);
                        setActiveTemplateDetails(detail);
                      }}
                      className="text-slate-600 hover:text-gov-blue font-medium text-[11px]"
                    >
                      Inspect Source
                    </button>
                    <span>•</span>
                    <button
                      onClick={async () => {
                        const detail = await getTemplateById(tmpl.id);
                        if (detail.content_html) handleLivePreview(detail.content_html);
                      }}
                      className="text-slate-600 hover:text-gov-blue font-medium text-[11px]"
                    >
                      Preview with Sample
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Template Inspection View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          {activeTemplateDetails ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {activeTemplateDetails.title}
                    </h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 font-bold">
                      v{activeTemplateDetails.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Letter {selectedLetterNumber} Template
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (activeTemplateDetails.content_html) {
                      handleLivePreview(activeTemplateDetails.content_html);
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Formatted</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Template Content (HTML & Placeholders):</span>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto max-h-96 font-mono leading-relaxed whitespace-pre-wrap">
                  {activeTemplateDetails.content_html}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a template to view details
            </div>
          )}
        </div>
      </div>

      {/* New Version Modal */}
      {showNewVersionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">
              Create New Version for Letter {selectedLetterNumber}
            </h3>

            <form onSubmit={handleSaveNewVersion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Version Tag:
                  </label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={e => setNewVersion(e.target.value)}
                    required
                    placeholder="e.g. 1.1 or 2.0"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Title:
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Template HTML with Placeholders:
                </label>
                <textarea
                  rows={10}
                  value={newContentHtml}
                  onChange={e => setNewContentHtml(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue bg-slate-50"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activateImmediately}
                    onChange={e => setActivateImmediately(e.target.checked)}
                    className="w-4 h-4 text-gov-blue rounded"
                  />
                  <span className="text-xs font-semibold text-amber-900">
                    Activate immediately for all FUTURE submissions (Does not affect existing submissions)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewVersionModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gov-blue hover:bg-gov-navy text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Live Formatted Preview with Sample Islander Data
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div
              className="p-6 bg-slate-50 border rounded-lg font-serif text-xs leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
