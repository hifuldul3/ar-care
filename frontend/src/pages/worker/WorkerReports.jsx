import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchApi } from '../../services/api';
import { generateCaseReport } from '../../services/report';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { formatDate } from '../../utils/formatters';

export function WorkerReports() {
  const { token } = useContext(AuthContext);
  const { connectionQuality } = useNetworkStatus();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi('/cases', {}, token);
        setCases(data || []);
      } catch (err) {
        console.error('Failed to load cases for reports:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  const handleDownload = async (caseId) => {
    try {
      const res = await generateCaseReport(caseId, '', token);
      window.open(`http://localhost:8000/reports/download/${res.filename}`, '_blank');
    } catch (e) {
      alert('Report generation error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role="worker" />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📄 Case Reports</span>
            </h2>
            <p className="text-xs text-slate-400">Generate and download official PDF summaries for completed patient assessments.</p>
          </div>

          <Card title="Generated Reports & Case Summaries">
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading reports...</p>
            ) : cases.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No cases available for report generation.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {cases.map((c) => (
                  <div key={c.caseId} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-sky-400 mr-2">{c.caseId}</span>
                      <span className="font-semibold text-slate-200">{c.patient?.name}</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">Created: {formatDate(c.createdAt)}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(c.caseId)}>
                      📥 DOWNLOAD PDF
                    </Button>
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
