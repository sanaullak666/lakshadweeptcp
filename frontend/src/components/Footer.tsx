import React from 'react';
import { Mail, MapPin, AlertCircle, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs sm:text-sm mt-auto border-t border-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statutory Notice */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-gov-gold" />
              <span>Statutory Legal Notice</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Issued in response to Public Notice for Pre-Legislative Consultation,
              F.No.16/1/2022-UD(Vol.1) dated 18.09.2026, pursuant to Section 153(7) of the
              Lakshadweep Town and Country Planning and Development Regulation, 2026 (Regulation No. 8 of 2026).
            </p>
          </div>

          {/* Addressed Authority */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Submissions Addressed To</h4>
            <div className="text-xs space-y-1 text-slate-300">
              <p className="font-semibold text-white">The Director (Urban Development)</p>
              <p>Department of Urban Development</p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gov-gold" />
                <span>Union Territory of Lakshadweep Administration, Kavaratti – 682 555</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gov-gold" />
                <a href="mailto:lak-ud@utl.gov.in" className="text-sky-400 hover:underline">lak-ud@utl.gov.in</a>
              </p>
            </div>
          </div>

          {/* Three Letters Notice */}
          <div className="space-y-2 bg-slate-800/50 p-3.5 rounded border border-slate-700">
            <div className="flex items-center space-x-1.5 text-gov-gold font-semibold text-xs uppercase tracking-wide">
              <AlertCircle className="w-4 h-4" />
              <span>Three Objection Letters Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              A single form submission automatically generates and timestamps three legally separate objection letters:
              (1) Planning & Development Board Rules, (2) Chief Town Planner Qualifications Rules, and (3) Planning & Development Authority Rules.
            </p>
          </div>
        </div>

        {/* LSA Central Committee Branding & Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2 shrink-0">
              <img
                src="/lsalogo.jpeg"
                alt="Lakshadweep Students Association Logo"
                className="w-10 h-10 rounded-full border-2 border-gov-gold object-cover shadow-sm bg-white z-10"
              />
              <img
                src="/lsaflag.png"
                alt="Lakshadweep Students Association Flag"
                className="w-8 h-8 rounded-full border-2 border-slate-700 object-cover shadow-sm bg-white"
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">
                Lakshadweep Students Association Central Committee
              </p>
              <p className="text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} Lakshadweep Students Association Central Committee. All rights reserved.
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-xs space-y-0.5">
            <p className="text-slate-300 font-medium">Public Pre-Legislative Consultation Initiative</p>
            <p className="text-slate-500 text-[11px]">Empowering Lakshadweep Islanders &bull; End-to-End Immutability</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
