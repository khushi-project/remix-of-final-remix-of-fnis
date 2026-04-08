const BASE_URL = 'http://localhost:5000/api';

const getToken = (): string | null => localStorage.getItem('token');

const authHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
};

// ─── Auth ────────────────────────────────────────────────────
export const loginAPI = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const registerAPI = async (name: string, email: string, password: string, role: string) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(res);
};

// ─── Diet Plans ──────────────────────────────────────────────
export const createDietAPI = async (diet: { clientId: string; meals: { name: string; calories: number; time: string }[] }) => {
  const res = await fetch(`${BASE_URL}/diet`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(diet),
  });
  return handleResponse(res);
};

export const getDietAPI = async (clientId: string) => {
  const res = await fetch(`${BASE_URL}/diet/${clientId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// ─── Meals ───────────────────────────────────────────────────
export const logMealAPI = async (meal: { name: string; calories: number }) => {
  const res = await fetch(`${BASE_URL}/meals`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(meal),
  });
  return handleResponse(res);
};
