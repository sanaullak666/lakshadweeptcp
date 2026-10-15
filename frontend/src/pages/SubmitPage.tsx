import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Home,
  MapPin,
  Calendar,
  PenTool,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { SignatureCapture } from '../components/SignatureCapture';
import { ApplicantFormData, ISLANDS_LIST, IslandType, RelationshipType } from '../types';
import { submitObjections, getPublicSettings, checkApplicantDuplicate } from '../services/api';

export const SubmitPage: React.FC = () => {
  const navigate = useNavigate();

  // Current Step (1: Personal, 2: Place & Date, 3: Signature, 4: Preview & Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePreviewTab, setActivePreviewTab] = useState<number>(1);

  // Default formatted date: DD.MM.YYYY
  const getFormattedToday = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  const [formData, setFormData] = useState<ApplicantFormData>({
    fullName: '',
    relationship: 'S/o',
    parentSpouseName: '',
    houseName: '',
    island: '',
    pinCode: '',
    email: '',
    phone: '',
    place: '',
    date: getFormattedToday(),
    signatureType: 'drawn',
    signatureData: '',
    signatureFile: null,
    idempotencyKey: ''
  });

  const [allowManualDate, setAllowManualDate] = useState<boolean>(true);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string>('');
  const [confirmedDeclaration, setConfirmedDeclaration] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ exists: boolean; field?: 'phone' | 'email'; message?: string; submissionId?: string } | null>(null);

  // Generate unique idempotency key once on component load
  useEffect(() => {
    const key = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setFormData(prev => ({ ...prev, idempotencyKey: key }));

    // Fetch server settings
    getPublicSettings()
      .then(settings => {
        if (settings.allow_manual_date_edit === 'false') {
          setAllowManualDate(false);
        }
      })
      .catch(() => {});
  }, []);

  // Check duplicate on phone blur
  const handlePhoneBlur = async () => {
    const cleanPhone = formData.phone.replace(/\D/g, '').trim();
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) return;

    setIsCheckingDuplicate(true);
    try {
      const res = await checkApplicantDuplicate(cleanPhone, '');
      if (res.exists) {
        setDuplicateInfo(res);
        setErrors(prev => ({
          ...prev,
          phone: res.message || 'This mobile number has already submitted an objection. Duplicate entries are not allowed.'
        }));
      } else if (duplicateInfo?.field === 'phone') {
        setDuplicateInfo(null);
      }
    } catch {
      // Ignore background check failure
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Check duplicate on email blur (if email is entered)
  const handleEmailBlur = async () => {
    const emailVal = formData.email.trim();
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) return;

    setIsCheckingDuplicate(true);
    try {
      const res = await checkApplicantDuplicate('', emailVal);
      if (res.exists) {
        setDuplicateInfo(res);
        setErrors(prev => ({
          ...prev,
          email: res.message || 'This email address has already submitted an objection. Duplicate entries are not allowed.'
        }));
      } else if (duplicateInfo?.field === 'email') {
        setDuplicateInfo(null);
      }
    } catch {
      // Ignore background check failure
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Update place automatically when island changes if place is empty
  const handleIslandChange = (island: IslandType) => {
    setFormData(prev => ({
      ...prev,
      island,
      place: prev.place ? prev.place : island.toUpperCase()
    }));
    if (errors.island) setErrors(prev => ({ ...prev, island: '' }));
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.parentSpouseName.trim()) errs.parentSpouseName = 'Parent or Spouse name is required';
    if (!formData.houseName.trim()) errs.houseName = 'House Name is required';
    if (!formData.island) errs.island = 'Please select your Island';

    if (!formData.pinCode.trim()) {
      errs.pinCode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
      errs.pinCode = 'Must be a 6-digit PIN code (e.g. 682555)';
    }

    // Email is OPTIONAL: only validate format if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    // Phone is MANDATORY
    const cleanPhone = formData.phone.replace(/\D/g, '').trim();
    if (!cleanPhone) {
      errs.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.place.trim()) errs.place = 'Place of signing is required';
    if (!formData.date.trim()) {
      errs.date = 'Date is required';
    } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(formData.date.trim())) {
      errs.date = 'Date must follow DD.MM.YYYY format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.signatureType === 'drawn' && !formData.signatureData) {
      errs.signature = 'Please draw your handwritten signature on the canvas.';
    } else if (formData.signatureType === 'uploaded') {
      if (!formData.signatureFile) {
        errs.signature = 'Please upload an image of your signature.';
      } else if (formData.signatureFile.size > 150 * 1024) {
        const sizeKb = Math.round(formData.signatureFile.size / 1024);
        errs.signature = `Signature file size is ${sizeKb} KB. Maximum allowed size is 150 KB. Please upload a smaller image.`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;

      // Verify phone and (if provided) email duplicate before advancing
      setIsCheckingDuplicate(true);
      try {
        const res = await checkApplicantDuplicate(formData.phone, formData.email);
        if (res.exists) {
          setDuplicateInfo(res);
          if (res.field === 'phone') {
            setErrors(prev => ({
              ...prev,
              phone: res.message || 'This mobile number has already submitted an objection. Duplicate entries are not allowed.'
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              email: res.message || 'This email address has already submitted an objection. Duplicate entries are not allowed.'
            }));
          }
          setIsCheckingDuplicate(false);
          return;
        }
      } catch {
        // Proceed on network error, backend will catch during final submission
      } finally {
        setIsCheckingDuplicate(false);
      }

      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedDeclaration) {
      setSubmitError('Please confirm the declaration checkbox before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await submitObjections(formData);
      // Navigate to confirmation with result in state
      navigate('/confirmation', { state: { submissionResult: result } });
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while generating your objection letters. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-gov-gold uppercase tracking-wider">
              Online Public Participation
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Submit Objections & Suggestions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Draft Lakshadweep Town and Country Planning and Development Rules, 2026
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-gov-navy max-w-xs">
            <span className="font-bold block text-gov-blue">⚡ Single Form = Three Letters</span>
            Your submission will automatically generate Objection Letters 1, 2, and 3.
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-6">
          {[
            { num: 1, title: 'Personal Details', icon: User },
            { num: 2, title: 'Place & Date', icon: Calendar },
            { num: 3, title: 'Signature', icon: PenTool },
            { num: 4, title: 'Review & Submit', icon: FileCheck }
          ].map(step => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;
            return (
              <div
                key={step.num}
                className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-gov-blue font-bold border border-blue-200'
                    : isCompleted
                    ? 'text-emerald-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${
                    isActive
                      ? 'bg-gov-blue text-white shadow'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gov-blue" />
                <span>Step 1: Applicant Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details once. These will be automatically inserted into the sender headers of both objection letters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name of Applicant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.G. SANAULLA K / MOHAMMED KASIM"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Relationship & Parent/Spouse Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.relationship}
                  onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue bg-white"
                >
                  <option value="S/o">S/o (Son of)</option>
                  <option value="D/o">D/o (Daughter of)</option>
                  <option value="W/o">W/o (Wife of)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Spouse Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.G. CHERIYAKOYA P / ATTAKOYA"
                  value={formData.parentSpouseName}
                  onChange={e => setFormData({ ...formData, parentSpouseName: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.parentSpouseName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.parentSpouseName && (
                  <p className="text-xs text-red-500 mt-1">{errors.parentSpouseName}</p>
                )}
              </div>

              {/* House Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  House Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.G. PANDARAM HOUSE / BEACH VIEW"
                  value={formData.houseName}
                  onChange={e => setFormData({ ...formData, houseName: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.houseName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.houseName && <p className="text-xs text-red-500 mt-1">{errors.houseName}</p>}
              </div>

              {/* Island */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Island (Union Territory of Lakshadweep) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.island}
                  onChange={e => handleIslandChange(e.target.value as IslandType)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue bg-white ${
                    errors.island ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Island --</option>
                  {ISLANDS_LIST.map(isl => (
                    <option key={isl} value={isl}>
                      {isl}
                    </option>
                  ))}
                </select>
                {errors.island && <p className="text-xs text-red-500 mt-1">{errors.island}</p>}
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 682555"
                  value={formData.pinCode}
                  onChange={e => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.pinCode ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.pinCode && <p className="text-xs text-red-500 mt-1">{errors.pinCode}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {isCheckingDuplicate && (
                    <span className="text-[11px] text-gov-blue flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onBlur={handlePhoneBlur}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: cleaned });
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    if (duplicateInfo?.field === 'phone') setDuplicateInfo(null);
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.phone && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-800">Duplicate Submission Detected</p>
                      <p>{errors.phone}</p>
                      {duplicateInfo?.field === 'phone' && duplicateInfo?.submissionId && (
                        <p className="pt-1 text-slate-700">
                          Previous Submission Reference ID: <span className="font-mono font-bold text-slate-900">{duplicateInfo.submissionId}</span>.{' '}
                          <Link
                            to={`/track?id=${duplicateInfo.submissionId}`}
                            className="text-gov-blue font-semibold underline hover:text-blue-800"
                          >
                            Track your submission status &rarr;
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {!errors.phone && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    10-digit mobile number. Each mobile number can only submit once.
                  </p>
                )}
              </div>

              {/* Email Address (OPTIONAL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  {isCheckingDuplicate && (
                    <span className="text-[11px] text-gov-blue flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  placeholder="e.g. applicant@example.com (optional)"
                  value={formData.email}
                  onBlur={handleEmailBlur}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value.toLowerCase() });
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    if (duplicateInfo?.field === 'email') setDuplicateInfo(null);
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.email && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-800">Duplicate Submission Detected</p>
                      <p>{errors.email}</p>
                      {duplicateInfo?.field === 'email' && duplicateInfo?.submissionId && (
                        <p className="pt-1 text-slate-700">
                          Previous Submission Reference ID: <span className="font-mono font-bold text-slate-900">{duplicateInfo.submissionId}</span>.{' '}
                          <Link
                            to={`/track?id=${duplicateInfo.submissionId}`}
                            className="text-gov-blue font-semibold underline hover:text-blue-800"
                          >
                            Track your submission status &rarr;
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {!errors.email && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Optional. If provided, submission confirmation and document download links will be sent here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PLACE AND DATE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gov-blue" />
                <span>Step 2: Place & Date of Signing</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                The date is auto-formatted as required by the statutory objection templates (DD.MM.YYYY).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Place of Signing <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.G. KAVARATTI / AMINI / AGATTI"
                  value={formData.place}
                  onChange={e => setFormData({ ...formData, place: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.place ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.place && <p className="text-xs text-red-500 mt-1">{errors.place}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Submission (DD.MM.YYYY) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.date}
                  disabled={!allowManualDate}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    !allowManualDate ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'
                  } ${errors.date ? 'border-red-400 bg-red-50/30' : 'border-slate-300'}`}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                {!allowManualDate && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Date is automatically locked to current system date as per administration policy.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Preview of Date and Place block:</p>
              <p className="font-serif">Place: {formData.place || '____________'}</p>
              <p className="font-serif">Date: {formData.date || '__.__.2026'}</p>
            </div>
          </div>
        )}

        {/* STEP 3: SIGNATURE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-gov-blue" />
                <span>Step 3: Signature Capture</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your signature will be placed above your typed name in both objection letters.
              </p>
            </div>

            <SignatureCapture
              signatureType={formData.signatureType}
              onTypeChange={type => setFormData({ ...formData, signatureType: type })}
              onDrawnSignatureChange={dataUrl => {
                setFormData(prev => ({ ...prev, signatureData: dataUrl }));
                setSignaturePreviewUrl(dataUrl);
                if (errors.signature) setErrors(prev => ({ ...prev, signature: '' }));
              }}
              onUploadedFileChange={(file, previewUrl) => {
                setFormData(prev => ({ ...prev, signatureFile: file }));
                setSignaturePreviewUrl(previewUrl);
                if (errors.signature) setErrors(prev => ({ ...prev, signature: '' }));
              }}
              initialSignatureData={signaturePreviewUrl}
            />

            {errors.signature && (
              <p className="text-xs text-red-500 font-medium">{errors.signature}</p>
            )}
          </div>
        )}

        {/* STEP 4: PREVIEW & FINAL DECLARATION */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-gov-blue" />
                <span>Step 4: Triple Letter Inspection & Confirmation</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Inspect all three letters below. Your personal information has been accurately substituted into all three documents.
              </p>
            </div>

            {/* Letter Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActivePreviewTab(1)}
                className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activePreviewTab === 1
                    ? 'border-gov-blue text-gov-blue bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Letter 1</span>
                <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(Board)</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab(2)}
                className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activePreviewTab === 2
                    ? 'border-gov-blue text-gov-blue bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Letter 2</span>
                <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(Planner)</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab(3)}
                className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activePreviewTab === 3
                    ? 'border-gov-blue text-gov-blue bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Letter 3</span>
                <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(Authority)</span>
              </button>
            </div>

            {/* Simulated Live Letter Document Container */}
            <div className="border border-slate-300 rounded-lg bg-white p-6 md:p-8 max-h-[460px] overflow-y-auto shadow-inner font-serif text-xs md:text-sm leading-normal text-black space-y-3">
              <div className="text-[10pt] text-slate-500 mb-2 border-b pb-1 font-serif">
                Page 1 of {activePreviewTab === 1 ? '9' : (activePreviewTab === 2 ? '5' : '16')}
              </div>

              {activePreviewTab === 1 && (
                <div className="text-center mb-4">
                  <p className="font-bold text-sm md:text-base uppercase tracking-wide m-0">
                    OBJECTIONS AND SUGGESTIONS
                  </p>
                  <p className="font-bold text-xs md:text-sm m-0">
                    to the draft Lakshadweep Town and Country Planning and Development (Planning and Development Board) Rules, 2026
                  </p>
                </div>
              )}

              {/* Sender Block */}
              <div className="space-y-0.5">
                <p className="font-bold">From:</p>
                <p>{formData.fullName || '………………………'}</p>
                <p>{formData.relationship} {formData.parentSpouseName || '______________'}</p>
                <p>{formData.houseName ? `${formData.houseName}, ` : ''}{formData.island ? `${formData.island}, ` : ''}Union Territory of Lakshadweep – {formData.pinCode || '……'}</p>
                <p>Email: {formData.email || '………………………'}</p>
                <p>Phone: {formData.phone || '………………………'}</p>
              </div>

              {/* Recipient Block */}
              <div className="pt-2 space-y-0.5">
                <p className="font-bold">To:</p>
                <p>The Director (Urban Development)</p>
                <p>Department of Urban Development, Union Territory of Lakshadweep Administration</p>
                <p>Kavaratti – 682 555 (email: lak-ud@utl.gov.in)</p>
              </div>

              {/* Mode, Subject & Reference */}
              <div className="pt-2 space-y-1.5 text-justify">
                <p><strong>Mode:</strong> By email and by registered post with acknowledgment due</p>
                <p>
                  <strong>Subject:</strong> Objections and suggestions under Section 153(7) of the Lakshadweep Town and Country Planning and Development Regulation, 2026 (Regulation No. 8 of 2026) to the {
                    activePreviewTab === 1
                      ? 'draft Lakshadweep Town and Country Planning and Development (Planning and Development Board) Rules, 2026 – F.No.16/1/2022-UD(Vol.1)'
                      : activePreviewTab === 2
                      ? 'draft Lakshadweep Town and Country Planning and Development (Chief Town Planner Qualifications) Rules, 2026 – F.No.16/1/2022-UD(Vol.1)(1)'
                      : 'draft Lakshadweep Town and Country Planning and Development (Planning and Development Authority) Rules, 2026 – F.No.16/1/2022-UD(Vol.1)(3)'
                  } –objection – reg.
                </p>
                <p>
                  <strong>Reference:</strong> Public Notice for Pre-Legislative Consultation, {
                    activePreviewTab === 1
                      ? 'F.No.16/1/2022-UD(Vol.1)'
                      : activePreviewTab === 2
                      ? 'F.No.16/1/2022-UD(Vol.1)(1)'
                      : 'F. No.16/1/2022-UD(Vol.1)(3)'
                  } dated 18.09.2026, issued by the Director (Urban Development), inviting objections within 30 days.
                </p>
              </div>

              {/* Salutation & Body Snippet */}
              <div className="pt-2 space-y-2 text-justify">
                <p>Sir,</p>
                <p>
                  1. The undersigned is a resident of Lakshadweep and a member of a Scheduled Tribe notified for this Union Territory. The undersigned had no part in framing the draft Rules and submits these objections in response to the Public Notice and within the 30 days it allows.
                </p>
                {activePreviewTab === 1 ? (
                  <p>
                    2. The draft Rules govern the Lakshadweep Planning and Development Board. The Board directs the preparation of the Regional Plan, Master Plans and town planning schemes for every island, and hears appeals against Planning and Development Authorities (Sections 8, 12, 13, 49 and 118). The draft Rules therefore affect the land, homes and livelihood of every islander.
                  </p>
                ) : activePreviewTab === 2 ? (
                  <p>
                    2. The Chief Town Planner decides land questions for the whole Union Territory. The officer is Member Secretary of the Planning and Development Board (Section 4(2)(r)) and prepares and notifies the Regional Plan (Sections 10, 13 and 15)...
                  </p>
                ) : (
                  <p>
                    2. The draft Rules govern the Planning and Development Authorities. These Authorities prepare the land use map and register, the Master Plan and town planning schemes for each planning area; grant or refuse permission for every building operation, including re-roofing; levy development charges; and evict occupants (Sections 26, 29, 32, 48, 90 and 115). The draft Rules would unilaterally decide how every islander's land is recorded, charged, regulated if notified as such.
                  </p>
                )}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 italic my-2 font-sans">
                  ℹ️ Full unabridged statutory objections, numbered paragraphs, preliminary points, specific grounds, legal table of amendments, and concluding requests will be rendered verbatim into your final generated official PDF.
                </div>
              </div>

              {/* Signature & Closing Block */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-end gap-4">
                  <div className="space-y-1 text-left">
                    <p>Place: {formData.place || '______________'}</p>
                    <p>Date: {formData.date || '    .10.2026'}</p>
                  </div>
                  <div className="text-left min-w-[180px] space-y-1">
                    <p>Yours faithfully,</p>
                    <div className="h-14 my-1 flex items-center justify-start">
                      {signaturePreviewUrl ? (
                        <img
                          src={signaturePreviewUrl}
                          alt=""
                          className="max-h-14 max-w-[180px] object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 italic text-xs font-sans">[Signature Image Here]</span>
                      )}
                    </div>
                    <p className="font-bold">({formData.fullName || '………………………'})</p>
                  </div>
                </div>
              </div>

              {/* Copy to */}
              <div className="pt-3 border-t text-xs space-y-0.5">
                <p className="font-bold">Copy to:</p>
                <p>1. The Administrator, Union Territory of Lakshadweep, Kavaratti</p>
                <p>2. The Chairperson, District Panchayat, Lakshadweep, Kavaratti</p>
                <p>3. The Chairperson, National Commission for Scheduled Tribes, New Delhi (for consultation under Article 338A(9))</p>
                <p>4. The Secretary, Ministry of Home Affairs (Union Territories Division), New Delhi</p>
                {activePreviewTab === 2 && (
                  <p>5. The Secretary, Union Public Service Commission, New Delhi (Article 320(3))</p>
                )}
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedDeclaration}
                  onChange={e => {
                    setConfirmedDeclaration(e.target.checked);
                    if (submitError) setSubmitError('');
                  }}
                  className="mt-1 w-4 h-4 text-gov-blue border-slate-300 rounded focus:ring-gov-blue"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium">
                  I confirm that the personal information and signature provided by me are correct and that I wish to submit these three objection letters.
                </span>
              </label>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Submission Blocked</span>
                    <p className="mt-0.5">{submitError}</p>
                  </div>
                </div>
                {submitError.toLowerCase().includes('already submitted') && (
                  <div className="pt-2 pl-7 border-t border-red-200/60 flex items-center gap-2">
                    <span className="text-slate-700">Already submitted your objection?</span>
                    <Link to="/track" className="underline font-bold text-gov-blue hover:text-blue-800">
                      Track your status here &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-gov-blue hover:bg-gov-navy text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !confirmedDeclaration}
              className="px-8 py-3 bg-gov-emerald hover:bg-emerald-700 text-white text-sm sm:text-base font-bold rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting & Generating 3 Letters...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  <span>Submit All 3 Objections</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
