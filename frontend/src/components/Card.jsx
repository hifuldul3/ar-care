import React from 'react';

export function Card({ title, children, className = '', headerAction }) {
  return (
    <div className={`bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg backdrop-blur-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
