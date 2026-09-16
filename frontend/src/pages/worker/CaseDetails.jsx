import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PatientCard } from '../../components/PatientCard';
import { VitalCard } from '../../components/VitalCard';
import { Timeline } from '../../components/Timeline';
import { fetchApi } from '../../services/api';
import { generateCaseReport } from '../../services/report';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function CaseDetails() {
  const { caseId } = useParams();
  const { token, user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { connectionQuality } = useNetworkStatus();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  const loadCase = async () => {
    try {
      const data = await fetchApi(`/cases/${caseId}`, {}, token);
      setCaseData(data);
      const tData = await fetchApi(`/cases/${caseId}/timeline`, {}, token);
      setTimeline(tData || []);
    } catch (err) {
      setError('Failed to load case details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && caseId) {
      loadCase();
    }
  }, [token, caseId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await fetchApi(`/cases/${caseId}/analyze`, { method: 'POST' }, token);
      await loadCase();
    } catch (err) {
      setError('AI assessment failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRequestSpecialist = async () => {
    setRequesting(true);
    try {
      await fetchApi(`/cases/${caseId}/specialist-request`, {
        method: 'POST',
        body: JSON.stringify({ urgencyReason: 'Worker requested specialist remote review' })
      }, token);
      await loadCase();
    } catch (err) {
      setError('Specialist request failed.');
    } finally {
      setRequesting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await generateCaseReport(caseId, '', token);
      window.open(`http://localhost:8000/reports/download/${res.filename}`, '_blank');
    } catch (err) {
      alert('Could not download PDF report.');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading case {caseId}...</div>;
  if (!caseData) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Case not found.</div>;

  const ai = caseData.aiAssessment || {};
  const isUrgent = caseData.priority === 'URGENT PROFESSIONAL REVIEW';
  const isWaiting = caseData.status === 'WAITING_FOR_SPECIALIST';
  const isInSession = caseData.status === 'IN_SESSION';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role={user?.role || 'worker'} />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white font-mono">{caseData.caseId}</h2>
                <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                  isUrgent ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {caseData.priority}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-semibold">
                  STATUS: {caseData.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Patient: <strong className="text-slate-200">{caseData.patient?.name}</strong> ({caseData.patient?.age} y/o {caseData.patient?.gender})
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isInSession ? (
                <Button variant="success" size="md" onClick={() => navigate(`/worker/session/${caseId}`)}>
                  🎥 JOIN LIVE SESSION
                </Button>
              ) : isWaiting ? (
                <div className="bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs px-3 py-2 rounded-lg font-bold">
                  ⏳ WAITING FOR SPECIALIST TO JOIN
                </div>
              ) : (
                <Button variant="danger" size="md" onClick={handleRequestSpecialist} disabled={requesting}>
                  {requesting ? 'REQUESTING...' : '🚨 REQUEST SPECIALIST'}
                </Button>
              )}
              <Button variant="outline" size="md" onClick={handleDownloadPDF}>
                📄 PDF REPORT
              </Button>
            </div>
          </div>

          {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">{error}</div>}

          {/* Completeness Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Case Data Completeness</span>
              <span className="text-sky-400 font-bold">{caseData.completeness || 75}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${caseData.completeness || 75}%` }}
              />
            </div>
          </div>

          {/* AI Decision Support Panel */}
          <Card title="AI ASSISTED CLINICAL ASSESSMENT" headerAction={
            <Button size="sm" variant="primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'ANALYZING...' : 'ANALYZE CASE'}
            </Button>
          }>
            {ai.priority ? (
              <div className="space-y-4 text-xs">
                {/* Explainable AI: WHY WAS THIS FLAGGED */}
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-rose-400 text-sm mb-2 flex items-center gap-1.5">
                    🔍 WHY WAS THIS FLAGGED?
                  </h4>
                  <ul className="space-y-1 text-slate-200">
                    {ai.reasons?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* MISSING INFORMATION */}
                {ai.missing_information && ai.missing_information.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                    <h4 className="font-bold text-amber-400 text-sm mb-1.5">⚠️ MISSING INFORMATION</h4>
                    <p className="text-slate-300">
                      {ai.missing_information.join(', ')}
                    </p>
                  </div>
                )}

                {/* NEXT STEP */}
                <div className="bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-sky-400 text-sm mb-1">➡️ RECOMMENDED NEXT STEP</h4>
                  <p className="text-slate-200 font-semibold">{ai.recommended_action}</p>
                </div>

                <p className="text-[10px] text-slate-500 italic text-center pt-2">
                  {ai.disclaimer || t('disclaimer')}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-3">Click "ANALYZE CASE" to trigger rule-based decision support evaluation.</p>
                <Button size="sm" variant="primary" onClick={handleAnalyze}>
                  ANALYZE CASE
                </Button>
              </div>
            )}
          </Card>

          {/* Patient Details & Baseline Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PatientCard patient={caseData.patient} symptoms={caseData.symptoms} priority={caseData.priority} />
            <VitalCard vitals={caseData.vitals} />
          </div>

          {/* Action Audit Timeline */}
          <Timeline actions={timeline} />
        </main>
      </div>
    </div>
  );
}
