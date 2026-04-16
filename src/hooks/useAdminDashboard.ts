import { useState, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────
export interface AdminTrainer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  dateJoined: string;
}

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goal?: string;
  assignedTrainerId?: string;
  dateJoined: string;
}

export interface AdminDietPlan {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  meals: { time: string; description: string }[];
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface AdminExercise {
  id: string;
  clientId: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  category: string;
  assignedAt: string;
}

export interface TrainerClientMapping {
  trainerId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
}

export interface AdminStats {
  totalClients: number;
  totalTrainers: number;
  dietPlans: number;
  assignments: number;
}

export interface AdminDashboardData {
  trainers: AdminTrainer[];
  clients: AdminClient[];
  dietPlans: AdminDietPlan[];
  exercises: AdminExercise[];
  trainerClientMappings: TrainerClientMapping[];
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
  // Trainer actions
  addTrainer: (t: Omit<AdminTrainer, 'id' | 'dateJoined'>) => void;
  removeTrainer: (id: string) => void;
  // Client actions
  addClient: (c: Omit<AdminClient, 'id' | 'dateJoined'>) => void;
  removeClient: (id: string) => void;
  assignClientToTrainer: (clientId: string, trainerId: string, clientName: string, clientEmail: string) => void;
  unassignClient: (trainerId: string, clientId: string) => void;
  // Diet actions
  addDietPlan: (plan: Omit<AdminDietPlan, 'id' | 'status' | 'createdAt'>) => void;
  // Exercise actions
  addExercise: (ex: Omit<AdminExercise, 'id' | 'assignedAt'>) => void;
  removeExercise: (id: string) => void;
}

/**
 * API-ready hook for the admin dashboard.
 * Currently returns empty defaults. Replace fetchData body with real API calls.
 */
export function useAdminDashboard(): AdminDashboardData {
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [dietPlans, setDietPlans] = useState<AdminDietPlan[]>([]);
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [trainerClientMappings, setTrainerClientMappings] = useState<TrainerClientMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ═══════════════════════════════════════════════════════
      // TODO: Replace with real API calls
      // Example:
      //   const res = await fetch('/api/admin/dashboard');
      //   const data = await res.json();
      //   setTrainers(data.trainers); setClients(data.clients); ...
      // ═══════════════════════════════════════════════════════

      setTrainers([]);
      setClients([]);
      setDietPlans([]);
      setExercises([]);
      setTrainerClientMappings([]);
    } catch {
      setError('Failed to load admin data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats: AdminStats = {
    totalClients: clients.length,
    totalTrainers: trainers.length,
    dietPlans: dietPlans.length,
    assignments: trainerClientMappings.length,
  };

  // ─── Actions (local-only for now, replace with API calls) ──

  const addTrainer = useCallback((t: Omit<AdminTrainer, 'id' | 'dateJoined'>) => {
    const newT: AdminTrainer = { ...t, id: `trainer-${Date.now()}`, dateJoined: new Date().toISOString().split('T')[0] };
    setTrainers(prev => [...prev, newT]);
  }, []);

  const removeTrainer = useCallback((id: string) => {
    setTrainers(prev => prev.filter(t => t.id !== id));
  }, []);

  const addClient = useCallback((c: Omit<AdminClient, 'id' | 'dateJoined'>) => {
    const newC: AdminClient = { ...c, id: `client-${Date.now()}`, dateJoined: new Date().toISOString().split('T')[0] };
    setClients(prev => [...prev, newC]);
  }, []);

  const removeClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  const assignClientToTrainer = useCallback((clientId: string, trainerId: string, clientName: string, clientEmail: string) => {
    setTrainerClientMappings(prev => {
      if (prev.find(m => m.clientId === clientId && m.trainerId === trainerId)) return prev;
      return [...prev, { trainerId, clientId, clientName, clientEmail }];
    });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedTrainerId: trainerId } : c));
  }, []);

  const unassignClient = useCallback((trainerId: string, clientId: string) => {
    setTrainerClientMappings(prev => prev.filter(m => !(m.trainerId === trainerId && m.clientId === clientId)));
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedTrainerId: undefined } : c));
  }, []);

  const addDietPlan = useCallback((plan: Omit<AdminDietPlan, 'id' | 'status' | 'createdAt'>) => {
    const newPlan: AdminDietPlan = { ...plan, id: `dp-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    setDietPlans(prev => [...prev, newPlan]);
  }, []);

  const addExercise = useCallback((ex: Omit<AdminExercise, 'id' | 'assignedAt'>) => {
    const newEx: AdminExercise = { ...ex, id: `ex-${Date.now()}`, assignedAt: new Date().toISOString() };
    setExercises(prev => [...prev, newEx]);
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    trainers, clients, dietPlans, exercises, trainerClientMappings, stats,
    isLoading, error, refreshData: fetchData,
    addTrainer, removeTrainer,
    addClient, removeClient,
    assignClientToTrainer, unassignClient,
    addDietPlan,
    addExercise, removeExercise,
  };
}
