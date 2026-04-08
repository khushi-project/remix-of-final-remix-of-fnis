import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Users, Utensils, Edit2, Save, X, Trash2 } from 'lucide-react';
import {
  getTrainerClients,
  getDietPlansForTrainer, addDietPlan, updateDietPlan,
  updateTrainer,
  type DietPlan
} from '@/services/mockData';

const TrainerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'clients' | 'diet'>('profile');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editSpec, setEditSpec] = useState(user?.specialization || '');
  const [, forceUpdate] = useState(0);

  // Add client form
  const [selectedClientId, setSelectedClientId] = useState('');

  // Diet plan form
  const [dpTitle, setDpTitle] = useState('');
  const [dpClientId, setDpClientId] = useState('');
  const [dpMeals, setDpMeals] = useState<{ time: string; description: string }[]>([{ time: 'Breakfast', description: '' }]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPlanMeals, setEditPlanMeals] = useState<{ time: string; description: string }[]>([]);

  if (!user) return null;

  const clients = getTrainerClients(user.id);
  const dietPlans = getDietPlansForTrainer(user.id);
  const allClients = getClients();

  // Clients not yet assigned to this trainer
  const assignableClients = allClients.filter(c => !clients.find(tc => tc.clientId === c.id));

  const handleSaveProfile = () => {
    updateProfile({ name: editName, phone: editPhone, specialization: editSpec });
    // Also update trainer store
    updateTrainer(user.id, { name: editName, phone: editPhone, specialization: editSpec });
    setEditing(false);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    const client = allClients.find(c => c.id === selectedClientId);
    if (!client) return;
    addTrainerClient({
      trainerId: user.id,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
    });
    setSelectedClientId('');
    forceUpdate(n => n + 1);
  };

  const handleRemoveClient = (clientId: string) => {
    removeTrainerClient(user.id, clientId);
    forceUpdate(n => n + 1);
  };

  const handleCreateDietPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpTitle.trim() || !dpClientId) return;
    addDietPlan({ trainerId: user.id, clientId: dpClientId, title: dpTitle, meals: dpMeals.filter(m => m.description) });
    setDpTitle(''); setDpClientId('');
    setDpMeals([{ time: 'Breakfast', description: '' }]);
    forceUpdate(n => n + 1);
  };

  const handleStartEditPlan = (plan: DietPlan) => {
    setEditingPlan(plan.id);
    setEditPlanMeals([...plan.meals]);
  };

  const handleSavePlanEdit = (planId: string) => {
    updateDietPlan(planId, { meals: editPlanMeals.filter(m => m.description) });
    setEditingPlan(null);
    forceUpdate(n => n + 1);
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'clients' as const, label: `Clients (${clients.length})`, icon: Users },
    { key: 'diet' as const, label: `Diet Plans (${dietPlans.length})`, icon: Utensils },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-2xl font-bold mb-2">Trainer Dashboard</h1>
        <div className="flex gap-4 mb-6">
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm">
            <span className="text-muted-foreground">Total Clients:</span> <span className="font-bold text-primary">{clients.length}</span>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm">
            <span className="text-muted-foreground">Active Plans:</span> <span className="font-bold text-primary">{dietPlans.length}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.key ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Profile Details</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-primary hover:underline"><Edit2 className="h-4 w-4" /> Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 text-sm text-primary hover:underline"><Save className="h-4 w-4" /> Save</button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"><X className="h-4 w-4" /> Cancel</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                {editing ? <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" /> : <p className="text-sm font-medium">{user.name}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email (read-only)</label>
                <p className="text-sm font-medium text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Phone Number</label>
                {editing ? <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="Enter phone" /> : <p className="text-sm font-medium">{user.phone || 'Not set'}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Specialization</label>
                {editing ? <input value={editSpec} onChange={e => setEditSpec(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="e.g. Weight Loss, Strength Training" /> : <p className="text-sm font-medium">{user.specialization || 'Not set'}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-semibold mb-4">My Clients ({clients.length})</h3>
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients assigned yet. Admin will assign clients to you.</p>
              ) : (
                <div className="space-y-2">
                  {clients.map(c => (
                    <div key={c.clientId} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {c.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.clientName}</p>
                        <p className="text-xs text-muted-foreground">{c.clientEmail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Diet Plans */}
        {activeTab === 'diet' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleCreateDietPlan} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-display font-semibold">Create Diet Plan</h3>
              <input value={dpTitle} onChange={e => setDpTitle(e.target.value)} placeholder="Plan Title" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              <select value={dpClientId} onChange={e => setDpClientId(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.clientId} value={c.clientId}>{c.clientName}</option>)}
              </select>
              {dpMeals.map((meal, i) => (
                <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
                  <select value={meal.time} onChange={e => { const m = [...dpMeals]; m[i].time = e.target.value; setDpMeals(m); }}
                    className="rounded-lg border border-border bg-muted px-2 py-2 text-sm text-foreground outline-none focus:border-primary">
                    {['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input value={meal.description} onChange={e => { const m = [...dpMeals]; m[i].description = e.target.value; setDpMeals(m); }}
                    placeholder="Meal description" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  <button type="button" onClick={() => setDpMeals(dpMeals.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setDpMeals([...dpMeals, { time: 'Breakfast', description: '' }])} className="text-sm text-primary hover:underline">+ Add Meal</button>
              <button type="submit" className="w-full rounded-lg bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">Create Plan</button>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Existing Plans ({dietPlans.length})</h3>
              {dietPlans.map(plan => {
                const clientName = clients.find(c => c.clientId === plan.clientId)?.clientName || 'Unknown';
                return (
                  <div key={plan.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-display font-semibold">{plan.title}</h4>
                        <p className="text-xs text-muted-foreground">For: {clientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${plan.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{plan.status}</span>
                        {editingPlan !== plan.id && (
                          <button onClick={() => handleStartEditPlan(plan)} className="text-sm text-primary hover:underline"><Edit2 className="h-3 w-3" /></button>
                        )}
                      </div>
                    </div>
                    {editingPlan === plan.id ? (
                      <div className="space-y-2">
                        {editPlanMeals.map((meal, i) => (
                          <div key={i} className="grid grid-cols-[120px_1fr] gap-2">
                            <input value={meal.time} onChange={e => { const m = [...editPlanMeals]; m[i].time = e.target.value; setEditPlanMeals(m); }} className="rounded-lg border border-border bg-muted px-2 py-2 text-sm text-foreground outline-none" />
                            <input value={meal.description} onChange={e => { const m = [...editPlanMeals]; m[i].description = e.target.value; setEditPlanMeals(m); }} className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none" />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={() => handleSavePlanEdit(plan.id)} className="text-sm text-primary hover:underline">Save</button>
                          <button onClick={() => setEditingPlan(null)} className="text-sm text-muted-foreground hover:underline">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {plan.meals.map((meal, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground min-w-[100px]">{meal.time}</span>
                            <span>{meal.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrainerDashboard;
