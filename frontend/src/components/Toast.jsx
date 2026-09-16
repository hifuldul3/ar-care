import React from 'react';

export function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const styles = {
    info: 'bg-sky-500/90 text-white border-sky-400',
    success: 'bg-emerald-600/90 text-white border-emerald-400',
    error: 'bg-rose-600/90 text-white border-rose-400',
    warning: 'bg-amber-500/90 text-slate-950 border-amber-400'
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md flex items-center gap-3 text-sm font-semibold animate-bounce-short ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-80 hover:opacity-100 font-bold ml-2">
          ✕
        </button>
      )}
    </div>
  );
}
