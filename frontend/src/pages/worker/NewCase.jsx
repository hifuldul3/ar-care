import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { VoiceInput } from '../../components/VoiceInput';
import { fetchApi } from '../../services/api';
import { validateVitals } from '../../utils/validation';
import { DEMO_CASE_P001 } from '../../utils/constants';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

export function NewCase() {
  const [step, setStep] = useState(1);
  const { token } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { connectionQuality, isOnline } = useNetworkStatus();
  const { addToQueue } = useOfflineQueue(token, isOnline);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    caseId: 'P001',
    patient: { patientId: 'PT001', name: 'Demo Patient', age: 52, gender: 'Male' },
    symptoms: 'Breathing difficulty',
    duration: '1 day',
    medicalHistory: 'Hypertension (Controlled)',
    medication: 'Amlodipine 5mg daily',
    allergies: 'Penicillin (mild rash)',
    notes: 'Patient reports progressive dyspnea.',
    vitals: { spO2: 89, heartRate: 108, respiratoryRate: 26, temperature: 37.4, bloodPressure: '138/86' }
  });

  const [vitalsErrors, setVitalsErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const populateDemoData = () => {
    setFormData(DEMO_CASE_P001);
    setVitalsErrors({});
  };

  const handlePatientChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      patient: { ...prev.patient, [field]: val }
    }));
  };

  const handleVitalsChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: val }
    }));
  };

  const handleNext = () => {
    if (step === 3) {
      const errs = validateVitals(formData.vitals);
      if (Object.keys(errs).length > 0) {
        setVitalsErrors(errs);
        return;
      }
    }
    setVitalsErrors({});
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);

    try {
      if (isOnline) {
        const result = await fetchApi('/cases', {
          method: 'POST',
          body: JSON.stringify(formData)
        }, token);
        navigate(`/worker/case/${result.caseId}`);
      } else {
        // Save to offline IndexedDB queue when network is offline
        await addToQueue('CASE', formData);
        alert('Offline mode active. Case saved locally and will auto-synchronize when connection returns.');
        navigate('/worker/dashboard');
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to create case.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role="worker" />

        <main className="flex-1 p-4 md:p-6 max-w-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>➕ Create New Case</span>
              </h2>
              <p className="text-xs text-slate-400">Step {step} of 4</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500/20"
              onClick={populateDemoData}
            >
              ⚡ AUTO-FILL DEMO CASE P001
            </Button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between text-xs font-semibold">
            {['1. Patient', '2. Symptoms', '3. Vitals', '4. Review'].map((label, idx) => (
              <div
                key={label}
                className={`flex-1 text-center py-2 border-b-2 ${
                  step === idx + 1
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : step > idx + 1
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-slate-800 text-slate-600'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {submitError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
              {submitError}
            </div>
          )}

          {/* STEP 1: PATIENT INFO */}
          {step === 1 && (
            <Card title="Step 1: Patient Information">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Case ID</label>
                  <input
                    type="text"
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.patient.name}
                    onChange={(e) => handlePatientChange('name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={formData.patient.age}
                      onChange={(e) => handlePatientChange('age', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                    <select
                      value={formData.patient.gender}
                      onChange={(e) => handlePatientChange('gender', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: SYMPTOMS & HISTORY */}
          {step === 2 && (
            <Card title="Step 2: Symptoms & Medical History">
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Chief Symptoms</label>
                    <VoiceInput
                      lang="ta-IN"
                      onTranscript={(text) =>
                        setFormData((prev) => ({
                          ...prev,
                          symptoms: prev.symptoms ? `${prev.symptoms} ${text}` : text
                        }))
                      }
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Describe symptoms or use voice microphone above..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Medical History</label>
                  <input
                    type="text"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="e.g. Hypertension, Diabetes"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Current Medication</label>
                    <input
                      type="text"
                      value={formData.medication}
                      onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Allergies</label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3: VITALS */}
          {step === 3 && (
            <Card title="Step 3: Baseline Vitals">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={formData.vitals.spO2}
                    onChange={(e) => handleVitalsChange('spO2', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                  {vitalsErrors.spO2 && <span className="text-rose-400 text-[11px]">{vitalsErrors.spO2}</span>}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={formData.vitals.heartRate}
                    onChange={(e) => handleVitalsChange('heartRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                  {vitalsErrors.heartRate && <span className="text-rose-400 text-[11px]">{vitalsErrors.heartRate}</span>}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Respiratory Rate (rpm)</label>
                  <input
                    type="number"
                    value={formData.vitals.respiratoryRate}
                    onChange={(e) => handleVitalsChange('respiratoryRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                  {vitalsErrors.respiratoryRate && <span className="text-rose-400 text-[11px]">{vitalsErrors.respiratoryRate}</span>}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.vitals.bloodPressure}
                    onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                  {vitalsErrors.bloodPressure && <span className="text-rose-400 text-[11px]">{vitalsErrors.bloodPressure}</span>}
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Body Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-100"
                  />
                  {vitalsErrors.temperature && <span className="text-rose-400 text-[11px]">{vitalsErrors.temperature}</span>}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <Card title="Step 4: Review Entered Clinical Data">
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <p><strong>Case ID:</strong> {formData.caseId}</p>
                  <p><strong>Patient:</strong> {formData.patient.name}, {formData.patient.age} y/o ({formData.patient.gender})</p>
                  <p><strong>Symptoms:</strong> {formData.symptoms}</p>
                  <p><strong>Vitals:</strong> SpO2: {formData.vitals.spO2}% | HR: {formData.vitals.heartRate} bpm | RR: {formData.vitals.respiratoryRate} rpm | BP: {formData.vitals.bloodPressure} | Temp: {formData.vitals.temperature}°C</p>
                  <p><strong>Medical History:</strong> {formData.medicalHistory || 'None'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrev}>
                Back
              </Button>
            ) : <div />}

            {step < 4 ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'CREATING CASE...' : 'CREATE CASE'}
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
