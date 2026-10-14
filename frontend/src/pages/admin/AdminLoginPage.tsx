import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { adminLogin } from '../../services/api';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('Admin@2026!');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminLogin(username.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gov-navy text-white p-6 text-center border-b-2 border-gov-gold">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-gov-gold/50">
            <Lock className="w-6 h-6 text-gov-gold" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin & Officer Portal</h1>
          <p className="text-xs text-sky-200 mt-1">
            Department of Urban Development, UT of Lakshadweep
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username or Official Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="admin or officer email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gov-blue hover:bg-gov-navy text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In Securely</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Evaluation Default Access:</p>
            <p>Username: <code className="bg-white px-1 py-0.5 rounded border font-mono">admin</code></p>
            <p>Password: <code className="bg-white px-1 py-0.5 rounded border font-mono">Admin@2026!</code></p>
          </div>
        </form>
      </div>
    </div>
  );
};
