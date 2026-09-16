import React from 'react';
import { Card } from './Card';
import { formatTimeOnly } from '../utils/formatters';

export function Timeline({ actions = [] }) {
  const getActionBadge = (actionType) => {
    switch (actionType) {
      case 'CASE_CREATED': return { label: 'Case Created', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' };
      case 'VITALS_UPDATED': return { label: 'Vitals Recorded', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'AI_ANALYSIS_COMPLETED': return { label: 'AI Analyzed', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'SPECIALIST_REQUESTED': return { label: 'Specialist Requested', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'AR_MARKER_CREATED': return { label: 'AR Instruction Sent', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' };
      case 'AR_MARKER_ACKNOWLEDGED': return { label: 'Worker Acknowledged', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'AR_MARKER_COMPLETED': return { label: 'Instruction Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      default: return { label: actionType, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <Card title="Action Audit Timeline">
      {actions.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No action events recorded yet.</p>
      ) : (
        <div className="space-y-3 relative pl-4 border-l-2 border-slate-700">
          {actions.map((item, idx) => {
            const badge = getActionBadge(item.action);
            return (
              <div key={item.id || idx} className="relative group">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-slate-900" />
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{formatTimeOnly(item.timestamp)}</span>
                </div>
                {item.metadata?.message && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                    "{item.metadata.message}"
                  </p>
                )}
                <span className="text-[10px] text-slate-500 capitalize">
                  By: {item.role || 'user'} ({item.userId || 'system'})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
