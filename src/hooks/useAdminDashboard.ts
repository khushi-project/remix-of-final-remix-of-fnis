import { useState, useEffect, useCallback } from 'react';
import {
  getClients, getTrainers, getDietPlans, getExercises, getTrainerClientMappings,
  createTrainer, deleteTrainer, createClient, deleteClient,
  assignTrainer, unassignTrainer, createDietPlan, createExercise, deleteExercise,
  ApiError,
} from '@/api/api';

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
  addTrainer: (t: Omit<AdminTrainer, 'id' | 'dateJoined'>) => Promise<void>;
  removeTrainer: (id: string) => Promise<void>;
  addClient: (c: Omit<AdminClient, 'id' | 'dateJoined'>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  assignClientToTrainer: (clientId: string, trainerId: string, clientName: string, clientEmail: string) => Promise<void>;
  unassignClient: (trainerId: string, clientId: string) => Promise<void>;
  addDietPlan: (plan: Omit<AdminDietPlan, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  addExercise: (ex: Omit<AdminExercise, 'id' | 'assignedAt'>) => Promise<void>;
  removeExercise: (id: string) => Promise<void>;
}

const today = () => new Date().toISOString().split('T')[0];

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
      const [t, c, dp, ex, m] = await Promise.all([
        getTrainers().catch(() => []),
        getClients().catch(() => []),
        getDietPlans().catch(() => []),
        getExercises().catch(() => []),
        getTrainerClientMappings().catch(() => []),
      ]);
      setTrainers((t ?? []) as AdminTrainer[]);
      setClients((c ?? []) as AdminClient[]);
      setDietPlans((dp ?? []) as AdminDietPlan[]);
      setExercises((ex ?? []) as AdminExercise[]);
      setTrainerClientMappings((m ?? []) as TrainerClientMapping[]);
    } catch (err) {
      if (err instanceof ApiError && err.status >= 500) {
        setError('Failed to load admin data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats: AdminStats = {
    totalClients: clients.length,
    totalTrainers: trainers.length,
    dietPlans: dietPlans.length,
    assignments: trainerClientMappings.length,
  };

  // ─── Actions: try API first, fall back to optimistic local update ──
  const addTrainer = useCallback(async (t: Omit<AdminTrainer, 'id' | 'dateJoined'>) => {
    try {
      const created = await createTrainer(t);
      setTrainers(prev => [...prev, created]);
    } catch {
      setTrainers(prev => [...prev, { ...t, id: `trainer-${Date.now()}`, dateJoined: today() }]);
    }
  }, []);

  const removeTrainer = useCallback(async (id: string) => {
    try { await deleteTrainer(id); } catch { /* offline */ }
    setTrainers(prev => prev.filter(t => t.id !== id));
  }, []);

  const addClient = useCallback(async (c: Omit<AdminClient, 'id' | 'dateJoined'>) => {
    try {
      const created = await createClient(c);
      setClients(prev => [...prev, created]);
    } catch {
      setClients(prev => [...prev, { ...c, id: `client-${Date.now()}`, dateJoined: today() }]);
    }
  }, []);

  const removeClient = useCallback(async (id: string) => {
    try { await deleteClient(id); } catch { /* offline */ }
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  const assignClientToTrainer = useCallback(async (
    clientId: string, trainerId: string, clientName: string, clientEmail: string,
  ) => {
    try { await assignTrainer(clientId, trainerId); } catch { /* offline */ }
    setTrainerClientMappings(prev => {
      if (prev.find(m => m.clientId === clientId && m.trainerId === trainerId)) return prev;
      return [...prev, { trainerId, clientId, clientName, clientEmail }];
    });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedTrainerId: trainerId } : c));
  }, []);

  const unassignClient = useCallback(async (trainerId: string, clientId: string) => {
    try { await unassignTrainer(clientId, trainerId); } catch { /* offline */ }
    setTrainerClientMappings(prev => prev.filter(m => !(m.trainerId === trainerId && m.clientId === clientId)));
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedTrainerId: undefined } : c));
  }, []);

  const addDietPlan = useCallback(async (plan: Omit<AdminDietPlan, 'id' | 'status' | 'createdAt'>) => {
    try {
      const created = await createDietPlan(plan);
      setDietPlans(prev => [...prev, created]);
    } catch {
      setDietPlans(prev => [...prev, {
        ...plan, id: `dp-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(),
      }]);
    }
  }, []);

  const addExercise = useCallback(async (ex: Omit<AdminExercise, 'id' | 'assignedAt'>) => {
    try {
      const created = await createExercise(ex);
      setExercises(prev => [...prev, created]);
    } catch {
      setExercises(prev => [...prev, { ...ex, id: `ex-${Date.now()}`, assignedAt: new Date().toISOString() }]);
    }
  }, []);

  const removeExerciseAction = useCallback(async (id: string) => {
    try { await deleteExercise(id); } catch { /* offline */ }
    setExercises(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    trainers, clients, dietPlans, exercises, trainerClientMappings, stats,
    isLoading, error, refreshData: fetchData,
    addTrainer, removeTrainer,
    addClient, removeClient,
    assignClientToTrainer, unassignClient,
    addDietPlan,
    addExercise, removeExercise: removeExerciseAction,
  };
}
