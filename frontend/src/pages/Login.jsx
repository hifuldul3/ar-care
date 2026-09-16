import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { LanguageSelector } from '../components/LanguageSelector';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { connectionQuality } = useNetworkStatus();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/specialist/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials or server unavailable.');
    }
  };

  const handleDemoWorker = () => {
    setEmail('worker@arcare.demo');
    setPassword('worker123');
  };

  const handleDemoSpecialist = () => {
    setEmail('doctor@arcare.demo');
    setPassword('doctor123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/15 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 max-w-5xl mx-auto w-full">
        <ConnectionStatus quality={connectionQuality} />
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md z-10 relative">
        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl border border-sky-400/30">
            AR
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AR-CARE LINK</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{t('tagline')}</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@arcare.demo"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 text-sm" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : t('loginBtn')}
          </Button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 border-t border-slate-800 pt-5">
          <span className="block text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            HACKATHON QUICK LOGIN
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs py-2 bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-sky-400 font-bold"
              onClick={() => {
                handleDemoWorker();
                setTimeout(() => handleLogin(), 100);
              }}
            >
              <span>👤</span> {t('demoWorker')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs py-2 bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-indigo-400 font-bold"
              onClick={() => {
                handleDemoSpecialist();
                setTimeout(() => handleLogin(), 100);
              }}
            >
              <span>🩺</span> {t('demoSpecialist')}
            </Button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-[10px] text-slate-500">
            AR-CARE LINK decision-support prototype. Synthetic demo data only.
          </p>
        </div>
      </div>
    </div>
  );
}
