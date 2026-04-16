import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  User, Utensils, CheckCircle, Edit2, Save, X,
  Dumbbell, TrendingUp, Flame, Target, Clock, AlertCircle, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ─── Empty-state helper ─────────────────────────────────────
const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
    <Icon className="mb-3 h-8 w-8 text-muted-foreground/50" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// ─── Calorie Ring (supports 0 state) ────────────────────────
const CalorieRing = ({ consumed, goal }: { consumed: number; goal: number }) => {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
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
        {consumed > 0 ? (
          <>
            <span className="font-display text-3xl font-bold">{consumed}</span>
            <span className="text-xs text-muted-foreground">/ {goal} kcal</span>
          </>
        ) : (
          <>
            <span className="font-display text-lg font-semibold text-muted-foreground">No data yet</span>
            <span className="text-xs text-muted-foreground">/ {goal} kcal</span>
          </>
        )}
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const {
    meals, exercises, dailyGoals, weeklyCalories, trainer,
    totals, isLoading, error, refreshData,
  } = useClientDashboard();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'diet' | 'workouts'>('overview');
  const [checkedMeals, setCheckedMeals] = useState<Set<string>>(new Set());
  const [checkedWorkouts, setCheckedWorkouts] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editJoinWeight, setEditJoinWeight] = useState(user?.joinWeight?.toString() || '');
  const [editCurrentWeight, setEditCurrentWeight] = useState(user?.currentWeight?.toString() || '');

  if (!user) return null;

  // ─── Derived data ─────────────────────────────────────────
  const stats = [
    { icon: Flame, label: 'Calories', value: totals.calories > 0 ? `${totals.calories}` : '0', sub: `/ ${dailyGoals.calories}`, empty: totals.calories === 0 },
    { icon: Target, label: 'Protein', value: totals.protein > 0 ? `${totals.protein}g` : '0g', sub: `/ ${dailyGoals.protein}g`, empty: totals.protein === 0 },
    { icon: TrendingUp, label: 'Meals Logged', value: `${totals.mealsLogged}`, sub: 'today', empty: totals.mealsLogged === 0 },
    { icon: Dumbbell, label: 'Exercises', value: `${totals.exerciseCount}`, sub: 'assigned', empty: totals.exerciseCount === 0 },
  ];

  const macroData = [
    { name: 'Protein', value: totals.protein, goal: dailyGoals.protein, color: 'hsl(var(--chart-1))' },
    { name: 'Carbs', value: totals.carbs, goal: dailyGoals.carbs, color: 'hsl(var(--chart-2))' },
    { name: 'Fats', value: totals.fats, goal: dailyGoals.fats, color: 'hsl(var(--chart-3))' },
  ];
  const hasMacros = totals.protein + totals.carbs + totals.fats > 0;

  const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealTypeLabels: Record<string, string> = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snack' };

  const WORKOUT_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Core'];
  const groupedExercises = WORKOUT_CATEGORIES.reduce((acc, cat) => {
    const items = exercises.filter(e => e.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof exercises>);

  const handleSaveProfile = () => {
    const updates = {
      name: editName,
      phone: editPhone,
      joinWeight: editJoinWeight ? Number(editJoinWeight) : undefined,
      currentWeight: editCurrentWeight ? Number(editCurrentWeight) : undefined,
    };
    updateProfile(updates);
    setEditing(false);
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: Flame },
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'diet' as const, label: 'Tracked Meals', icon: Utensils },
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

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button onClick={refreshData} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mb-6 flex items-center justify-center gap-2 p-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading your dashboard…</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {!isLoading && (
          <>
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
                          {s.empty ? (
                            <p className="text-sm text-muted-foreground/60 italic">No data yet</p>
                          ) : (
                            <p className="font-display text-xl font-bold">
                              {s.value} <span className="text-xs text-muted-foreground font-normal">{s.sub}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calorie ring */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-6 font-display text-lg font-semibold">Daily Progress</h2>
                  <div className="flex justify-center">
                    <CalorieRing consumed={totals.calories} goal={dailyGoals.calories} />
                  </div>
                </div>

                {/* Charts grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Macro breakdown */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold">Macro Breakdown</h3>
                    {hasMacros ? (
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
                              <span className="font-display text-lg font-bold">
                                {d.value}g <span className="text-xs text-muted-foreground font-normal">/ {d.goal}g</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="flex items-center gap-6 mb-4">
                          {macroData.map(d => (
                            <div key={d.name} className="text-center">
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-muted-foreground">{d.name}</span>
                              </div>
                              <span className="font-display text-lg font-bold text-muted-foreground/50">
                                0g <span className="text-xs font-normal">/ {d.goal}g</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground/60 italic">No nutrition data logged yet</p>
                      </div>
                    )}
                  </div>

                  {/* Weekly calories bar chart */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold">Weekly Calories</h3>
                    {weeklyCalories.some(d => d.calories > 0) ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyCalories}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={weeklyCalories}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 2500]} />
                            <Bar dataKey="calories" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-muted-foreground/60 italic mt-2">No calorie data this week</p>
                      </div>
                    )}
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
                    {editing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                    ) : (
                      <p className="text-sm font-medium">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Email (read-only)</label>
                    <p className="text-sm font-medium text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Phone Number</label>
                    {editing ? (
                      <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                        placeholder="Enter phone number" />
                    ) : (
                      <p className="text-sm font-medium">{user.phone || 'Not set'}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Weight at Joining (kg)</label>
                      {editing ? (
                        <input type="number" value={editJoinWeight} onChange={e => setEditJoinWeight(e.target.value)}
                          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      ) : (
                        <p className="text-sm font-medium">{user.joinWeight ? `${user.joinWeight} kg` : 'Not set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Current Weight (kg)</label>
                      {editing ? (
                        <input type="number" value={editCurrentWeight} onChange={e => setEditCurrentWeight(e.target.value)}
                          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      ) : (
                        <p className="text-sm font-medium">{user.currentWeight ? `${user.currentWeight} kg` : 'Not set'}</p>
                      )}
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
                    ) : (
                      <p className="text-sm font-medium mt-1 text-muted-foreground/60 italic">No trainer assigned yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ TRACKED MEALS TAB ══════════════════ */}
            {activeTab === 'diet' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Tracked Meals</h2>
                  <p className="text-sm text-muted-foreground">Your daily meal tracking</p>
                </div>

                {meals.length > 0 ? (
                  <>
                    {mealTypes.map(type => {
                      const filtered = meals.filter(m => m.type === type);
                      if (!filtered.length) return null;
                      return (
                        <div key={type}>
                          <h3 className="mb-3 font-display text-base font-semibold">{mealTypeLabels[type]}</h3>
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
                  </>
                ) : (
                  <EmptyState icon={Utensils} message="No meals tracked yet. Your diet data will appear here once connected." />
                )}
              </div>
            )}

            {/* ══════════════════ WORKOUTS TAB ══════════════════ */}
            {activeTab === 'workouts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Your Workouts</h2>
                  <p className="text-sm text-muted-foreground">
                    {trainer ? `Assigned by: ${trainer.name}` : 'Exercises assigned by your admin / trainer'}
                  </p>
                </div>

                {Object.entries(groupedExercises).map(([cat, items]) => (
                  <div key={cat}>
                    <h2 className="mb-3 font-display text-lg font-semibold">{cat}</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map(ex => {
                        const isChecked = checkedWorkouts.has(ex.id);
                        return (
                          <div key={ex.id} className={`rounded-xl border bg-card p-4 transition-all ${isChecked ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Dumbbell className="h-4 w-4 text-primary" />
                                <h4 className={`font-display font-semibold ${isChecked ? 'line-through text-muted-foreground' : ''}`}>{ex.name}</h4>
                              </div>
                              <button
                                onClick={() => {
                                  const next = new Set(checkedWorkouts);
                                  if (isChecked) next.delete(ex.id); else next.add(ex.id);
                                  setCheckedWorkouts(next);
                                }}
                                className={`rounded-full p-1.5 transition-colors ${isChecked ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                              <span>{ex.sets} sets × {ex.reps} reps</span>
                              {ex.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ex.duration} min</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(groupedExercises).length === 0 && (
                  <EmptyState icon={Dumbbell} message="No exercises assigned yet. Your workouts will appear here once your admin or trainer assigns them." />
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
