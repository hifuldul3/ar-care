import React from 'react';
import { Button } from './Button';

export function InstructionCard({ instruction, role, onAcknowledge }) {
  const { id, message, status, timestamp } = instruction;

  return (
    <div className="bg-slate-900 border border-sky-500/40 rounded-lg p-3 text-xs shadow-md mb-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
        <span className="font-bold text-sky-400">🩺 SPECIALIST INSTRUCTION</span>
        <span className="text-[10px] text-slate-500">{timestamp ? new Date(timestamp).toLocaleTimeString() : ''}</span>
      </div>
      <p className="text-slate-200 font-medium text-sm mb-3">{message}</p>
      {role === 'worker' && status === 'PENDING' && (
        <Button size="sm" variant="primary" onClick={() => onAcknowledge(id)}>
          ACKNOWLEDGE INSTRUCTION
        </Button>
      )}
      {status === 'ACKNOWLEDGED' && (
        <span className="text-emerald-400 font-bold block text-xs">✓ ACKNOWLEDGED</span>
      )}
    </div>
  );
}
