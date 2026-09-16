import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ role = 'worker' }) {
  const location = useLocation();

  const workerLinks = [
    { path: '/worker/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/worker/new-case', label: 'Create Case', icon: '➕' },
    { path: '/worker/offline-queue', label: 'Offline Queue', icon: '💾' },
    { path: '/worker/reports', label: 'Reports', icon: '📄' }
  ];

  const specialistLinks = [
    { path: '/specialist/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/specialist/cases', label: 'Incoming Cases', icon: '🩺' },
    { path: '/specialist/reports', label: 'Case Reports', icon: '📄' }
  ];

  const links = role === 'worker' ? workerLinks : specialistLinks;

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-4 shrink-0">
      <div className="mb-4 px-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          {role === 'worker' ? 'Frontline Worker Panel' : 'Specialist Portal'}
        </span>
      </div>
      <nav className="flex md:flex-col gap-1 overflow-x-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
