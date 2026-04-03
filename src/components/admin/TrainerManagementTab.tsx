import React, { useState } from 'react';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  email: string;
}

const seedTrainers: Trainer[] = [
  { id: 'trainer-1', name: 'Trainer 1', specialization: 'Strength Training', email: 'trainer1@fnis.com' },
  { id: 'trainer-2', name: 'Trainer 2', specialization: 'Cardio & HIIT', email: 'trainer2@fnis.com' },
  { id: 'trainer-3', name: 'Trainer 3', specialization: 'Yoga & Flexibility', email: 'trainer3@fnis.com' },
  { id: 'trainer-4', name: 'Trainer 4', specialization: 'Nutrition Coaching', email: 'trainer4@fnis.com' },
];

const TrainerManagementTab = () => {
  const [trainers, setTrainers] = useState<Trainer[]>(seedTrainers);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');

  const addTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialization.trim() || !email.trim()) return;
    setTrainers(prev => [...prev, {
      id: `trainer-${Date.now()}`,
      name: name.trim(),
      specialization: specialization.trim(),
      email: email.trim(),
    }]);
    setName('');
    setSpecialization('');
    setEmail('');
  };

  const removeTrainer = (id: string) => {
    setTrainers(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Add Trainer Form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> Add New Trainer
        </h2>
        <form onSubmit={addTrainer} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Trainer Name" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Specialization" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <button type="submit" className="gradient-primary rounded-lg py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Add Trainer
          </button>
        </form>
      </div>

      {/* Trainer List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">All Trainers ({trainers.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {trainers.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">No trainers added yet.</p>}
          {trainers.map(trainer => (
            <div key={trainer.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {trainer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{trainer.name}</p>
                  <p className="text-xs text-muted-foreground">{trainer.specialization} · {trainer.email}</p>
                </div>
              </div>
              <button onClick={() => removeTrainer(trainer.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Remove trainer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TrainerManagementTab;
