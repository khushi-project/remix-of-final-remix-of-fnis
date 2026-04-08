import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTrainers, getClients, getDietPlans, addDietPlan } from '@/services/mockData';
import { createDietAPI, isNetworkError } from '@/api/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const DietTasksTab = () => {
  const { toast } = useToast();
  const [, forceUpdate] = useState(0);
  const [newMeal, setNewMeal] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newTime, setNewTime] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [newClientId, setNewClientId] = useState('');
  const [newTrainerId, setNewTrainerId] = useState('');
  const [loading, setLoading] = useState(false);

  const trainers = getTrainers();
  const clients = getClients();
  const dietPlans = getDietPlans();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.trim() || !newCalories || !newClientId || !newTrainerId) return;

    setLoading(true);

    // Try backend first
    try {
      await createDietAPI({
        clientId: newClientId,
        trainerId: newTrainerId,
        title: newMeal,
        meals: [{ name: newMeal, calories: Number(newCalories), time: newTime }],
      });
      toast({ title: 'Diet plan created', description: 'Saved to backend successfully.' });
    } catch (err: any) {
      if (isNetworkError(err)) {
        toast({ title: 'Offline mode', description: 'Backend unavailable — saved locally.', variant: 'default' });
      } else {
        toast({ title: 'API Error', description: err.message, variant: 'destructive' });
      }
    }

    // Always save locally so UI updates immediately
    addDietPlan({
      trainerId: newTrainerId,
      clientId: newClientId,
      title: newMeal,
      meals: [{ time: newTime, description: `${newMeal} - ${newCalories} cal` }],
    });
    setNewMeal(''); setNewCalories(''); setNewClientId(''); setNewTrainerId('');
    setLoading(false);
    forceUpdate(n => n + 1);
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
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newTrainerId} onValueChange={setNewTrainerId}>
            <SelectTrigger className="bg-muted"><SelectValue placeholder="Select Trainer" /></SelectTrigger>
            <SelectContent>
              {trainers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <button type="submit" disabled={loading} className="gradient-primary rounded-lg py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Assign Diet'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">Assigned Diet Plans ({dietPlans.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {dietPlans.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">No diet plans assigned yet.</p>}
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
      </div>
    </motion.div>
  );
};

export default DietTasksTab;
