import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  category: string;
}

interface NutritionContextType {
  meals: Meal[];
  exercises: Exercise[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, meal: Omit<Meal, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;
  dailyGoal: { calories: number; protein: number; carbs: number; fats: number };
}

const defaultMeals: Meal[] = [
  { id: '1', name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 55, fats: 8, type: 'breakfast' },
  { id: '2', name: 'Grilled Chicken Salad', calories: 480, protein: 42, carbs: 18, fats: 22, type: 'lunch' },
  { id: '3', name: 'Salmon with Quinoa', calories: 560, protein: 38, carbs: 42, fats: 20, type: 'dinner' },
  { id: '4', name: 'Protein Shake', calories: 220, protein: 30, carbs: 15, fats: 5, type: 'snack' },
];

const defaultExercises: Exercise[] = [
  { id: '1', name: 'Bench Press', sets: 4, reps: 10, category: 'Chest' },
  { id: '2', name: 'Squats', sets: 4, reps: 12, category: 'Legs' },
  { id: '3', name: 'Deadlift', sets: 3, reps: 8, category: 'Back' },
  { id: '4', name: 'Running', sets: 1, reps: 1, duration: 30, category: 'Cardio' },
  { id: '5', name: 'Pull-ups', sets: 3, reps: 10, category: 'Back' },
  { id: '6', name: 'Shoulder Press', sets: 3, reps: 12, category: 'Shoulders' },
];

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<Meal[]>(defaultMeals);
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);

  const dailyGoal = { calories: 2200, protein: 150, carbs: 250, fats: 70 };

  const addMeal = (meal: Omit<Meal, 'id'>) => {
    setMeals(prev => [...prev, { ...meal, id: Date.now().toString() }]);
  };

  const updateMeal = (id: string, meal: Omit<Meal, 'id'>) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...meal, id } : m));
  };

  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    setExercises(prev => [...prev, { ...exercise, id: Date.now().toString() }]);
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  return (
    <NutritionContext.Provider value={{ meals, exercises, addMeal, updateMeal, deleteMeal, addExercise, deleteExercise, dailyGoal }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const ctx = useContext(NutritionContext);
  if (!ctx) throw new Error('useNutrition must be used within NutritionProvider');
  return ctx;
};
