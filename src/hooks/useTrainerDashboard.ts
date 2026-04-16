import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

// ─── Types ─────────────────────────────────────────────────
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
  addDietPlan: (plan: { clientId: string; title: string; meals: { time: string; description: string }[] }) => void;
  updateDietPlan: (planId: string, meals: { time: string; description: string }[]) => void;
}

/**
 * API-ready hook for the trainer dashboard.
 * Currently returns empty defaults. Replace fetchData body with real API calls.
 */
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
      // ═══════════════════════════════════════════════════════
      // TODO: Replace with real API calls using user.id
      // Example:
      //   const res = await fetch(`/api/trainers/${user.id}/dashboard`);
      //   const data = await res.json();
      //   setClients(data.clients);
      //   setDietPlans(data.dietPlans);
      // ═══════════════════════════════════════════════════════

      setClients([]);
      setDietPlans([]);
    } catch {
      setError('Failed to load trainer data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPlan = useCallback((plan: { clientId: string; title: string; meals: { time: string; description: string }[] }) => {
    // TODO: Replace with API call
    const newPlan: DietPlan = {
      id: `dp-${Date.now()}`,
      clientId: plan.clientId,
      title: plan.title,
      meals: plan.meals,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setDietPlans(prev => [...prev, newPlan]);
  }, []);

  const updatePlan = useCallback((planId: string, meals: { time: string; description: string }[]) => {
    // TODO: Replace with API call
    setDietPlans(prev => prev.map(p => p.id === planId ? { ...p, meals } : p));
  }, []);

  return {
    clients,
    dietPlans,
    isLoading,
    error,
    refreshData: fetchData,
    addDietPlan: addPlan,
    updateDietPlan: updatePlan,
  };
}
