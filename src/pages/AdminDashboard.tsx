import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Trash2, CheckCircle, Clock, Plus, Users, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientTask {
  id: string;
  clientName: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface DietTask {
  id: string;
  mealName: string;
  calories: number;
  time: 'Breakfast' | 'Lunch' | 'Dinner';
  assignedTo: string;
}

const initialClientTasks: ClientTask[] = [
  { id: '1', clientName: 'Sarah Miller', task: 'Complete weekly cardio plan', status: 'pending' },
  { id: '2', clientName: 'John Doe', task: 'Log daily meals for 7 days', status: 'in-progress' },
  { id: '3', clientName: 'Emily Chen', task: 'Reach 10k steps daily', status: 'completed' },
  { id: '4', clientName: 'Mike Ross', task: 'Follow protein intake goal', status: 'pending' },
];

const initialDietTasks: DietTask[] = [
  { id: '1', mealName: 'Oatmeal Bowl', calories: 350, time: 'Breakfast', assignedTo: 'Sarah Miller' },
  { id: '2', mealName: 'Grilled Chicken Salad', calories: 480, time: 'Lunch', assignedTo: 'John Doe' },
  { id: '3', mealName: 'Salmon & Quinoa', calories: 550, time: 'Dinner', assignedTo: 'Emily Chen' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  completed: 'bg-primary/20 text-primary',
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [clientTasks, setClientTasks] = useState<ClientTask[]>(initialClientTasks);
  const [dietTasks, setDietTasks] = useState<DietTask[]>(initialDietTasks);
  const [activeTab, setActiveTab] = useState<'clients' | 'diet'>('clients');

  // Diet task form
  const [newMeal, setNewMeal] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newTime, setNewTime] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [newAssignee, setNewAssignee] = useState('');

  const updateTaskStatus = (id: string) => {
    setClientTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const next = t.status === 'pending' ? 'in-progress' : t.status === 'in-progress' ? 'completed' : 'pending';
        return { ...t, status: next as ClientTask['status'] };
      })
    );
  };

  const deleteTask = (id: string) => {
    setClientTasks(prev => prev.filter(t => t.id !== id));
  };

  const addDietTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.trim() || !newCalories || !newAssignee.trim()) return;
    const task: DietTask = {
      id: Date.now().toString(),
      mealName: newMeal,
      calories: Number(newCalories),
      time: newTime,
      assignedTo: newAssignee,
    };
    setDietTasks(prev => [...prev, task]);
    setNewMeal('');
    setNewCalories('');
    setNewAssignee('');
  };

  const deleteDietTask = (id: string) => {
    setDietTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">ADMIN</span>
              </div>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Clients', value: '4', icon: Users },
            { label: 'Active Tasks', value: clientTasks.filter(t => t.status !== 'completed').length.toString(), icon: Clock },
            { label: 'Diet Plans', value: dietTasks.length.toString(), icon: Utensils },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button onClick={() => setActiveTab('clients')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'clients' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}>
            Client Tasks
          </button>
          <button onClick={() => setActiveTab('diet')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'diet' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}>
            Diet Management
          </button>
        </div>

        {activeTab === 'clients' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h2 className="font-display font-bold">Client Tasks</h2>
            </div>
            <div className="divide-y divide-border">
              {clientTasks.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">No tasks.</p>}
              {clientTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.clientName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
                    <button onClick={() => updateTaskStatus(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Cycle status">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Add Diet Task Form */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display font-bold flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Add Diet Task</h2>
              <form onSubmit={addDietTask} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input value={newMeal} onChange={e => setNewMeal(e.target.value)} placeholder="Meal Name" required
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                <input type="number" value={newCalories} onChange={e => setNewCalories(e.target.value)} placeholder="Calories" required min={1}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                <select value={newTime} onChange={e => setNewTime(e.target.value as DietTask['time'])}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                </select>
                <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} placeholder="Assign to Client" required
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                <button type="submit" className="gradient-primary rounded-lg py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
                  Add Task
                </button>
              </form>
            </div>

            {/* Diet Tasks List */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <h2 className="font-display font-bold">Assigned Diet Plans</h2>
              </div>
              <div className="divide-y divide-border">
                {dietTasks.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">No diet tasks.</p>}
                {dietTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{task.mealName}</p>
                      <p className="text-xs text-muted-foreground">{task.calories} cal · {task.time} · Assigned to {task.assignedTo}</p>
                    </div>
                    <button onClick={() => deleteDietTask(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
