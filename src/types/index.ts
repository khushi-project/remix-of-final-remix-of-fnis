// Shared domain types — single source of truth for the frontend.
// Backend payloads are expected to match these shapes.

export type UserRole = 'admin' | 'trainer' | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  role: UserRole;
  specialization?: string;
  joinWeight?: number;
  currentWeight?: number;
  assignedTrainerId?: string;
}
