import React from 'react';
import { Card } from './Card';

export function VitalCard({ vitals }) {
  if (!vitals) return null;

  const { spO2, heartRate, respiratoryRate, temperature, bloodPressure } = vitals;

  const isLowSpO2 = spO2 <= 94;
  const isHighHR = heartRate >= 100;
  const isHighRR = respiratoryRate >= 20;

  return (
    <Card title="Baseline Vitals">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className={`p-3 rounded-lg border ${isLowSpO2 ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-slate-900/60 border-slate-700/60 text-slate-200'}`}>
          <span className="text-slate-400 block mb-1">SpO2 Oxygen</span>
          <span className="text-xl font-bold">{spO2}%</span>
          {isLowSpO2 && <span className="block text-[10px] text-rose-400 mt-0.5">⚠️ Low Oxygen</span>}
        </div>

        <div className={`p-3 rounded-lg border ${isHighHR ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900/60 border-slate-700/60 text-slate-200'}`}>
          <span className="text-slate-400 block mb-1">Heart Rate</span>
          <span className="text-xl font-bold">{heartRate} <span className="text-xs font-normal">bpm</span></span>
          {isHighHR && <span className="block text-[10px] text-amber-400 mt-0.5">Elevated</span>}
        </div>

        <div className={`p-3 rounded-lg border ${isHighRR ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-slate-900/60 border-slate-700/60 text-slate-200'}`}>
          <span className="text-slate-400 block mb-1">Resp. Rate</span>
          <span className="text-xl font-bold">{respiratoryRate} <span className="text-xs font-normal">rpm</span></span>
          {isHighRR && <span className="block text-[10px] text-rose-400 mt-0.5">Tachypnea</span>}
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-200">
          <span className="text-slate-400 block mb-1">Blood Pressure</span>
          <span className="text-xl font-bold">{bloodPressure}</span>
          <span className="block text-[10px] text-slate-400 mt-0.5">mmHg</span>
        </div>

        <div className="col-span-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-200 flex justify-between items-center">
          <span className="text-slate-400">Body Temperature:</span>
          <span className="font-bold text-sm">{temperature} °C</span>
        </div>
      </div>
    </Card>
  );
}
