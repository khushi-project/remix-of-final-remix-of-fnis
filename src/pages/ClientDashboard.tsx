import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNutrition } from '@/context/NutritionContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  User, Utensils, ClipboardCheck, CheckCircle, Edit2, Save, X,
  Dumbbell, Plus, TrendingUp, Flame, Target, Clock,
} from 'lucide-react';
import {
  getDietPlansForClient, acceptDietPlan, addMealLog, getMealLogs,
  getClientTrainer, getTrainerById, updateClient, type MealLog,
} from '@/services/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Workout types & localStorage helpers ───────────────────
interface WorkoutEntry {
  id: string;
  clientId: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number;
  caloriesBurned: number;
  category: string;
}

const WO_KEY = 'fnis_workouts';
const getWorkouts = (clientId: string): WorkoutEntry[] => {
  try {
    return (JSON.parse(localStorage.getItem(WO_KEY) || '[]') as WorkoutEntry[]).filter(w => w.clientId === clientId);
  } catch { return []; }
};
const saveWorkout = (entry: Omit<WorkoutEntry, 'id'>): WorkoutEntry => {
  const all: WorkoutEntry[] = JSON.parse(localStorage.getItem(WO_KEY) || '[]');
  const newW: WorkoutEntry = { ...entry, id: `wo-${Date.now()}` };
  all.push(newW);
  localStorage.setItem(WO_KEY, JSON.stringify(all));
  return newW;
};
const removeWorkout = (id: string) => {
  const all: WorkoutEntry[] = JSON.parse(localStorage.getItem(WO_KEY) || '[]');
  localStorage.setItem(WO_KEY, JSON.stringify(all.filter(w => w.id !== id)));
};

// ─── Constants ──────────────────────────────────────────────
const WORKOUT_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Core'];

const generateDailyKcal = (): { time: string; kcal: number }[] => {
  const hours = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
  let cumulative = 0;
  return hours.map(time => {
    cumulative += Math.floor(Math.random() * 350) + 100;
    return { time, kcal: cumulative };
  });
};

const generateWeeklyKcal = (): { day: string; kcal: number; goal: number }[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({ day, kcal: Math.floor(Math.random() * 800) + 1600, goal: 2200 }));
};

