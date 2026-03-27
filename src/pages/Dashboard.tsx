import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNutrition } from '@/context/NutritionContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CalorieRing from '@/components/CalorieRing';
import NutritionCharts from '@/components/NutritionCharts';
import { User, Target, TrendingUp, Flame } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { meals, dailyGoal } = useNutrition();

  if (!isAuthenticated) return <Navigate to="/login" />;

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);

  const stats = [
    { icon: Flame, label: 'Calories', value: `${totalCals}`, sub: `/ ${dailyGoal.calories}` },
    { icon: Target, label: 'Protein', value: `${totalProtein}g`, sub: `/ ${dailyGoal.protein}g` },
    { icon: TrendingUp, label: 'Meals Logged', value: `${meals.length}`, sub: 'today' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Profile header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-sm text-muted-foreground">Goal: {user?.goal} • {user?.weight}kg • {user?.height}cm</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><s.icon className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-display text-xl font-bold">{s.value} <span className="text-xs text-muted-foreground font-normal">{s.sub}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calorie ring + charts */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-6 font-display text-lg font-semibold">Daily Progress</h2>
          <div className="flex justify-center relative">
            <CalorieRing />
          </div>
        </div>

        <NutritionCharts />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
