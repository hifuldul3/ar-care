import React from 'react';
import { Button } from './Button';
import { VoiceInput } from './VoiceInput';

export function ARMarker({ annotation, role, onAcknowledge, onComplete }) {
  const { annotationId, x, y, message, status } = annotation;

  const isPending = status === 'PENDING';
  const isAcknowledged = status === 'ACKNOWLEDGED';
  const isCompleted = status === 'COMPLETED';

  return (
    <div
      style={{ top: `${y}%`, left: `${x}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group pointer-events-auto"
    >
      {/* Pulsing Target Dot */}
      <div className="relative flex items-center justify-center">
        <span className={`absolute w-10 h-10 rounded-full opacity-75 animate-ping ${isCompleted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-white ${isCompleted ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          🔴
        </div>
      </div>

      {/* Marker Annotation Card */}
      <div className="mt-2 bg-slate-900/95 text-slate-100 border border-sky-500/60 rounded-lg p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs font-sans animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-1 mb-1">
          <span className="font-bold text-sky-400">🔴 CHECK HERE</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : isAcknowledged ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {status}
          </span>
        </div>
        <p className="text-slate-200 font-medium mb-2">{message}</p>

        {/* Worker Action Buttons with Voice Acknowledge */}
        {role === 'worker' && (
          <div className="space-y-1.5 pt-1">
            {isPending && (
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="primary" className="w-full text-[11px] py-1" onClick={() => onAcknowledge(annotationId)}>
                  ACKNOWLEDGE
                </Button>
                <div className="scale-90 origin-left">
                  <VoiceInput
                    defaultLang="en-US"
                    onTranscript={(spoken) => {
                      if (spoken) onAcknowledge(annotationId);
                    }}
                  />
                </div>
              </div>
            )}

            {isAcknowledged && (
              <Button size="sm" variant="success" className="w-full text-[11px] py-1" onClick={() => onComplete(annotationId)}>
                MARK COMPLETED
              </Button>
            )}

            {isCompleted && (
              <span className="text-emerald-400 font-bold text-center w-full block py-0.5">
                ✓ INSTRUCTION COMPLETED
              </span>
            )}
          </div>
        )}

        {/* Specialist View Status */}
        {role === 'specialist' && (
          <div className="pt-1 text-[11px]">
            {isCompleted ? (
              <span className="text-emerald-400 font-bold">✓ COMPLETED BY WORKER</span>
            ) : isAcknowledged ? (
              <span className="text-amber-400 font-bold">ACKNOWLEDGED BY WORKER</span>
            ) : (
              <span className="text-rose-400 font-bold">WAITING FOR WORKER ACKNOWLEDGEMENT</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
