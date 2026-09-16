import React from 'react';

export function ConnectionStatus({ quality = 'ONLINE' }) {
  const configs = {
    ONLINE: { label: 'ONLINE', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-500 animate-pulse' },
    LIMITED: { label: 'LIMITED CONNECTION', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-500 animate-pulse' },
    OFFLINE: { label: 'OFFLINE MODE', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', dot: 'bg-rose-500' }
  };

  const current = configs[quality] || configs.ONLINE;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${current.bg} ${current.text} ${current.border}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </div>
  );
}
