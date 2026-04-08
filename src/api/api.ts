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

const isNetworkError = (err: any) =>
  err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');

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

// ─── Users (Admin) ───────────────────────────────────────────
export const getAllClientsAPI = async () => {
  const res = await fetch(`${BASE_URL}/users/clients`, { headers: authHeaders() });
  return handleResponse(res);
};

export const getAllTrainersAPI = async () => {
  const res = await fetch(`${BASE_URL}/users/trainers`, { headers: authHeaders() });
  return handleResponse(res);
};

// ─── Trainer Assignment (Admin) ──────────────────────────────
export const assignTrainerAPI = async (clientId: string, trainerId: string) => {
  const res = await fetch(`${BASE_URL}/admin/assign-trainer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ clientId, trainerId }),
  });
  return handleResponse(res);
};

export const unassignTrainerAPI = async (clientId: string) => {
  const res = await fetch(`${BASE_URL}/admin/unassign-trainer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ clientId }),
  });
  return handleResponse(res);
};

// ─── Diet Plans ──────────────────────────────────────────────
export const createDietAPI = async (diet: {
  clientId: string;
  trainerId?: string;
  title?: string;
  meals: { name: string; calories: number; time: string }[];
}) => {
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

export const getAllDietsAPI = async () => {
  const res = await fetch(`${BASE_URL}/diet`, { headers: authHeaders() });
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

export { isNetworkError };
