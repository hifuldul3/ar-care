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

export function SpecialistCases() {
  const { token } = useContext(AuthContext);
  const { connectionQuality } = useNetworkStatus();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi('/cases', {}, token);
        setCases(data || []);
      } catch (e) {
        console.error('Failed to load specialist cases:', e);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role="specialist" />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🩺 Incoming & Active Cases</span>
            </h2>
            <p className="text-xs text-slate-400">Review patient records, AI flag reasons, and initiate live remote sessions.</p>
          </div>

          <Card title="Cases Requiring Specialist Attention">
            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading cases...</p>
            ) : cases.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No cases found.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {cases.map((c) => (
                  <div key={c.caseId} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400">{c.caseId}</span>
                        <span className="font-semibold text-slate-200">{c.patient?.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          c.priority === 'URGENT PROFESSIONAL REVIEW' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {c.priority}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Symptoms: {c.symptoms} | Created: {formatDate(c.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/specialist/case/${c.caseId}`)}>
                        DETAILS
                      </Button>
                      <Button size="sm" variant="success" onClick={() => navigate(`/specialist/session/${c.caseId}`)}>
                        JOIN SESSION
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
