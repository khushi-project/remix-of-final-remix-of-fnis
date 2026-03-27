import React from 'react';
import { useNutrition } from '@/context/NutritionContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const NutritionCharts = () => {
  const { meals, dailyGoal } = useNutrition();

  const totals = meals.reduce(
    (acc, m) => ({ protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fats: acc.fats + m.fats }),
    { protein: 0, carbs: 0, fats: 0 }
  );

  const macroData = [
    { name: 'Protein', value: totals.protein, goal: dailyGoal.protein, color: 'hsl(var(--chart-1))' },
    { name: 'Carbs', value: totals.carbs, goal: dailyGoal.carbs, color: 'hsl(var(--chart-2))' },
    { name: 'Fats', value: totals.fats, goal: dailyGoal.fats, color: 'hsl(var(--chart-3))' },
  ];

  const weeklyData = [
    { day: 'Mon', calories: 2100 }, { day: 'Tue', calories: 1950 },
    { day: 'Wed', calories: 2300 }, { day: 'Thu', calories: 2050 },
    { day: 'Fri', calories: 2200 }, { day: 'Sat', calories: 1800 },
    { day: 'Sun', calories: meals.reduce((s, m) => s + m.calories, 0) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Macro breakdown pie */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Macro Breakdown</h3>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={macroData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={4} strokeWidth={0}>
                {macroData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3">
            {macroData.map(d => (
              <div key={d.name}>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-display text-lg font-bold">{d.value}g <span className="text-xs text-muted-foreground font-normal">/ {d.goal}g</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Weekly Calories</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
            <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NutritionCharts;
