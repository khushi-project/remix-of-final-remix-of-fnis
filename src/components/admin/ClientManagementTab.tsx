import React, { useState } from 'react';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Client {
  id: string;
  name: string;
  email: string;
  goal: string;
}

const seedClients: Client[] = [
  { id: 'client-1', name: 'Sarah Miller', email: 'sarah@example.com', goal: 'Weight Loss' },
  { id: 'client-2', name: 'John Doe', email: 'john@example.com', goal: 'Muscle Gain' },
  { id: 'client-3', name: 'Emily Chen', email: 'emily@example.com', goal: 'General Fitness' },
  { id: 'client-4', name: 'Mike Ross', email: 'mike@example.com', goal: 'Endurance Training' },
];

const ClientManagementTab = () => {
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');

  const addClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !goal.trim()) return;
    setClients(prev => [...prev, {
      id: `client-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      goal: goal.trim(),
    }]);
    setName('');
    setEmail('');
    setGoal('');
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Add Client Form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> Add New Client
        </h2>
        <form onSubmit={addClient} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Client Name" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input type="number" value={email} onChange={e => setEmail(e.target.value)} placeholder="Number" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
          <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Fitness Goal" required className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
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
          {clients.map(client => (
            <div key={client.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/30 text-sm font-bold text-accent-foreground">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.goal} · {client.email}</p>
                </div>
              </div>
              <button onClick={() => removeClient(client.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Remove client">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ClientManagementTab;
