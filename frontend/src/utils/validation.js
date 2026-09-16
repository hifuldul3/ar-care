export function validateVitals(vitals) {
  const errors = {};
  if (vitals.spO2 < 50 || vitals.spO2 > 100) {
    errors.spO2 = 'SpO2 must be between 50% and 100%';
  }
  if (vitals.heartRate < 30 || vitals.heartRate > 250) {
    errors.heartRate = 'Heart rate must be between 30 and 250 bpm';
  }
  if (vitals.respiratoryRate < 5 || vitals.respiratoryRate > 70) {
    errors.respiratoryRate = 'Respiratory rate must be between 5 and 70 rpm';
  }
  if (vitals.temperature < 30 || vitals.temperature > 45) {
    errors.temperature = 'Temperature must be between 30°C and 45°C';
  }
  if (!/^\d{2,3}\/\d{2,3}$/.test(vitals.bloodPressure)) {
    errors.bloodPressure = 'Blood pressure must be format Systolic/Diastolic (e.g. 120/80)';
  }
  return errors;
}
