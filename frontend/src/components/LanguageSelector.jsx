import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export function LanguageSelector({ className = '' }) {
  const { lang, changeLanguage } = useContext(LanguageContext);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' }
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs text-slate-400">🌐</span>
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-sky-500"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
