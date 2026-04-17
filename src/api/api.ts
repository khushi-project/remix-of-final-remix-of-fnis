// ─────────────────────────────────────────────────────────────
// Centralized API layer for FNIS.
// All HTTP calls go through here. No mock data, no fallbacks.
// Endpoints are placeholders — wire to your backend by setting
// VITE_API_BASE_URL (defaults to "/api").
// ─────────────────────────────────────────────────────────────

import type { AuthUser, UserRole } from '@/types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

const TOKEN_KEY = 'token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const buildHeaders = (extra?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...headers, ...(extra as Record<string, string>) };
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init.headers),
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

// ─── Auth ────────────────────────────────────────────────────
export interface AuthResponse { token: string; user: AuthUser; }

export const loginUser = (email: string, password: string, role: UserRole) =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });

export const registerUser = (
  name: string, email: string, password: string, role: UserRole,
) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });

export const updateUserProfile = (userId: string, updates: Partial<AuthUser>) =>
  request<AuthUser>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

// ─── Admin ───────────────────────────────────────────────────
export const getClients = () => request<any[]>('/admin/clients');
export const getTrainers = () => request<any[]>('/admin/trainers');
export const getDietPlans = () => request<any[]>('/admin/diet-plans');
export const getExercises = () => request<any[]>('/admin/exercises');
export const getTrainerClientMappings = () => request<any[]>('/admin/assignments');

export const createTrainer = (payload: { name: string; email: string; phone?: string; specialization: string }) =>
  request<any>('/admin/trainers', { method: 'POST', body: JSON.stringify(payload) });
export const deleteTrainer = (id: string) =>
  request<void>(`/admin/trainers/${id}`, { method: 'DELETE' });

export const createClient = (payload: { name: string; email: string; phone?: string; goal?: string }) =>
  request<any>('/admin/clients', { method: 'POST', body: JSON.stringify(payload) });
export const deleteClient = (id: string) =>
  request<void>(`/admin/clients/${id}`, { method: 'DELETE' });

export const assignTrainer = (clientId: string, trainerId: string) =>
  request<void>('/admin/assignments', {
    method: 'POST',
    body: JSON.stringify({ clientId, trainerId }),
  });
export const unassignTrainer = (clientId: string, trainerId: string) =>
  request<void>('/admin/assignments', {
    method: 'DELETE',
    body: JSON.stringify({ clientId, trainerId }),
  });

export const createDietPlan = (payload: {
  trainerId: string; clientId: string; title: string;
  meals: { time: string; description: string }[];
}) => request<any>('/admin/diet-plans', { method: 'POST', body: JSON.stringify(payload) });

export const createExercise = (payload: {
  clientId: string; name: string; sets: number; reps: number;
  duration?: number; category: string;
}) => request<any>('/admin/exercises', { method: 'POST', body: JSON.stringify(payload) });

export const deleteExercise = (id: string) =>
  request<void>(`/admin/exercises/${id}`, { method: 'DELETE' });

// ─── Trainer ─────────────────────────────────────────────────
export const getTrainerDashboard = (trainerId: string) =>
  request<{ clients: any[]; dietPlans: any[] }>(`/trainer/${trainerId}/dashboard`);

export const createTrainerDietPlan = (trainerId: string, payload: {
  clientId: string; title: string; meals: { time: string; description: string }[];
}) => request<any>(`/trainer/${trainerId}/diet-plans`, {
  method: 'POST', body: JSON.stringify(payload),
});

export const updateTrainerDietPlan = (planId: string, meals: { time: string; description: string }[]) =>
  request<any>(`/trainer/diet-plans/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify({ meals }),
  });

// ─── Client ──────────────────────────────────────────────────
export const getClientDashboard = (clientId: string) =>
  request<{
    meals: any[]; exercises: any[]; weeklyCalories: { day: string; calories: number }[];
    trainer: { name: string; email: string; phone?: string; specialization?: string } | null;
    dailyGoals: { calories: number; protein: number; carbs: number; fats: number };
  }>(`/client/${clientId}/dashboard`);
