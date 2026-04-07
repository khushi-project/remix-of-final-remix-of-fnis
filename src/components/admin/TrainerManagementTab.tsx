import React, { useState } from 'react';
import { Trash2, Plus, UserPlus, X, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTrainers, addTrainer, removeTrainer, getTrainerClients, getDietPlansForTrainer, type TrainerProfile } from '@/services/mockData';

const TrainerManagementTab = () => {
  const [, forceUpdate] = useState(0);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);

  const trainers = getTrainers();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialization.trim()) return;
    addTrainer({ name: name.trim(), email: email.trim(), phone: phone.trim(), specialization: specialization.trim() });
    setName(''); setSpecialization(''); setPhone(''); setEmail('');
    forceUpdate(n => n + 1);
  };

  const handleRemove = (id: string) => {
    removeTrainer(id);
    if (selectedTrainer?.id === id) setSelectedTrainer(null);
    forceUpdate(n => n + 1);
  };

  const trainerClients = (trainerId: string) => getTrainerClients(trainerId);
  const trainerDietPlans = (trainerId: string) => getDietPlansForTrainer(trainerId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Add Trainer Form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> Add New Trainer
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Trainer Name" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Specialization" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
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
          {trainers.map(trainer => {
            const clients = trainerClients(trainer.id);
            return (
              <div key={trainer.id} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTrainer(trainer)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {trainer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{trainer.name}</p>
                    <p className="text-xs text-muted-foreground">{trainer.specialization} · {trainer.email} · {clients.length} clients</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleRemove(trainer.id); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Remove trainer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedTrainer(null)}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold">Trainer Profile</h2>
              <button onClick={() => setSelectedTrainer(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {selectedTrainer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedTrainer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTrainer.specialization}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{selectedTrainer.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedTrainer.phone || 'Not set'}</p></div>
                <div><p className="text-xs text-muted-foreground">Date Joined</p><p className="text-sm font-medium">{selectedTrainer.dateJoined}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Clients</p><p className="text-sm font-medium">{trainerClients(selectedTrainer.id).length}</p></div>
                <div><p className="text-xs text-muted-foreground">Diet Plans Created</p><p className="text-sm font-medium">{trainerDietPlans(selectedTrainer.id).length}</p></div>
              </div>

              {/* Assigned Clients */}
              {trainerClients(selectedTrainer.id).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> Assigned Clients</p>
                  <div className="space-y-1">
                    {trainerClients(selectedTrainer.id).map(tc => (
                      <div key={tc.clientId} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                        <span className="font-medium">{tc.clientName}</span>
                        <span className="text-muted-foreground">· {tc.clientEmail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TrainerManagementTab;
