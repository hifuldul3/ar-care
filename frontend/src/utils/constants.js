const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (hostname.includes('vercel.app') ? 'https://ar-care-backend.onrender.com'
  : hostname.includes('lhr.life') || hostname.includes('loca.lt') ? `${window.location.protocol}//${hostname}`
  : `http://${hostname}:8000`);

export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL
  || (hostname.includes('vercel.app') ? 'wss://ar-care-backend.onrender.com'
  : hostname.includes('lhr.life') || hostname.includes('loca.lt') ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${hostname}`
  : `ws://${hostname}:8000`);

export const CASE_STATUS = {
  NEW: 'NEW',
  WAITING_FOR_SPECIALIST: 'WAITING_FOR_SPECIALIST',
  IN_SESSION: 'IN_SESSION',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED'
};

export const PRIORITY_LEVELS = {
  URGENT: 'URGENT PROFESSIONAL REVIEW',
  ELEVATED: 'ELEVATED PROFESSIONAL REVIEW',
  ROUTINE: 'ROUTINE PROFESSIONAL REVIEW'
};

export const DEMO_CASE_P001 = {
  caseId: 'P001',
  patient: {
    patientId: 'PT001',
    name: 'Demo Patient',
    age: 52,
    gender: 'Male'
  },
  symptoms: 'Breathing difficulty',
  duration: '1 day',
  medicalHistory: 'Hypertension (Controlled)',
  medication: 'Amlodipine 5mg daily',
  allergies: 'Penicillin (mild rash)',
  notes: 'Patient reports progressive dyspnea since morning.',
  vitals: {
    spO2: 89,
    heartRate: 108,
    respiratoryRate: 26,
    temperature: 37.4,
    bloodPressure: '138/86'
  }
};