const macroData = [
  { name: 'Protein', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Carbs', value: 45, color: 'hsl(var(--chart-2))' },
  { name: 'Fats', value: 20, color: 'hsl(var(--chart-3))' },
];

// ─── Calorie Ring ───────────────────────────────────────────
const CalorieRing = ({ consumed, goal }: { consumed: number; goal: number }) => {
  const pct = Math.min((consumed / goal) * 100, 100);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center relative">
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="font-display text-3xl font-bold">{consumed}</span>
        <span className="text-xs text-muted-foreground">/ {goal} kcal</span>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { meals, exercises, addExercise, deleteExercise, dailyGoal, addMeal, updateMeal, deleteMeal } = useNutrition();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'diet' | 'meals' | 'workouts'>('overview');
  const [checkedMeals, setCheckedMeals] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editJoinWeight, setEditJoinWeight] = useState(user?.joinWeight?.toString() || '');
  const [editCurrentWeight, setEditCurrentWeight] = useState(user?.currentWeight?.toString() || '');
  const [, forceUpdate] = useState(0);
  const [mealInput, setMealInput] = useState('');
  const [selectedMealTime, setSelectedMealTime] = useState('Breakfast');

  // Workout form
  const [showWoForm, setShowWoForm] = useState(false);
  const [woForm, setWoForm] = useState({ name: '', sets: '', reps: '', duration: '', category: 'Chest' });
  const [woErrors, setWoErrors] = useState<Record<string, string>>({});

  // Meal form
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealForm, setMealForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '', type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack' });
  const [editMealId, setEditMealId] = useState<string | null>(null);
  const [mealErrors, setMealErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const dietPlans = getDietPlansForClient(user.id);
  const trainerRel = getClientTrainer(user.id);
  const trainer = trainerRel ? getTrainerById(trainerRel.trainerId) : undefined;

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFats = meals.reduce((s, m) => s + m.fats, 0);

  const stats = [
    { icon: Flame, label: 'Calories', value: `${totalCals}`, sub: `/ ${dailyGoal.calories}` },
    { icon: Target, label: 'Protein', value: `${totalProtein}g`, sub: `/ ${dailyGoal.protein}g` },
    { icon: TrendingUp, label: 'Meals Logged', value: `${meals.length}`, sub: 'today' },
    { icon: Dumbbell, label: 'Exercises', value: `${exercises.length}`, sub: 'tracked' },
  ];

  const macroChartData = [
    { name: 'Protein', value: totalProtein, goal: dailyGoal.protein, color: 'hsl(var(--chart-1))' },
    { name: 'Carbs', value: totalCarbs, goal: dailyGoal.carbs, color: 'hsl(var(--chart-2))' },
    { name: 'Fats', value: totalFats, goal: dailyGoal.fats, color: 'hsl(var(--chart-3))' },
  ];

  const weeklyData = [
    { day: 'Mon', calories: 2100 }, { day: 'Tue', calories: 1950 },
    { day: 'Wed', calories: 2300 }, { day: 'Thu', calories: 2050 },
    { day: 'Fri', calories: 2200 }, { day: 'Sat', calories: 1800 },
    { day: 'Sun', calories: totalCals },
  ];

  const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealTypeLabels: Record<string, string> = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snack' };

  // Workout grouped
  const groupedExercises = WORKOUT_CATEGORIES.reduce((acc, cat) => {
    const items = exercises.filter(e => e.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof exercises>);

  const handleSaveProfile = () => {
    const updates = { name: editName, phone: editPhone, joinWeight: editJoinWeight ? Number(editJoinWeight) : undefined, currentWeight: editCurrentWeight ? Number(editCurrentWeight) : undefined };
    updateProfile(updates);
    updateClient(user.id, updates);
    setEditing(false);
  };

  const handleAcceptPlan = (planId: string) => { acceptDietPlan(planId); forceUpdate(n => n + 1); };

  const handleLogMeal = (followedPlan: boolean) => {
    addMealLog({ clientId: user.id, date: new Date().toISOString().split('T')[0], mealTime: selectedMealTime, followedPlan, actualMeal: followedPlan ? undefined : mealInput });
    setMealInput('');
    forceUpdate(n => n + 1);
  };

  const handleAddExercise = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!woForm.name.trim()) e.name = 'Required';
    if (!woForm.sets || +woForm.sets <= 0) e.sets = 'Required';
    if (!woForm.reps || +woForm.reps <= 0) e.reps = 'Required';
    setWoErrors(e);
    if (Object.keys(e).length) return;
    addExercise({ name: woForm.name, sets: +woForm.sets, reps: +woForm.reps, duration: woForm.duration ? +woForm.duration : undefined, category: woForm.category });
    setWoForm({ name: '', sets: '', reps: '', duration: '', category: 'Chest' });
    setShowWoForm(false);
  };

  const handleMealSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!mealForm.name.trim()) e.name = 'Required';
    if (!mealForm.calories || +mealForm.calories <= 0) e.calories = 'Must be > 0';
    if (!mealForm.protein || +mealForm.protein < 0) e.protein = 'Required';
    if (!mealForm.carbs || +mealForm.carbs < 0) e.carbs = 'Required';
    if (!mealForm.fats || +mealForm.fats < 0) e.fats = 'Required';
    setMealErrors(e);
    if (Object.keys(e).length) return;
    const data = { name: mealForm.name, calories: +mealForm.calories, protein: +mealForm.protein, carbs: +mealForm.carbs, fats: +mealForm.fats, type: mealForm.type };
    if (editMealId) { updateMeal(editMealId, data); setEditMealId(null); }
    else addMeal(data);
    setMealForm({ name: '', calories: '', protein: '', carbs: '', fats: '', type: 'breakfast' });
    setShowMealForm(false);
  };

  const startEditMeal = (m: typeof meals[0]) => {
    setMealForm({ name: m.name, calories: String(m.calories), protein: String(m.protein), carbs: String(m.carbs), fats: String(m.fats), type: m.type });
    setEditMealId(m.id);
    setShowMealForm(true);
  };

  const dailyKcal = generateDailyKcal();
  const weeklyKcalProgress = generateWeeklyKcal();

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: Flame },
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'diet' as const, label: 'Diet Plans', icon: Utensils },
    { key: 'meals' as const, label: 'Meal Planner', icon: ClipboardCheck },
    { key: 'workouts' as const, label: 'Workouts', icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {trainer ? `Trainer: ${trainer.name}` : 'No trainer assigned'}
              {user.currentWeight ? ` • ${user.currentWeight}kg` : ''}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.key ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Calorie ring */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 font-display text-lg font-semibold">Daily Progress</h2>
              <div className="flex justify-center">
                <CalorieRing consumed={totalCals} goal={dailyGoal.calories} />
              </div>
            </div>

            {/* Charts grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Macro breakdown pie */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Macro Breakdown</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={macroChartData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={4} strokeWidth={0}>
                        {macroChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3">
                    {macroChartData.map(d => (
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
          </div>
        )}

        {/* ══════════════════ PROFILE TAB ══════════════════ */}
        {activeTab === 'profile' && (
          <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Profile Details</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-primary hover:underline"><Edit2 className="h-4 w-4" /> Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 text-sm text-primary hover:underline"><Save className="h-4 w-4" /> Save</button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"><X className="h-4 w-4" /> Cancel</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                {editing ? <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /> : <p className="text-sm font-medium">{user.name}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email (read-only)</label>
                <p className="text-sm font-medium text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Phone Number</label>
                {editing ? <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="Enter phone number" /> : <p className="text-sm font-medium">{user.phone || 'Not set'}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Weight at Joining (kg)</label>
                  {editing ? <input type="number" value={editJoinWeight} onChange={e => setEditJoinWeight(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /> : <p className="text-sm font-medium">{user.joinWeight ? `${user.joinWeight} kg` : 'Not set'}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Current Weight (kg)</label>
                  {editing ? <input type="number" value={editCurrentWeight} onChange={e => setEditCurrentWeight(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /> : <p className="text-sm font-medium">{user.currentWeight ? `${user.currentWeight} kg` : 'Not set'}</p>}
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
                <label className="text-xs text-muted-foreground">Assigned Trainer</label>
                {trainer ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">{trainer.name}</p>
                    <p className="text-xs text-muted-foreground">Email: {trainer.email}</p>
                    <p className="text-xs text-muted-foreground">Phone: {trainer.phone || 'Not set'}</p>
                    <p className="text-xs text-muted-foreground">Specialization: {trainer.specialization || 'Not set'}</p>
                  </div>
                ) : <p className="text-sm font-medium mt-1">No trainer assigned</p>}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ DIET PLANS TAB ══════════════════ */}
        {activeTab === 'diet' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-lg font-semibold">Your Diet Plans</h2>
            {dietPlans.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No diet plans assigned yet. Your trainer will create one for you.</div>
            ) : (
              dietPlans.map(plan => (
                <div key={plan.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold">{plan.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${plan.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
                      {plan.status === 'accepted' ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {plan.meals.map((meal: { time: string; description: string }, i: number) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-muted-foreground min-w-[80px]">{meal.time}</span>
                        <span>{meal.description}</span>
                      </div>
                    ))}
                  </div>
                  {plan.status === 'pending' && (
                    <button onClick={() => handleAcceptPlan(plan.id)} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <CheckCircle className="h-4 w-4" /> Accept Plan
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════ MEAL PLANNER TAB ══════════════════ */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Meal Planner</h2>
                <p className="text-sm text-muted-foreground">Plan and track your daily meals</p>
              </div>
              <button onClick={() => { setShowMealForm(!showMealForm); setEditMealId(null); setMealForm({ name: '', calories: '', protein: '', carbs: '', fats: '', type: 'breakfast' }); }} className="gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
                <Plus className="h-4 w-4" /> Add Meal
              </button>
            </div>

            <AnimatePresence>
              {showMealForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleMealSubmit} className="overflow-hidden rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-semibold">{editMealId ? 'Edit Meal' : 'New Meal'}</h3>
                    <button type="button" onClick={() => setShowMealForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Greek Yogurt' },
                      { key: 'calories', label: 'Calories', type: 'number', placeholder: '0' },
                      { key: 'protein', label: 'Protein (g)', type: 'number', placeholder: '0' },
                      { key: 'carbs', label: 'Carbs (g)', type: 'number', placeholder: '0' },
                      { key: 'fats', label: 'Fats (g)', type: 'number', placeholder: '0' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="mb-1 block text-xs text-muted-foreground">{f.label}</label>
                        <input type={f.type} value={mealForm[f.key as keyof typeof mealForm]} onChange={e => setMealForm({ ...mealForm, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                        {mealErrors[f.key] && <p className="mt-1 text-xs text-destructive">{mealErrors[f.key]}</p>}
                      </div>
                    ))}
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                      <select value={mealForm.type} onChange={e => setMealForm({ ...mealForm, type: e.target.value as any })} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                        {mealTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="gradient-primary mt-4 rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground">{editMealId ? 'Update' : 'Add'} Meal</button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Meal groups */}
            {mealTypes.map(type => {
              const filtered = meals.filter(m => m.type === type);
              if (!filtered.length) return null;
              return (
                <div key={type}>
                  <h2 className="mb-3 font-display text-lg font-semibold">{mealTypeLabels[type]}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(m => {
                      const isChecked = checkedMeals.has(m.id);
                      return (
                        <div key={m.id} className={`rounded-xl border bg-card p-4 transition-all ${isChecked ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <div className="flex items-start justify-between">
                            <h4 className={`font-display font-semibold ${isChecked ? 'line-through text-muted-foreground' : ''}`}>{m.name}</h4>
                            <button
                              onClick={() => {
                                const next = new Set(checkedMeals);
                                if (isChecked) next.delete(m.id); else next.add(m.id);
                                setCheckedMeals(next);
                              }}
                              className={`rounded-full p-1.5 transition-colors ${isChecked ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 font-display text-xl font-bold text-primary">{m.calories} <span className="text-xs text-muted-foreground font-normal">kcal</span></p>
                          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                            <span>P: {m.protein}g</span>
                            <span>C: {m.carbs}g</span>
                            <span>F: {m.fats}g</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════ WORKOUTS TAB ══════════════════ */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Workouts</h2>
                <p className="text-sm text-muted-foreground">Track your exercise routines</p>
              </div>
              <button onClick={() => setShowWoForm(!showWoForm)} className="gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
                <Plus className="h-4 w-4" /> Add Exercise
              </button>
            </div>

            <AnimatePresence>
              {showWoForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleAddExercise} className="overflow-hidden rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-semibold">New Exercise</h3>
                    <button type="button" onClick={() => setShowWoForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Exercise Name</label>
                      <input type="text" value={woForm.name} onChange={e => setWoForm({ ...woForm, name: e.target.value })} placeholder="e.g. Bench Press" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      {woErrors.name && <p className="mt-1 text-xs text-destructive">{woErrors.name}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Sets</label>
                      <input type="number" value={woForm.sets} onChange={e => setWoForm({ ...woForm, sets: e.target.value })} placeholder="0" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      {woErrors.sets && <p className="mt-1 text-xs text-destructive">{woErrors.sets}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Reps</label>
                      <input type="number" value={woForm.reps} onChange={e => setWoForm({ ...woForm, reps: e.target.value })} placeholder="0" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      {woErrors.reps && <p className="mt-1 text-xs text-destructive">{woErrors.reps}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Duration (min, optional)</label>
                      <input type="number" value={woForm.duration} onChange={e => setWoForm({ ...woForm, duration: e.target.value })} placeholder="0" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Category</label>
                      <select value={woForm.category} onChange={e => setWoForm({ ...woForm, category: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                        {WORKOUT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="gradient-primary mt-4 rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground">Add Exercise</button>
                </motion.form>
              )}
            </AnimatePresence>

            {Object.entries(groupedExercises).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="mb-3 font-display text-lg font-semibold">{cat}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(ex => (
                    <div key={ex.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <h4 className="font-display font-semibold">{ex.name}</h4>
                      </div>
                      <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                        <span>{ex.sets} sets × {ex.reps} reps</span>
                        {ex.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ex.duration} min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(groupedExercises).length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No exercises added yet. Click "Add Exercise" to start tracking your workouts.</div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
