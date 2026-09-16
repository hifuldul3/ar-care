import { fetchApi } from './api';

export async function generateCaseReport(caseId, additionalNotes, token) {
  return fetchApi(`/reports/cases/${caseId}/report`, {
    method: 'POST',
    body: JSON.stringify({ caseId, additionalNotes: additionalNotes || '' })
  }, token);
}
