import React from 'react';
import { Card } from './Card';

export function PatientCard({ patient, symptoms, priority }) {
  if (!patient) return null;

  return (
    <Card title="Patient Profile">
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
          <span className="text-slate-400">Patient ID:</span>
          <span className="font-mono font-bold text-sky-400">{patient.patientId || 'PT001'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Name:</span>
          <span className="font-semibold text-slate-100">{patient.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Age / Gender:</span>
          <span className="text-slate-200">{patient.age} y/o ({patient.gender})</span>
        </div>
        {symptoms && (
          <div className="border-t border-slate-700/50 pt-2">
            <span className="text-slate-400 block mb-1">Chief Complaint:</span>
            <p className="text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2 rounded text-xs">
              {symptoms}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
