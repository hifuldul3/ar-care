import { fetchApi } from './api';

export async function processSyncBatch(items, token) {
  return fetchApi('/sync', {
    method: 'POST',
    body: JSON.stringify({ items })
  }, token);
}
