import React from 'react';

export function Loading({ message = 'Loading AR-CARE LINK...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 gap-3">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
