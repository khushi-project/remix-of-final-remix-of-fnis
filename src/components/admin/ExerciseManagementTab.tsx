import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getClients, getAllAssignedExercises, addAssignedExercise, removeAssignedExercise,
  type ClientProfile,
} from '@/services/mockData';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const WORKOUT_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Core'];

const ExerciseManagementTab = () => {
  const { toast } = useToast();
  const [, forceUpdate] = useState(0);
  const [loading, setLoading] = useState(false);

  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('');
  const [exReps, setExReps] = useState('');
  const [exDuration, setExDuration] = useState('');
  const [exCategory, setExCategory] = useState('Chest');
  const [exClientId, setExClientId] = useState('');

  const clients = getClients();
  const allExercises = getAllAssignedExercises();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim() || !exSets || !exReps || !exClientId) {
      toast({ title: 'Missing fields', description: 'Fill in all required fields.', variant: 'destructive' });
      return;
    }
    addAssignedExercise({
      clientId: exClientId,
      name: exName.trim(),
      sets: Number(exSets),
      reps: Number(exReps),
      duration: exDuration ? Number(exDuration) : undefined,
      category: exCategory,
    });
    toast({ title: 'Exercise assigned', description: `${exName} assigned to client.` });
    setExName(''); setExSets(''); setExReps(''); setExDuration('');
    setExCategory('Chest'); setExClientId('');
    forceUpdate(n => n + 1);
  };

  const handleRemove = (id: string) => {
    removeAssignedExercise(id);
    forceUpdate(n => n + 1);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || id;

  // Group exercises by client
  const byClient = allExercises.reduce((acc, ex) => {
    if (!acc[ex.clientId]) acc[ex.clientId] = [];
    acc[ex.clientId].push(ex);
    return acc;
  }, {} as Record<string, typeof allExercises>);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Add Exercise Form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display font-bold flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" /> Assign Exercise to Client
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Exercise Name *</label>
              <input value={exName} onChange={e => setExName(e.target.value)} placeholder="e.g. Bench Press" required className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Sets *</label>
              <input type="number" value={exSets} onChange={e => setExSets(e.target.value)} placeholder="4" required min={1} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Reps *</label>
              <input type="number" value={exReps} onChange={e => setExReps(e.target.value)} placeholder="10" required min={1} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Duration (min, optional)</label>
              <input type="number" value={exDuration} onChange={e => setExDuration(e.target.value)} placeholder="30" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Category</label>
              <Select value={exCategory} onValueChange={setExCategory}>
                <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORKOUT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Assign to Client *</label>
              <Select value={exClientId} onValueChange={setExClientId}>
                <SelectTrigger className="bg-muted"><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <button type="submit" className="gradient-primary rounded-lg px-6 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] flex items-center gap-2">
            <Plus className="h-4 w-4" /> Assign Exercise
          </button>
        </form>
      </div>

      {/* Assigned Exercises grouped by client */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">Assigned Exercises ({allExercises.length})</h2>
        </div>
        {allExercises.length === 0 ? (
          <p className="p-5 text-center text-sm text-muted-foreground">No exercises assigned yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {Object.entries(byClient).map(([clientId, exercises]) => (
              <div key={clientId} className="px-5 py-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/30 text-xs font-bold text-accent-foreground">
                    {getClientName(clientId).charAt(0)}
                  </div>
                  {getClientName(clientId)}
                  <span className="text-xs text-muted-foreground font-normal">({exercises.length} exercises)</span>
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {exercises.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium">{ex.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ex.sets}×{ex.reps} · {ex.category}
                          {ex.duration ? ` · ${ex.duration} min` : ''}
                        </p>
                      </div>
                      <button onClick={() => handleRemove(ex.id)} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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

export default ExerciseManagementTab;
