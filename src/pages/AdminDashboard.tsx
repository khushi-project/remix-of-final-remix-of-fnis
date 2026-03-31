import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNutrition, Meal } from '@/context/NutritionContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Trash2, CheckCircle, Clock, Plus, Users, UtensilsCrossed, LogOut } from 'lucide-react';

interface ClientTask {
  id: string;
  clientName: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const defaultTasks: ClientTask[] = [
  { id: '1', clientName: 'Sarah Miller', task: 'Complete weekly meal log', status: 'pending' },
  { id: '2', clientName: 'John Doe', task: 'Follow high-protein plan', status: 'in-progress' },
  { id: '3', clientName: 'Emily Chen', task: '30-min cardio daily', status: 'completed' },
  { id: '4', clientName: 'Mike Ross', task: 'Track water intake', status: 'pending' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  'in-progress': 'bg-blue-500/10 text-blue-500',
  completed: 'bg-primary/10 text-primary',
};

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated, logout } = useAuth();
  const { meals, addMeal, deleteMeal } = useNutrition();
  const [tasks, setTasks] = useState<ClientTask[]>(defaultTasks);

  // Diet task form
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [assignTo, setAssignTo] = useState('');

  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" />;

  const updateTaskStatus = (id: string, status: ClientTask['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddDietTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !mealCalories) return;
    addMeal({
      name: mealName,
      calories: Number(mealCalories),
      protein: 0,
      carbs: 0,
      fats: 0,
      type: mealTime,
    });
    if (assignTo.trim()) {
      setTasks(prev => [...prev, {
        id: Date.now().toString(),
        clientName: assignTo,
        task: `Follow diet: ${mealName} (${mealTime})`,
        status: 'pending',
      }]);
    }
    setMealName('');
    setMealCalories('');
    setAssignTo('');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">ADMIN</span>
              </div>
              <p className="text-sm text-muted-foreground">Manage clients and diet tasks</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Client Task Control */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Client Tasks</h2>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tasks.length}</span>
            </div>

            <div className="space-y-3">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.task}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <select
                      value={t.status}
                      onChange={e => updateTaskStatus(t.id, e.target.value as ClientTask['status'])}
                      className={`rounded-md px-2 py-1 text-xs font-medium border-none outline-none cursor-pointer ${statusColors[t.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button onClick={() => deleteTask(t.id)} className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No tasks yet</p>
              )}
            </div>
          </section>

          {/* Diet Task Management */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Add Diet Task</h2>
            </div>

            <form onSubmit={handleAddDietTask} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Meal Name</label>
                <input
                  value={mealName}
                  onChange={e => setMealName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="e.g. Grilled Chicken Salad"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Calories</label>
                  <input
                    type="number"
                    value={mealCalories}
                    onChange={e => setMealCalories(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="350"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Time</label>
                  <select
                    value={mealTime}
                    onChange={e => setMealTime(e.target.value as 'breakfast' | 'lunch' | 'dinner')}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Assign to Client (optional)</label>
                <input
                  value={assignTo}
                  onChange={e => setAssignTo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Client name"
                />
              </div>
              <button type="submit" className="gradient-primary flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-display font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
                <Plus className="h-4 w-4" /> Add Diet Task
              </button>
            </form>

            {/* Recent meals list */}
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Recent Meals ({meals.length})</p>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {meals.map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{m.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{m.calories} cal • {m.type}</span>
                    </div>
                    <button onClick={() => deleteMeal(m.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
