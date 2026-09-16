import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchApi } from '../../services/api';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { formatDate } from '../../utils/formatters';

export function WorkerDashboard() {
  const { token, user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { connectionQuality } = useNetworkStatus();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await fetchApi('/cases', {}, token);
        setCases(data || []);
      } catch (err) {
        setError('Could not load cases from server.');
      } finally {
        setLoading(false);
      }
    }
    if (token) loadCases();
  }, [token]);

  const urgentCases = cases.filter((c) => c.priority === 'URGENT PROFESSIONAL REVIEW');
  const waitingCases = cases.filter((c) => c.status === 'WAITING_FOR_SPECIALIST');
  const activeCases = cases.filter((c) => c.status !== 'RESOLVED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role="worker" />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-900/40 via-slate-900 to-indigo-900/40 border border-sky-500/30 p-5 rounded-2xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>👋 Welcome, {user?.name || 'Worker'}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Frontline Assistance Portal • Initiate patient assessments & request remote specialist AR guidance.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="bg-sky-500 hover:bg-sky-400 font-extrabold text-slate-950 shadow-lg"
              onClick={() => navigate('/worker/new-case')}
            >
              <span>➕</span> {t('createCase')}
            </Button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Active Cases</span>
              <span className="text-2xl font-black text-sky-400 mt-1 block">{activeCases.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-rose-500/30 p-4 rounded-xl">
              <span className="text-xs text-rose-300 font-medium block">Urgent Reviews</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{urgentCases.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-xl">
              <span className="text-xs text-amber-300 font-medium block">Pending Requests</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{waitingCases.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-emerald-400 font-medium block">Total Cases</span>
              <span className="text-2xl font-black text-slate-200 mt-1 block">{cases.length}</span>
            </div>
          </div>

          {/* Recent Cases List */}
          <Card title="Recent Cases">
            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading cases...</p>
            ) : cases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400 mb-3">No active cases created yet.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/worker/new-case')}>
                  Create Demo Case P001
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {cases.map((c) => (
                  <div key={c.caseId} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 p-2 rounded-lg transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400 text-sm">{c.caseId}</span>
                        <span className="font-semibold text-slate-200 text-sm">{c.patient?.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          c.priority === 'URGENT PROFESSIONAL REVIEW'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>
                          {c.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Symptoms: <span className="text-slate-200">{c.symptoms}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>SpO2: {c.vitals?.spO2}%</span>
                        <span>HR: {c.vitals?.heartRate} bpm</span>
                        <span>Time: {formatDate(c.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/worker/case/${c.caseId}`)}
                      >
                        {t('openCase')}
                      </Button>
                      {c.status === 'IN_SESSION' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => navigate(`/worker/session/${c.caseId}`)}
                        >
                          JOIN SESSION
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
