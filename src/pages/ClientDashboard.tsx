import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Utensils, ClipboardCheck, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { getDietPlansForClient, acceptDietPlan, addMealLog, getMealLogs, getClientTrainer, type DietPlan, type MealLog } from '@/services/mockData';

const ClientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'diet' | 'meals'>('profile');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editJoinWeight, setEditJoinWeight] = useState(user?.joinWeight?.toString() || '');
  const [editCurrentWeight, setEditCurrentWeight] = useState(user?.currentWeight?.toString() || '');
  const [, forceUpdate] = useState(0);

  if (!user) return null;

  const dietPlans = getDietPlansForClient(user.id);
  const mealLogs = getMealLogs(user.id);
  const trainerInfo = getClientTrainer(user.id);

  const handleSaveProfile = () => {
    updateProfile({
      name: editName,
      phone: editPhone,
      joinWeight: editJoinWeight ? Number(editJoinWeight) : undefined,
      currentWeight: editCurrentWeight ? Number(editCurrentWeight) : undefined,
    });
    setEditing(false);
  };

  const handleAcceptPlan = (planId: string) => {
    acceptDietPlan(planId);
    forceUpdate(n => n + 1);
  };

  const [mealInput, setMealInput] = useState('');
  const [selectedMealTime, setSelectedMealTime] = useState('Breakfast');

  const handleLogMeal = (followedPlan: boolean) => {
    addMealLog({
      clientId: user.id,
      date: new Date().toISOString().split('T')[0],
      mealTime: selectedMealTime,
      followedPlan,
      actualMeal: followedPlan ? undefined : mealInput,
    });
    setMealInput('');
    forceUpdate(n => n + 1);
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'diet' as const, label: 'Diet Plans', icon: Utensils },
    { key: 'meals' as const, label: 'Meal Tracking', icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-2xl font-bold mb-6">Client Dashboard</h1>

        {/* Tab nav */}
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

        {/* Profile Tab */}
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
                {editing ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                ) : (
                  <p className="text-sm font-medium">{user.name}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email (read-only)</label>
                <p className="text-sm font-medium text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Phone Number</label>
                {editing ? (
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="Enter phone number" />
                ) : (
                  <p className="text-sm font-medium">{user.phone || 'Not set'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Weight at Joining (kg)</label>
                  {editing ? (
                    <input type="number" value={editJoinWeight} onChange={e => setEditJoinWeight(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  ) : (
                    <p className="text-sm font-medium">{user.joinWeight ? `${user.joinWeight} kg` : 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Current Weight (kg)</label>
                  {editing ? (
                    <input type="number" value={editCurrentWeight} onChange={e => setEditCurrentWeight(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  ) : (
                    <p className="text-sm font-medium">{user.currentWeight ? `${user.currentWeight} kg` : 'Not set'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Assigned Trainer</label>
                <p className="text-sm font-medium">{trainerInfo?.clientName ? 'Assigned' : 'No trainer assigned'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Diet Plans Tab */}
        {activeTab === 'diet' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-lg font-semibold">Your Diet Plans</h2>
            {dietPlans.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No diet plans assigned yet. Your trainer will create one for you.
              </div>
            ) : (
              dietPlans.map(plan => (
                <div key={plan.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold">{plan.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${plan.status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
                      {plan.status === 'accepted' ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {plan.meals.map((meal, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-muted-foreground min-w-[80px]">{meal.time}</span>
                        <span>{meal.description}</span>
                      </div>
                    ))}
                  </div>
                  {plan.status === 'pending' && (
                    <button onClick={() => handleAcceptPlan(plan.id)} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <CheckCircle className="h-4 w-4" /> Accept Plan
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Meal Tracking Tab */}
        {activeTab === 'meals' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-display text-lg font-semibold">Meal Tracking</h2>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Meal Time</label>
                <select value={selectedMealTime} onChange={e => setSelectedMealTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                  {['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleLogMeal(true)} className="flex-1 rounded-lg border border-primary bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                  ✅ Followed Diet Plan
                </button>
                <button onClick={() => mealInput ? handleLogMeal(false) : null} className="flex-1 rounded-lg border border-border bg-muted py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  📝 Log Different Meal
                </button>
              </div>
              <input value={mealInput} onChange={e => setMealInput(e.target.value)}
                placeholder="What did you eat instead?"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>

            {/* Logs */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Logs</h3>
              {getMealLogs(user.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">No meals logged yet.</p>
              ) : (
                getMealLogs(user.id).slice(-10).reverse().map(log => (
                  <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
                    <span className="text-muted-foreground min-w-[80px]">{log.mealTime}</span>
                    <span className="text-muted-foreground min-w-[80px]">{log.date}</span>
                    {log.followedPlan ? (
                      <span className="text-primary font-medium">✅ Followed plan</span>
                    ) : (
                      <span>{log.actualMeal}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
