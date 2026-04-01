import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { Trash2, CheckCircle, Clock, Plus, Users, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_TRAINERS } from '@/services/mockTrainers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  assignedTrainer: string;
}

const initialClientTasks: ClientTask[] = [
  { id: '1', clientName: 'Sarah Miller', task: 'Complete weekly cardio plan', status: 'pending' },
  { id: '2', clientName: 'John Doe', task: 'Log daily meals for 7 days', status: 'in-progress' },
  { id: '3', clientName: 'Emily Chen', task: 'Reach 10k steps daily', status: 'completed' },
  { id: '4', clientName: 'Mike Ross', task: 'Follow protein intake goal', status: 'pending' },
];

const initialDietTasks: DietTask[] = [
  { id: '1', mealName: 'Oatmeal Bowl', calories: 350, time: 'Breakfast', assignedTo: 'Sarah Miller', assignedTrainer: 'Trainer 1' },
  { id: '2', mealName: 'Grilled Chicken Salad', calories: 480, time: 'Lunch', assignedTo: 'John Doe', assignedTrainer: 'Trainer 2' },
  { id: '3', mealName: 'Salmon & Quinoa', calories: 550, time: 'Dinner', assignedTo: 'Emily Chen', assignedTrainer: 'Trainer 3' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  completed: 'bg-primary/20 text-primary',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [clientTasks, setClientTasks] = useState<ClientTask[]>(initialClientTasks);
  const [dietTasks, setDietTasks] = useState<DietTask[]>(initialDietTasks);
  const [activeTab, setActiveTab] = useState<'clients' | 'diet'>('clients');

  // Diet task form
  const [newMeal, setNewMeal] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newTime, setNewTime] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [newAssignee, setNewAssignee] = useState('');
  const [newTrainer, setNewTrainer] = useState(MOCK_TRAINERS[0]?.name ?? 'Trainer 1');

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
    if (!newMeal.trim() || !newCalories || !newAssignee.trim() || !newTrainer.trim()) return;
    const task: DietTask = {
      id: Date.now().toString(),
      mealName: newMeal,
      calories: Number(newCalories),
      time: newTime,
      assignedTo: newAssignee,
      assignedTrainer: newTrainer,
    };
    setDietTasks(prev => [...prev, task]);
    setNewMeal('');
    setNewCalories('');
    setNewAssignee('');
    setNewTrainer(MOCK_TRAINERS[0]?.name ?? 'Trainer 1');
  };

  const deleteDietTask = (id: string) => {
    setDietTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content offset by sidebar */}
      <main className="pl-16 transition-all duration-300 md:pl-60">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Clients', value: '4', icon: Users },
              { label: 'Active Tasks', value: clientTasks.filter(t => t.status !== 'completed').length.toString(), icon: Clock },
              { label: 'Diet Plans', value: dietTasks.length.toString(), icon: Utensils },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5"
              >
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

          {/* Content */}
          {activeTab === 'clients' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <h2 className="font-display font-bold">Client Tasks</h2>
              </div>
              <div className="divide-y divide-border">
                {clientTasks.length === 0 && (
                  <p className="p-5 text-center text-sm text-muted-foreground">No tasks.</p>
                )}
                {clientTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{task.task}</p>
                      <p className="text-xs text-muted-foreground">{task.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      <button
                        onClick={() => updateTaskStatus(task.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Cycle status"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                        title="Delete"
                      >
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
                <h2 className="mb-4 font-display font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Add Diet Task
                </h2>
                <form onSubmit={addDietTask} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <input
                    value={newMeal}
                    onChange={e => setNewMeal(e.target.value)}
                    placeholder="Meal Name"
                    required
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={newCalories}
                    onChange={e => setNewCalories(e.target.value)}
                    placeholder="Calories"
                    required
                    min={1}
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <Select value={newTime} onValueChange={value => setNewTime(value as DietTask['time'])}>
                    <SelectTrigger className="bg-muted">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    placeholder="Assign to Client"
                    required
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <Select value={newTrainer} onValueChange={setNewTrainer}>
                    <SelectTrigger className="bg-muted">
                      <SelectValue placeholder="Assign trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_TRAINERS.map(trainer => (
                        <SelectItem key={trainer.id} value={trainer.name}>
                          {trainer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="submit"
                    className="gradient-primary rounded-lg py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                  >
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
                  {dietTasks.length === 0 && (
                    <p className="p-5 text-center text-sm text-muted-foreground">No diet tasks.</p>
                  )}
                  {dietTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium">{task.mealName}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.calories} cal · {task.time} · Assigned to {task.assignedTo} · {task.assignedTrainer}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteDietTask(task.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
