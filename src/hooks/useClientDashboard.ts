import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

// ─── Types ─────────────────────────────────────────────────
export interface ClientMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  completed?: boolean;
}

export interface ClientExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  category: string;
  completed?: boolean;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface WeeklyCalorieEntry {
  day: string;
  calories: number;
}

export interface TrainerInfo {
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
}

export interface ClientDashboardData {
  meals: ClientMeal[];
  exercises: ClientExercise[];
  dailyGoals: DailyGoals;
  weeklyCalories: WeeklyCalorieEntry[];
  trainer: TrainerInfo | null;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    mealsLogged: number;
    exerciseCount: number;
  };
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

/**
 * API-ready hook for the client dashboard.
 *
 * Currently returns empty/default values. When a backend is connected,
 * replace the body of `fetchData` with actual API calls using `user.id`.
 */
export function useClientDashboard(): ClientDashboardData {
  const { user } = useAuth();
  const [meals, setMeals] = useState<ClientMeal[]>([]);
  const [exercises, setExercises] = useState<ClientExercise[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<WeeklyCalorieEntry[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dailyGoals: DailyGoals = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // ═══════════════════════════════════════════════════════
      // TODO: Replace with real API calls using user.id
      // Example:
      //   const res = await fetch(`/api/clients/${user.id}/dashboard`);
      //   const data = await res.json();
      //   setMeals(data.meals);
      //   setExercises(data.exercises);
      //   setWeeklyCalories(data.weeklyCalories);
      //   setTrainer(data.trainer);
      // ═══════════════════════════════════════════════════════

      // For now, set empty data
      setMeals([]);
      setExercises([]);
      setWeeklyCalories([
        { day: 'Mon', calories: 0 },
        { day: 'Tue', calories: 0 },
        { day: 'Wed', calories: 0 },
        { day: 'Thu', calories: 0 },
        { day: 'Fri', calories: 0 },
        { day: 'Sat', calories: 0 },
        { day: 'Sun', calories: 0 },
      ]);
      setTrainer(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totals = {
    calories: meals.reduce((s, m) => s + m.calories, 0),
    protein: meals.reduce((s, m) => s + m.protein, 0),
    carbs: meals.reduce((s, m) => s + m.carbs, 0),
    fats: meals.reduce((s, m) => s + m.fats, 0),
    mealsLogged: meals.length,
    exerciseCount: exercises.length,
  };

  return {
    meals,
    exercises,
    dailyGoals,
    weeklyCalories,
    trainer,
    totals,
    isLoading,
    error,
    refreshData: fetchData,
  };
}
