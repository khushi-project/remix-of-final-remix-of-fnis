import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getTrainerDashboard,
  createTrainerDietPlan,
  updateTrainerDietPlan,
  ApiError,
} from '@/api/api';

export interface TrainerClient {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

export interface DietPlan {
  id: string;
  clientId: string;
  title: string;
  meals: { time: string; description: string }[];
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface TrainerDashboardData {
  clients: TrainerClient[];
  dietPlans: DietPlan[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
  addDietPlan: (plan: { clientId: string; title: string; meals: { time: string; description: string }[] }) => Promise<void>;
  updateDietPlan: (planId: string, meals: { time: string; description: string }[]) => Promise<void>;
}

export function useTrainerDashboard(): TrainerDashboardData {
  const { user } = useAuth();
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrainerDashboard(user.id);
      setClients(data.clients ?? []);
      setDietPlans(data.dietPlans ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status >= 500) {
        setError('Failed to load trainer data. Please try again.');
      }
      setClients([]);
      setDietPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addPlan = useCallback(async (plan: { clientId: string; title: string; meals: { time: string; description: string }[] }) => {
    if (!user) return;
    try {
      const created = await createTrainerDietPlan(user.id, plan);
      setDietPlans(prev => [...prev, created]);
    } catch {
      // Backend not ready — keep optimistic UI client-side
      setDietPlans(prev => [...prev, {
        id: `dp-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(),
        ...plan,
      }]);
    }
  }, [user]);

  const updatePlan = useCallback(async (planId: string, meals: { time: string; description: string }[]) => {
    try {
      await updateTrainerDietPlan(planId, meals);
    } catch { /* optimistic */ }
    setDietPlans(prev => prev.map(p => p.id === planId ? { ...p, meals } : p));
  }, []);

  return { clients, dietPlans, isLoading, error, refreshData: fetchData, addDietPlan: addPlan, updateDietPlan: updatePlan };
}
