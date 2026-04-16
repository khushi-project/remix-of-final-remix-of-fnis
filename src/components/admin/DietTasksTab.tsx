import React, { useState } from 'react';
import { Plus, Loader2, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminData } from '@/context/AdminContext';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const DietTasksTab = () => {
  const { trainers, clients, dietPlans, addDietPlan } = useAdminData();
  const [newMeal, setNewMeal] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newTime, setNewTime] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [newClientId, setNewClientId] = useState('');
  const [newTrainerId, setNewTrainerId] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.trim() || !newCalories || !newClientId || !newTrainerId) return;

    addDietPlan({
      trainerId: newTrainerId,
      clientId: newClientId,
      title: newMeal,
      meals: [{ time: newTime, description: `${newMeal} - ${newCalories} cal` }],
    });
    setNewMeal(''); setNewCalories(''); setNewClientId(''); setNewTrainerId('');
  };

  const getTrainerName = (id: string) => trainers.find(t => t.id === id)?.name || id;
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display font-bold flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Assign Diet Plan to Client
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input value={newMeal} onChange={e => setNewMeal(e.target.value)} placeholder="Meal / Plan Name" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input type="number" value={newCalories} onChange={e => setNewCalories(e.target.value)} placeholder="Calories" required min={1} className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <Select value={newTime} onValueChange={v => setNewTime(v as 'Breakfast' | 'Lunch' | 'Dinner')}>
            <SelectTrigger className="bg-muted"><SelectValue placeholder="Select time" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newClientId} onValueChange={setNewClientId}>
            <SelectTrigger className="bg-muted"><SelectValue placeholder="Select Client" /></SelectTrigger>
            <SelectContent>
              {clients.length === 0 ? (
                <SelectItem value="none" disabled>No clients yet</SelectItem>
              ) : (
                clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
              )}
            </SelectContent>
          </Select>
          <Select value={newTrainerId} onValueChange={setNewTrainerId}>
            <SelectTrigger className="bg-muted"><SelectValue placeholder="Select Trainer" /></SelectTrigger>
            <SelectContent>
              {trainers.length === 0 ? (
                <SelectItem value="none" disabled>No trainers yet</SelectItem>
              ) : (
                trainers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)
              )}
            </SelectContent>
          </Select>
          <button type="submit" className="gradient-primary rounded-lg py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Assign Diet
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">Assigned Diet Plans ({dietPlans.length})</h2>
        </div>
        {dietPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Utensils className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No diet plans assigned yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add trainers and clients first, then assign diet plans.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dietPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Client: {getClientName(plan.clientId)} · Trainer: {getTrainerName(plan.trainerId)} ·
                    <span className={plan.status === 'accepted' ? ' text-primary' : ' text-yellow-500'}> {plan.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {plan.meals.map((m, i) => (
                    <span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{m.time}: {m.description}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DietTasksTab;
