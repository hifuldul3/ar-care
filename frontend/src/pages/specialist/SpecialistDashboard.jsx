import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchApi } from '../../services/api';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { formatDate } from '../../utils/formatters';

export function SpecialistDashboard() {
  const { token, user } = useContext(AuthContext);
  const { connectionQuality } = useNetworkStatus();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await fetchApi('/cases', {}, token);
        setCases(data || []);
      } catch (err) {
        console.error('Failed to load specialist cases:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadCases();
  }, [token]);

  const urgentCases = cases.filter((c) => c.priority === 'URGENT PROFESSIONAL REVIEW');
  const waitingRequests = cases.filter((c) => c.status === 'WAITING_FOR_SPECIALIST');
  const activeSessions = cases.filter((c) => c.status === 'IN_SESSION');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role="specialist" />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-sky-900/40 border border-indigo-500/30 p-5 rounded-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🩺 Specialist Command Center</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Welcome, {user?.name || 'Dr. Specialist'}. Monitor frontline cases, join live WebRTC sessions, and annotate AR markers.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-rose-500/40 p-4 rounded-xl">
              <span className="text-xs text-rose-300 font-medium block">Urgent Cases</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{urgentCases.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 p-4 rounded-xl">
              <span className="text-xs text-amber-300 font-medium block">Waiting Requests</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{waitingRequests.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-emerald-500/40 p-4 rounded-xl">
              <span className="text-xs text-emerald-300 font-medium block">Active Sessions</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{activeSessions.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Total Consultations</span>
              <span className="text-2xl font-black text-slate-200 mt-1 block">{cases.length}</span>
            </div>
          </div>

          {/* Incoming Specialist Requests List */}
          <Card title="Incoming Frontline Specialist Requests">
            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading incoming requests...</p>
            ) : cases.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No cases currently requesting specialist review.</p>
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
                        Chief Complaint: <span className="text-slate-200 font-medium">{c.symptoms}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>SpO2: {c.vitals?.spO2}%</span>
                        <span>HR: {c.vitals?.heartRate} bpm</span>
                        <span>Worker: {c.workerId || 'Frontline'}</span>
                        <span>Time: {formatDate(c.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/specialist/case/${c.caseId}`)}
                      >
                        REVIEW CASE
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => navigate(`/specialist/session/${c.caseId}`)}
                      >
                        🎥 JOIN SESSION
                      </Button>
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
