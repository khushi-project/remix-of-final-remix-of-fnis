import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Utensils, ClipboardCheck, CheckCircle, Edit2, Save, X, Dumbbell, Plus, TrendingUp } from 'lucide-react';
import { getDietPlansForClient, acceptDietPlan, addMealLog, getMealLogs, getClientTrainer, getTrainerById, updateClient, type MealLog } from '@/services/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

// ─── Workout types & localStorage helpers ───────────────────
interface WorkoutEntry {
  id: string;
  clientId: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number; // minutes
  caloriesBurned: number;
}

const WO_KEY = 'fnis_workouts';
const getWorkouts = (clientId: string): WorkoutEntry[] => {
  try {
    return (JSON.parse(localStorage.getItem(WO_KEY) || '[]') as WorkoutEntry[]).filter(w => w.clientId === clientId);
  } catch { return []; }
};
const addWorkout = (entry: Omit<WorkoutEntry, 'id'>): WorkoutEntry => {
  const all: WorkoutEntry[] = JSON.parse(localStorage.getItem(WO_KEY) || '[]');
  const newW: WorkoutEntry = { ...entry, id: `wo-${Date.now()}` };
  all.push(newW);
  localStorage.setItem(WO_KEY, JSON.stringify(all));
  return newW;
};

// ─── Nutrition mock data helpers ────────────────────────────
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
  { name: 'Protein', value: 35, color: 'hsl(84, 81%, 44%)' },
  { name: 'Carbs', value: 45, color: 'hsl(199, 89%, 48%)' },
  { name: 'Fats', value: 20, color: 'hsl(45, 93%, 47%)' },
];

const EXERCISE_OPTIONS = [
  'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press',
  'Shoulder Press', 'Lunges', 'Plank', 'Burpees', 'Cycling',
  'Running', 'Jump Rope', 'Lat Pulldown', 'Bicep Curls', 'Tricep Dips',
];

const ClientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'diet' | 'meals' | 'workouts' | 'progress'>('profile');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editJoinWeight, setEditJoinWeight] = useState(user?.joinWeight?.toString() || '');
  const [editCurrentWeight, setEditCurrentWeight] = useState(user?.currentWeight?.toString() || '');
  const [, forceUpdate] = useState(0);
  const [mealInput, setMealInput] = useState('');
  const [selectedMealTime, setSelectedMealTime] = useState('Breakfast');

  // Workout form state
  const [woExercise, setWoExercise] = useState(EXERCISE_OPTIONS[0]);
  const [woSets, setWoSets] = useState('3');
  const [woReps, setWoReps] = useState('12');
  const [woWeight, setWoWeight] = useState('');
  const [woDuration, setWoDuration] = useState('');
  const [woCalories, setWoCalories] = useState('');

  if (!user) return null;

  const dietPlans = getDietPlansForClient(user.id);
  const mealLogs = getMealLogs(user.id);
  const trainerRel = getClientTrainer(user.id);
  const trainer = trainerRel ? getTrainerById(trainerRel.trainerId) : undefined;
  const workouts = getWorkouts(user.id);

  const handleSaveProfile = () => {
    const updates = {
      name: editName,
      phone: editPhone,
      joinWeight: editJoinWeight ? Number(editJoinWeight) : undefined,
      currentWeight: editCurrentWeight ? Number(editCurrentWeight) : undefined,
    };
    updateProfile(updates);
    updateClient(user.id, updates);
    setEditing(false);
  };

  const handleAcceptPlan = (planId: string) => {
    acceptDietPlan(planId);
    forceUpdate(n => n + 1);
  };

  const handleLogMeal = (followedPlan: boolean) => {
    addMealLog({
      clientId: user.id,
      date: new Date().toISOString().split('T')[0],
      mealTime: selectedMealTime,
      followedPlan,
      actualMeal: followedPlan ? undefined : mealInput,
    });
    setMealInput('');
    forceUpdate(n => n + 1);
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkout({
      clientId: user.id,
      date: new Date().toISOString().split('T')[0],
      exercise: woExercise,
      sets: Number(woSets),
      reps: Number(woReps),
      weight: Number(woWeight) || 0,
      duration: Number(woDuration) || 0,
      caloriesBurned: Number(woCalories) || 0,
    });
    setWoSets('3'); setWoReps('12'); setWoWeight(''); setWoDuration(''); setWoCalories('');
    forceUpdate(n => n + 1);
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'diet' as const, label: 'Diet Plans', icon: Utensils },
    { key: 'meals' as const, label: 'Meal Tracking', icon: ClipboardCheck },
    { key: 'workouts' as const, label: 'Workouts', icon: Dumbbell },
    { key: 'progress' as const, label: 'Progress', icon: TrendingUp },
  ];

  const dailyKcal = generateDailyKcal();
  const weeklyKcal = generateWeeklyKcal();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-2xl font-bold mb-6">Client Dashboard</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.key ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
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
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
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
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="Enter phone number" />
                ) : (
                  <p className="text-sm font-medium">{user.phone || 'Not set'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Weight at Joining (kg)</label>
                  {editing ? (
                    <input type="number" value={editJoinWeight} onChange={e => setEditJoinWeight(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  ) : (
                    <p className="text-sm font-medium">{user.joinWeight ? `${user.joinWeight} kg` : 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Current Weight (kg)</label>
                  {editing ? (
                    <input type="number" value={editCurrentWeight} onChange={e => setEditCurrentWeight(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
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
                  <p className="text-sm font-medium mt-1">No trainer assigned</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diet Plans Tab */}
        {activeTab === 'diet' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-lg font-semibold">Your Diet Plans</h2>
            {dietPlans.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No diet plans assigned yet. Your trainer will create one for you.
              </div>
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
                    {plan.meals.map((meal, i) => (
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

        {/* Meal Tracking Tab */}
        {activeTab === 'meals' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-display text-lg font-semibold">Meal Tracking</h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Meal Time</label>
                <select value={selectedMealTime} onChange={e => setSelectedMealTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                  {['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleLogMeal(true)} className="flex-1 rounded-lg border border-primary bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                  ✅ Followed Diet Plan
                </button>
                <button onClick={() => mealInput ? handleLogMeal(false) : null} className="flex-1 rounded-lg border border-border bg-muted py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  📝 Log Different Meal
                </button>
              </div>
              <input value={mealInput} onChange={e => setMealInput(e.target.value)}
                placeholder="What did you eat instead?"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Logs</h3>
              {getMealLogs(user.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">No meals logged yet.</p>
              ) : (
                getMealLogs(user.id).slice(-10).reverse().map(log => (
                  <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
                    <span className="text-muted-foreground min-w-[80px]">{log.mealTime}</span>
                    <span className="text-muted-foreground min-w-[80px]">{log.date}</span>
                    {log.followedPlan ? (
                      <span className="text-primary font-medium">✅ Followed plan</span>
                    ) : (
                      <span>{log.actualMeal}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="max-w-3xl space-y-6">
            <h2 className="font-display text-lg font-semibold">Workout Tracker</h2>

            {/* Add Workout Form */}
            <form onSubmit={handleAddWorkout} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Log Workout</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-1 block text-xs text-muted-foreground">Exercise</label>
                  <select value={woExercise} onChange={e => setWoExercise(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                    {EXERCISE_OPTIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Sets</label>
                  <input type="number" value={woSets} onChange={e => setWoSets(e.target.value)} min="1"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Reps</label>
                  <input type="number" value={woReps} onChange={e => setWoReps(e.target.value)} min="1"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Weight (kg)</label>
                  <input type="number" value={woWeight} onChange={e => setWoWeight(e.target.value)} placeholder="0"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Duration (min)</label>
                  <input type="number" value={woDuration} onChange={e => setWoDuration(e.target.value)} placeholder="0"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Calories Burned</label>
                  <input type="number" value={woCalories} onChange={e => setWoCalories(e.target.value)} placeholder="0"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Add Workout
              </button>
            </form>

            {/* Workout History */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Workouts</h3>
              {workouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Exercise</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Sets × Reps</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Weight</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Duration</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Kcal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workouts.slice().reverse().slice(0, 15).map(w => (
                        <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">{w.date}</td>
                          <td className="px-4 py-3 font-medium">{w.exercise}</td>
                          <td className="px-4 py-3 text-center">{w.sets} × {w.reps}</td>
                          <td className="px-4 py-3 text-center">{w.weight ? `${w.weight} kg` : '—'}</td>
                          <td className="px-4 py-3 text-center">{w.duration ? `${w.duration} min` : '—'}</td>
                          <td className="px-4 py-3 text-center text-primary font-medium">{w.caloriesBurned || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-8 max-w-4xl">
            <h2 className="font-display text-lg font-semibold">Progress & Nutrition</h2>

            {/* Daily Kcal Progress (Line Chart) */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Daily Calorie Progress</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dailyKcal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="time" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', color: 'hsl(0, 0%, 95%)' }} />
                  <Line type="monotone" dataKey="kcal" stroke="hsl(84, 81%, 44%)" strokeWidth={2} dot={{ fill: 'hsl(84, 81%, 44%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Kcal Bar Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Weekly Calorie Intake</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyKcal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', color: 'hsl(0, 0%, 95%)' }} />
                  <Bar dataKey="kcal" fill="hsl(84, 81%, 44%)" radius={[4, 4, 0, 0]} name="Intake" />
                  <Bar dataKey="goal" fill="hsl(220, 14%, 25%)" radius={[4, 4, 0, 0]} name="Goal" />
                  <Legend wrapperStyle={{ color: 'hsl(220, 10%, 55%)' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Breakdown Pie Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Macro Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {macroData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', color: 'hsl(0, 0%, 95%)' }} />
                  <Legend wrapperStyle={{ color: 'hsl(220, 10%, 55%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
