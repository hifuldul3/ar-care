import { fetchApi } from './api';

export async function loginUser(email, password) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getCurrentUser(token) {
  return fetchApi('/auth/me', { method: 'GET' }, token);
}
