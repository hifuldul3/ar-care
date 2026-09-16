import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ConnectionStatus } from './ConnectionStatus';
import { LanguageSelector } from './LanguageSelector';
import { Button } from './Button';

export function Navbar({ connectionQuality = 'ONLINE' }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            AR
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              AR-CARE LINK
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                PROTOTYPE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Frontline Specialist Guidance Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionStatus quality={connectionQuality} />
          <LanguageSelector />
          {user && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="text-xs text-slate-300 font-medium hidden md:inline">
                {user.name} ({user.role})
              </span>
              <Button size="sm" variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
