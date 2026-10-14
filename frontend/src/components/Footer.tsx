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

          {/* Dual Letter Notice */}
          <div className="space-y-2 bg-slate-800/50 p-3.5 rounded border border-slate-700">
            <div className="flex items-center space-x-1.5 text-gov-gold font-semibold text-xs uppercase tracking-wide">
              <AlertCircle className="w-4 h-4" />
              <span>Two Objection Letters Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              A single form submission automatically generates and timestamps two legally separate objection letters:
              (1) Planning & Development Board Rules, and (2) Chief Town Planner Qualifications Rules.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© 2026 Union Territory of Lakshadweep Public Participation System. All rights reserved.</p>
          <p>Protected by end-to-end immutability and digital audit logs.</p>
        </div>
      </div>
    </footer>
  );
};
