import React from 'react';
import { useNutrition } from '@/context/NutritionContext';

const CalorieRing = () => {
  const { meals, dailyGoal } = useNutrition();
  const consumed = meals.reduce((s, m) => s + m.calories, 0);
  const pct = Math.min((consumed / dailyGoal.calories) * 100, 100);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute mt-12 flex flex-col items-center">
        <span className="font-display text-3xl font-bold">{consumed}</span>
        <span className="text-xs text-muted-foreground">/ {dailyGoal.calories} kcal</span>
      </div>
    </div>
  );
};

export default CalorieRing;
