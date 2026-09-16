import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { CameraView } from '../../components/CameraView';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { VoiceInput } from '../../components/VoiceInput';
import { fetchApi } from '../../services/api';
import { useCamera } from '../../hooks/useCamera';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function SpecialistSession() {
  const { caseId } = useParams();
  const { token, user } = useContext(AuthContext);
  const { connectionQuality } = useNetworkStatus();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected coordinate for new AR marker modal
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [arMessage, setArMessage] = useState('');
  const [textInstruction, setTextInstruction] = useState('');
  const [sending, setSending] = useState(false);
  const [autoSendVoice, setAutoSendVoice] = useState(true);

  const sessionId = `SESSION-${caseId}`;

  // Camera preview hook for specialist stream
  const {
    stream,
    isDemoMode,
    startCamera,
    startDemoPreview,
    stopCamera
  } = useCamera();

  // Handle incoming WebSocket messages
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
    } else if (data.type === 'ACKNOWLEDGED' || data.type === 'COMPLETED') {
      setAnnotations((prev) =>
        prev.map((a) => (a.annotationId === data.annotationId ? { ...a, status: data.type } : a))
      );
    }
  }, []);

  const { connectionState, sendMessage } = useWebSocket(
    sessionId,
    token,
    user?.id || 'S001',
    'specialist',
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
        console.error('Failed to join specialist session:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token && caseId) {
      initSession();
      startDemoPreview();
    }
  }, [token, caseId]);

  const handleCameraClick = (coords) => {
    setSelectedCoords(coords);
    setArMessage('Observe chest movement');
  };

  const handleSendAR = async () => {
    if (!selectedCoords || !arMessage.trim()) return;
    setSending(true);

    try {
      const payload = {
        caseId,
        sessionId,
        x: selectedCoords.x,
        y: selectedCoords.y,
        message: arMessage
      };

      const annRecord = await fetchApi('/annotations', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, token);

      sendMessage({
        type: 'AR_MARKER',
        annotationId: annRecord.annotationId,
        caseId,
        sessionId,
        x: annRecord.x,
        y: annRecord.y,
        message: annRecord.message,
        createdBy: user?.id || 'S001',
        status: 'PENDING',
        createdAt: annRecord.createdAt
      });

      setAnnotations((prev) => [...prev, annRecord]);
      setSelectedCoords(null);
      setArMessage('');
    } catch (e) {
      alert('Failed to send AR marker');
    } finally {
      setSending(false);
    }
  };

  const dispatchInstruction = async (messageText) => {
    if (!messageText || !messageText.trim()) return;
    try {
      await fetchApi(`/sessions/${sessionId}/instructions`, {
        method: 'POST',
        body: JSON.stringify({ message: messageText })
      }, token);

      sendMessage({
        type: 'INSTRUCTION',
        id: `INST-${Date.now()}`,
        caseId,
        sessionId,
        message: messageText,
        status: 'PENDING'
      });
      setTextInstruction('');
    } catch (e) {
      console.error('Failed to send instruction:', e);
    }
  };

  const handleVoiceTranscript = (spokenText) => {
    setTextInstruction((prev) => {
      const updated = prev ? `${prev} ${spokenText}` : spokenText;
      if (autoSendVoice) {
        dispatchInstruction(updated);
        return '';
      }
      return updated;
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Joining Specialist Session...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Session Bar */}
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
              Specialist AR Guidance Studio | Case <strong className="text-slate-200">{caseId}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => navigate(`/specialist/case/${caseId}`)}>
              ← Case Summary
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Worker Camera Feed & AR Target Picker (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <CameraView
              stream={stream}
              isDemoMode={isDemoMode}
              role="specialist"
              annotations={annotations}
              onCameraClick={handleCameraClick}
            />

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-sky-400 font-semibold">
                🎯 Click anywhere on camera feed to place visual AR marker
              </span>
              <span className="text-slate-400">
                {annotations.length} Active Marker(s)
              </span>
            </div>
          </div>

          {/* Right Panel: Voice Dictation, Text Instructions & AR Markers */}
          <div className="space-y-4">
            {/* Live Voice Instruction Dictation Panel */}
            <Card title="🎙️ Voice-to-Instruction Dictation">
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Speak into your microphone to convert your spoken words directly into a frontline instruction.
                </p>
                
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <VoiceInput
                    defaultLang="en-US"
                    onTranscript={handleVoiceTranscript}
                  />
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSendVoice}
                      onChange={(e) => setAutoSendVoice(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>Auto-Send</span>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Instruction Text</label>
                  <textarea
                    rows={2}
                    value={textInstruction}
                    onChange={(e) => setTextInstruction(e.target.value)}
                    placeholder="Type or speak into microphone..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 mb-2"
                  />
                  <Button size="sm" variant="primary" className="w-full" onClick={() => dispatchInstruction(textInstruction)}>
                    SEND INSTRUCTION NOW
                  </Button>
                </div>
              </div>
            </Card>

            {/* Active AR Markers List & Real-time Status */}
            <Card title="Active AR Annotations Status">
              {annotations.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No AR markers placed yet. Click on the camera video feed to target an area.
                </p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto text-xs divide-y divide-slate-800">
                  {annotations.map((ann) => (
                    <div key={ann.annotationId} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sky-400">🔴 {ann.annotationId}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          ann.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ann.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {ann.status === 'COMPLETED' ? '✓ COMPLETED' : ann.status}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium my-1">"{ann.message}"</p>
                      <span className="text-[10px] text-slate-500">
                        Target Location: (X: {ann.x}%, Y: {ann.y}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Modal for Creating AR Marker */}
      <Modal
        isOpen={Boolean(selectedCoords)}
        onClose={() => setSelectedCoords(null)}
        title="SEND AR GUIDANCE"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <span className="text-slate-400 block mb-1">Selected Target Location:</span>
            <span className="font-mono text-sky-400 font-bold text-sm">
              X = {selectedCoords?.x}%, Y = {selectedCoords?.y}%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">Instruction Message</label>
              <VoiceInput
                defaultLang="en-US"
                onTranscript={(spokenText) =>
                  setArMessage((prev) => (prev ? `${prev} ${spokenText}` : spokenText))
                }
              />
            </div>
            <input
              type="text"
              value={arMessage}
              onChange={(e) => setArMessage(e.target.value)}
              placeholder="Type or speak into microphone..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedCoords(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendAR} disabled={sending}>
              {sending ? 'SENDING...' : 'SEND'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
