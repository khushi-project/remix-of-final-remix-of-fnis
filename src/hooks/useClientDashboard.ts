import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getClientDashboard, ApiError } from '@/api/api';

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

const DEFAULT_GOALS: DailyGoals = { calories: 2200, protein: 150, carbs: 250, fats: 70 };
const EMPTY_WEEK: WeeklyCalorieEntry[] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  .map(day => ({ day, calories: 0 }));

/**
 * API-ready hook for the client dashboard.
 * Fetches GET /api/client/:id/dashboard. If the backend is not yet
 * connected, the UI shows clean empty states (no mock data).
 */
export function useClientDashboard(): ClientDashboardData {
  const { user } = useAuth();
  const [meals, setMeals] = useState<ClientMeal[]>([]);
  const [exercises, setExercises] = useState<ClientExercise[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<WeeklyCalorieEntry[]>(EMPTY_WEEK);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClientDashboard(user.id);
      setMeals(data.meals ?? []);
      setExercises(data.exercises ?? []);
      setWeeklyCalories(data.weeklyCalories?.length ? data.weeklyCalories : EMPTY_WEEK);
      setTrainer(data.trainer ?? null);
      if (data.dailyGoals) setDailyGoals(data.dailyGoals);
    } catch (err) {
      // No backend yet → render empty state, don't surface scary errors.
      if (err instanceof ApiError && err.status >= 500) {
        setError('Failed to load dashboard data. Please try again.');
      }
      setMeals([]);
      setExercises([]);
      setWeeklyCalories(EMPTY_WEEK);
      setTrainer(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = {
    calories: meals.reduce((s, m) => s + m.calories, 0),
    protein: meals.reduce((s, m) => s + m.protein, 0),
    carbs: meals.reduce((s, m) => s + m.carbs, 0),
    fats: meals.reduce((s, m) => s + m.fats, 0),
    mealsLogged: meals.length,
    exerciseCount: exercises.length,
  };

  return {
    meals, exercises, dailyGoals, weeklyCalories, trainer,
    totals, isLoading, error, refreshData: fetchData,
  };
}
