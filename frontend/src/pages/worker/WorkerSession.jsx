import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { CameraView } from '../../components/CameraView';
import { InstructionCard } from '../../components/InstructionCard';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchApi } from '../../services/api';
import { useCamera } from '../../hooks/useCamera';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function WorkerSession() {
  const { caseId } = useParams();
  const { token, user } = useContext(AuthContext);
  const { connectionQuality } = useNetworkStatus();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [textInstructions, setTextInstructions] = useState([]);
  const [loading, setLoading] = useState(true);

  const sessionId = `SESSION-${caseId}`;

  // Camera hook
  const {
    stream,
    isActive: isCameraActive,
    isDemoMode,
    startCamera,
    stopCamera,
    startDemoPreview,
    toggleMic,
    micEnabled
  } = useCamera();

  // WebSocket message handler
  const handleWsMessage = useCallback((data) => {
    if (data.type === 'AR_MARKER') {
      setAnnotations((prev) => {
        const idx = prev.findIndex((a) => a.annotationId === data.annotationId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });
    } else if (data.type === 'INSTRUCTION') {
      setTextInstructions((prev) => [...prev, data]);
    } else if (data.type === 'ACKNOWLEDGED' || data.type === 'COMPLETED') {
      setAnnotations((prev) =>
        prev.map((a) => (a.annotationId === data.annotationId ? { ...a, status: data.type } : a))
      );
    }
  }, []);

  const { connectionState, sendMessage } = useWebSocket(
    sessionId,
    token,
    user?.id || 'W001',
    'worker',
    handleWsMessage
  );

  useEffect(() => {
    async function initSession() {
      try {
        const sData = await fetchApi('/sessions', {
          method: 'POST',
          body: JSON.stringify({ caseId })
        }, token);
        setSession(sData);

        // Fetch existing AR annotations for this case
        const existingAnns = await fetchApi(`/annotations/cases/${caseId}`, {}, token);
        if (existingAnns) {
          setAnnotations(existingAnns);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token && caseId) {
      initSession();
    }
  }, [token, caseId]);

  const handleAcknowledge = async (annotationId) => {
    try {
      await fetchApi(`/annotations/${annotationId}/acknowledge`, { method: 'PUT' }, token);
      sendMessage({
        type: 'ACKNOWLEDGED',
        annotationId,
        caseId,
        sessionId
      });
      setAnnotations((prev) =>
        prev.map((a) => (a.annotationId === annotationId ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (e) {
      console.error('Acknowledge failed:', e);
    }
  };

  const handleComplete = async (annotationId) => {
    try {
      await fetchApi(`/annotations/${annotationId}/complete`, { method: 'PUT' }, token);
      sendMessage({
        type: 'COMPLETED',
        annotationId,
        caseId,
        sessionId
      });
      setAnnotations((prev) =>
        prev.map((a) => (a.annotationId === annotationId ? { ...a, status: 'COMPLETED' } : a))
      );
    } catch (e) {
      console.error('Complete failed:', e);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Connecting Session...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Session Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sky-400 text-lg">{sessionId}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                connectionState === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400'
              }`}>
                WS: {connectionState}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Case ID: <strong className="text-slate-200">{caseId}</strong> | Live AR Guidance Channel
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <Button variant="primary" size="md" onClick={startCamera}>
                📷 START CAMERA
              </Button>
            ) : (
              <Button variant="danger" size="md" onClick={stopCamera}>
                ⏹ STOP CAMERA
              </Button>
            )}
            <Button variant="outline" size="md" onClick={() => navigate(`/worker/case/${caseId}`)}>
              ← Back to Case
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main AR Camera Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <CameraView
              stream={stream}
              isDemoMode={isDemoMode}
              role="worker"
              annotations={annotations}
              onAcknowledge={handleAcknowledge}
              onComplete={handleComplete}
            />

            {/* Camera Controls Bar */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Button size="sm" variant={micEnabled ? 'secondary' : 'danger'} onClick={toggleMic}>
                  {micEnabled ? '🎙 Mic ON' : '🔇 Mic Muted'}
                </Button>
                <Button size="sm" variant="outline" onClick={startDemoPreview}>
                  ⚡ DEMO PREVIEW MODE
                </Button>
              </div>
              <span className="text-slate-400">
                {annotations.length} Active AR Marker(s)
              </span>
            </div>
          </div>

          {/* Right Panel: Incoming Specialist Guidance & Annotations */}
          <div className="space-y-4">
            <Card title="Live Specialist Instructions">
              {textInstructions.length === 0 && annotations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <p>Waiting for specialist to join session and place visual AR markers...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {textInstructions.map((inst) => (
                    <InstructionCard
                      key={inst.id}
                      instruction={inst}
                      role="worker"
                      onAcknowledge={() => {}}
                    />
                  ))}
                  {annotations.map((ann) => (
                    <div key={ann.annotationId} className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sky-400">🔴 AR MARKER RECEIVED</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ann.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ann.status}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium my-1">"{ann.message}"</p>
                      <span className="text-[10px] text-slate-500">Location: X {ann.x}%, Y {ann.y}%</span>
                      <div className="mt-2">
                        {ann.status === 'PENDING' && (
                          <Button size="sm" variant="primary" className="w-full text-xs" onClick={() => handleAcknowledge(ann.annotationId)}>
                            ACKNOWLEDGE
                          </Button>
                        )}
                        {ann.status === 'ACKNOWLEDGED' && (
                          <Button size="sm" variant="success" className="w-full text-xs" onClick={() => handleComplete(ann.annotationId)}>
                            MARK COMPLETED
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
