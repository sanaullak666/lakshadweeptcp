import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Shield, CheckCircle, Scale, Building2, UserCog, Calendar, MapPin, Download } from 'lucide-react';
import { ISLANDS_LIST } from '../types';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-gov-navy to-gov-blue text-white py-12 md:py-16 px-4 border-b-4 border-gov-gold relative overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-gov-gold/20 text-gov-gold border border-gov-gold/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Official Pre-Legislative Consultation Notice</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Draft Lakshadweep Town and Country Planning & Development Rules, 2026
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed mb-6">
            Submit your formal objections and suggestions under Section 153(7) of the Lakshadweep Town and Country
            Planning and Development Regulation, 2026 (Regulation No. 8 of 2026) regarding the proposed rules.
          </p>

          {/* Triple Letters Highlight Pill */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl max-w-2xl mb-8 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gov-gold text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              3
            </div>
            <div className="text-sm">
              <span className="font-bold text-gov-gold uppercase tracking-wide text-xs block mb-0.5">
                Three-In-One Submission Mechanism
              </span>
              <p className="text-slate-100">
                You only fill your personal details <strong>once</strong>. The system will automatically create and timestamp <strong>three legally separate objection letters</strong> to ensure all three statutory draft rules are independently addressed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/submit"
              className="px-6 py-3.5 bg-gov-gold hover:bg-yellow-400 text-slate-950 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base group"
            >
              <span>Submit Your Objections</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/track"
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-lg border border-white/30 transition-colors text-sm sm:text-base"
            >
              Track Existing Submission
            </Link>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Building2 className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* The Three Distinct Objections Cards */}
      <section className="container mx-auto max-w-5xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            The Three Separate Statutory Objection Letters
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            These objections are grounded in the authoritative legal drafts published for the Lakshadweep archipelago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-gov-blue transition-all shadow-sm hover:shadow-md p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-blue-50 text-gov-blue font-bold text-[11px] rounded border border-blue-200">
                  OBJECTION LETTER 1
                </span>
                <span className="text-[11px] text-slate-400 font-mono">F.No.16/1/2022-UD(Vol.1)</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Planning and Development Board Rules, 2026
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Concerns the governing board that prepares the Regional Plan, Master Plans, and hears appeals against
                island planning authorities.
              </p>

              <div className="bg-slate-50 p-2.5 rounded text-xs space-y-1 border border-slate-100">
                <p className="font-semibold text-slate-700 text-[11px]">Key Substantive Objections:</p>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Defective consultation without local language translations</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Non-consultation with NCST & elected Panchayats</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rules 3 & 4: Unilateral term extensions & removal of members</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 6: Decisions without quorum after 10-min adjournment</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 7: 90-day clock without ecological safeguards</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>9-row amendment table</span>
              <span className="font-semibold text-gov-blue">Authoritative Draft</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-gov-blue transition-all shadow-sm hover:shadow-md p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold text-[11px] rounded border border-amber-200">
                  OBJECTION LETTER 2
                </span>
                <span className="text-[11px] text-slate-400 font-mono">F.No.16/1/2022-UD(Vol.1)(1)</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Chief Town Planner Qualifications Rules, 2026
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Concerns the qualifications, recruitment, and tenure of the officer who decides island-wide land questions,
                zoning, and transfer permissions.
              </p>

              <div className="bg-slate-50 p-2.5 rounded text-xs space-y-1 border border-slate-100">
                <p className="font-semibold text-slate-700 text-[11px]">Key Substantive Objections:</p>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 3(b) ultra vires Sec 3: Unchecked power to relax qualifications</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Arbitrary power bypassing Articles 14, 16 & 320(3)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Ignores island, coastal & atoll ecological functions</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>No ST reservation or Malayalam/Mahl requirement</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Proposes revised Rule 3 with UPSC consultation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>UPSC Copy-To recipient</span>
              <span className="font-semibold text-amber-700">Authoritative Draft</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-gov-blue transition-all shadow-sm hover:shadow-md p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-bold text-[11px] rounded border border-purple-200">
                  OBJECTION LETTER 3
                </span>
                <span className="text-[11px] text-slate-400 font-mono">F.No.16/1/2022-UD(Vol.1)(3)</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Planning and Development Authority Rules, 2026
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Concerns Authorities that prepare land-use registers, Master Plans, levy development charges, and hold summary eviction powers.
              </p>

              <div className="bg-slate-50 p-2.5 rounded text-xs space-y-1 border border-slate-100">
                <p className="font-semibold text-slate-700 text-[11px]">Key Substantive Objections:</p>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 21 summary eviction from "any land" on opinion (ultra vires Sec 90)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 11 Form A: Mainland categories ignoring coconut & Pandaram land</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 16: Architect registration burdening ordinary home repair & re-roofing</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rule 24: Fixes development rates usurping local Authority power</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Includes 2 tables: Omitted protective rules & 21-rule amendment table</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>2 full legal tables</span>
              <span className="font-semibold text-purple-700">Authoritative Draft</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / 3 Step Process */}
      <section className="bg-slate-100 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-center text-slate-900 mb-8">
            How the Single Submission Process Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Enter Details Once</h3>
              <p className="text-xs text-slate-600">
                Provide your name, house, island, PIN, email, phone, and date once. No repeating yourself.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Sign & Review</h3>
              <p className="text-xs text-slate-600">
                Draw your signature on screen or upload an image. Preview all three full objection letters in real time.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-gov-blue font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Three Formal Letters Generated</h3>
              <p className="text-xs text-slate-600">
                Get your official Submission ID, download all three A4 PDFs individually, or download a combined ZIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Islands Covered */}
      <section className="container mx-auto max-w-5xl px-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-gov-blue" />
            <h3 className="font-bold text-slate-900 text-base">Covered Islands of Lakshadweep</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            This objection submission portal is open to residents across all inhabited and notified islands of the Union Territory:
          </p>
          <div className="flex flex-wrap gap-2">
            {ISLANDS_LIST.map((island) => (
              <span
                key={island}
                className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full border border-slate-200"
              >
                {island}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
