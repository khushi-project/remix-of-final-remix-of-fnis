import React, { useState, useEffect } from 'react';
import { Trash2, Plus, UserPlus, X, Link, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getClients, addClient, removeClient, getClientTrainer, getDietPlansForClient,
  getTrainerById, getTrainers, addTrainerClient, removeTrainerClient,
  type ClientProfile,
} from '@/services/mockData';
import { assignTrainerAPI, unassignTrainerAPI, isNetworkError } from '@/api/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ClientManagementTab = () => {
  const { toast } = useToast();
  const [, forceUpdate] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [assigningClient, setAssigningClient] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clients = getClients();
  const trainers = getTrainers();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addClient({ name: name.trim(), email: email.trim(), phone: phone.trim(), goal: goal.trim() });
    setName(''); setEmail(''); setPhone(''); setGoal('');
    forceUpdate(n => n + 1);
  };

  const handleRemove = (id: string) => {
    removeClient(id);
    if (selectedClient?.id === id) setSelectedClient(null);
    forceUpdate(n => n + 1);
  };

  const handleAssignTrainer = async (clientId: string, trainerId: string) => {
    setLoading(true);
    try {
      await assignTrainerAPI(clientId, trainerId);
      toast({ title: 'Trainer assigned', description: 'Trainer assigned via backend successfully.' });
    } catch (err: any) {
      if (!isNetworkError(err)) {
        toast({ title: 'API Error', description: err.message, variant: 'destructive' });
      }
    }
    // Always update local mock data so UI reflects change immediately
    const trainer = trainers.find(t => t.id === trainerId);
    const client = clients.find(c => c.id === clientId);
    if (trainer && client) {
      // Remove old assignment first
      const oldRel = getClientTrainer(clientId);
      if (oldRel) removeTrainerClient(oldRel.trainerId, clientId);
      addTrainerClient({
        trainerId,
        clientId,
        clientName: client.name,
        clientEmail: client.email,
      });
    }
    setAssigningClient(null);
    setLoading(false);
    forceUpdate(n => n + 1);
  };

  const handleUnassignTrainer = async (clientId: string) => {
    setLoading(true);
    try {
      await unassignTrainerAPI(clientId);
      toast({ title: 'Trainer unassigned', description: 'Trainer removed from client.' });
    } catch (err: any) {
      if (!isNetworkError(err)) {
        toast({ title: 'API Error', description: err.message, variant: 'destructive' });
      }
    }
    const rel = getClientTrainer(clientId);
    if (rel) removeTrainerClient(rel.trainerId, clientId);
    setLoading(false);
    forceUpdate(n => n + 1);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Add Client Form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> Add New Client
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Client Name" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Fitness Goal" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <button type="submit" className="gradient-primary rounded-lg py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </form>
      </div>

      {/* Client List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">All Clients ({clients.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {clients.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">No clients added yet.</p>}
          {clients.map(client => {
            const trainerRel = getClientTrainer(client.id);
            const trainer = trainerRel ? getTrainerById(trainerRel.trainerId) : undefined;
            const isAssigning = assigningClient === client.id;
            return (
              <div key={client.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/30 text-sm font-bold text-accent-foreground">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.goal || 'No goal'} · {client.email}
                        {trainer ? ` · Trainer: ${trainer.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Assign / Change Trainer button */}
                    <button
                      onClick={() => setAssigningClient(isAssigning ? null : client.id)}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Link className="h-3 w-3" />
                      {trainer ? 'Change Trainer' : 'Assign Trainer'}
                    </button>
                    {trainer && (
                      <button
                        onClick={() => handleUnassignTrainer(client.id)}
                        disabled={loading}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:border-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        Unassign
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleRemove(client.id); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Remove client">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Trainer assignment dropdown */}
                {isAssigning && (
                  <div className="mt-3 flex items-center gap-3 pl-12">
                    <Select onValueChange={(val) => handleAssignTrainer(client.id, val)}>
                      <SelectTrigger className="w-[240px] bg-muted">
                        <SelectValue placeholder="Select a trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name} — {t.specialization}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <button onClick={() => setAssigningClient(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (() => {
        const trainerRel = getClientTrainer(selectedClient.id);
        const trainer = trainerRel ? getTrainerById(trainerRel.trainerId) : undefined;
        const dietPlans = getDietPlansForClient(selectedClient.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedClient(null)}>
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold">Client Profile</h2>
                <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/30 text-xl font-bold text-accent-foreground">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.goal || 'No goal set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{selectedClient.email}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedClient.phone || 'Not set'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Date Joined</p><p className="text-sm font-medium">{selectedClient.dateJoined}</p></div>
                  <div><p className="text-xs text-muted-foreground">Assigned Trainer</p><p className="text-sm font-medium">{trainer ? trainer.name : 'Not assigned'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Join Weight</p><p className="text-sm font-medium">{selectedClient.joinWeight ? `${selectedClient.joinWeight} kg` : 'Not set'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Current Weight</p><p className="text-sm font-medium">{selectedClient.currentWeight ? `${selectedClient.currentWeight} kg` : 'Not set'}</p></div>
                </div>

                {dietPlans.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Diet Plans</p>
                    <div className="space-y-2">
                      {dietPlans.map(plan => (
                        <div key={plan.id} className="rounded-lg bg-muted px-3 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{plan.title}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/20 text-yellow-600'}`}>
                              {plan.status === 'accepted' ? 'Accepted' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </motion.div>
  );
};

export default ClientManagementTab;
